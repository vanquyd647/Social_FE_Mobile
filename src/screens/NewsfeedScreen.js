import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, Button, TouchableOpacity, Alert, Image, Modal, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getPostsThunk, createPostThunk, likePostThunk, addCommentThunk } from '../store/slices/postSlice';
import { FontAwesome, MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';

import { uploadImageAsync } from '../components/uploadImage';
import { getUser } from '../store/slices/authSlice'; 

const NewsfeedScreen = () => {
    const dispatch = useDispatch();
    const { posts, loading, error } = useSelector((state) => state.posts);
    const { user } = useSelector((state) => state.auth);

    const [newPostContent, setNewPostContent] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [comment, setComment] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true); 

    useFocusEffect(
        useCallback(() => {
            const initializeData = async () => {
                await fetchUserData(); // Đảm bảo fetchUserData hoàn thành trước
                setLoadingUser(false); // Hoàn tất tải dữ liệu người dùng
                fetchPosts();
            };
            initializeData();
        }, [])
    );

    
    const fetchUserData = async () => {
        await dispatch(getUser()); // Giả sử `getUser` đã trả về một Promise
    };
    
    const fetchPosts = () => {
        dispatch(getPostsThunk());
    };

    const handleOpenModal = () => setIsModalVisible(true);
    const handleCloseModal = () => {
        setIsModalVisible(false);
        setNewPostContent('');
        setSelectedFile(null);
    };

    const showAlert = (title, message) => {
        Alert.alert(title, message, [{ text: 'OK' }]);
    };

    const handleCreatePost = async () => {
        if (!newPostContent && !selectedFile) {
            showAlert('Error', 'Please enter content or select an image/video');
            return;
        }

        setIsPosting(true); // Bắt đầu xử lý, chặn nút
        let fileUrl = null;

        if (selectedFile) {
            try {
                fileUrl = await uploadImageAsync(selectedFile.uri);
                console.log("fileUrl", fileUrl);
            } catch (error) {
                console.error("Upload Error:", error); // Log the actual error
                showAlert('Error', 'Failed to upload file');
                setIsPosting(false); // Đặt lại trạng thái
                return;
            }
        }

        const postData = {
            content: newPostContent,
            media_urls: fileUrl,
        };

        try {
            await dispatch(createPostThunk(postData));
            setNewPostContent('');
            setSelectedFile(null);
            fetchPosts();
            handleCloseModal();
        } catch (err) {
            console.log("err", err);
            showAlert('Error', 'Failed to create post');
        } finally {
            setIsPosting(false); // Đặt lại trạng thái sau khi hoàn tất
        }
    };

    const selectFile = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                showAlert('Permission required', 'Permission to access media library is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.cancelled) {
                console.log("result", result);
                const uri = result.assets[0].uri
                console.log('uri', uri);
                setSelectedFile({
                    uri: uri,
                    fileName: "file_" + Date.now(),
                    type: result.type || 'unknown',
                });
                showAlert('Success', 'File selected successfully!');
            }
        } catch (error) {
            console.error('Error selecting file: ', error);
            showAlert('Error', 'Unexpected error occurred while selecting a file');
        }
    };

    const handleLikePost = async (postId) => {
        await dispatch(likePostThunk({ postId, userId: 'user_id' }));
        fetchPosts();
    };

    const handleAddComment = async (postId) => {
        if (!comment) {
            showAlert('Error', 'Please enter a comment');
            return;
        }

        const commentData = { content: comment };
        try {
            await dispatch(addCommentThunk({ postId, commentData }));
            setSelectedPost((prevPost) => ({
                ...prevPost,
                comments: [
                    ...prevPost.comments,
                    { ...commentData, author_id: { username: 'You' } },
                ],
            }));
            setComment('');
        } catch (err) {
            showAlert('Error', 'Failed to add comment');
        }
    };

    // Function to handle refreshing
    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
        setRefreshing(false);
    };

    // if (loading) {
    //     return (
    //         <View style={styles.center}>
    //             <ActivityIndicator size="large" color="#007bff" />
    //         </View>
    //     );
    // }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    if (loadingUser) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Anh I Tờơ...</Text>
            {/* Create Post Section */}
            <View style={styles.createPostButtonContainer}>
                <TouchableOpacity style={styles.createPostButton} onPress={handleOpenModal}>
                    <Ionicons name="create-outline" size={24} color="white" />
                    {/* <Text style={styles.createPostButtonText}>Create Post</Text> */}
                </TouchableOpacity>
                {user && user.avatar_url ? (
                    <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                ) : (
                    <Text style={styles.avatar}>No Avatar</Text>
                )}
            </View>
            {/* Post List */}
            <FlatList
                data={[...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.postContainer}>
                        <View style={styles.postHeader}>
                            <Image source={{ uri: item.author_id.avatar_url || 'https://placehold.co/50x50' }} style={styles.avatar_post} />
                            <Text style={styles.username}>{item.author_id.username}</Text>
                        </View>
                        <Text style={styles.postContent}>{item.content}</Text>
                        {Array.isArray(item.media_urls) && item.media_urls.length > 0 ? (
                            item.media_urls[0].endsWith('.mp4') || item.media_urls[0].endsWith('.mov') ? (
                                <Video
                                    source={{ uri: item.media_urls[0] }}
                                    style={{ width: '100%', height: 200, marginBottom: 10 }}
                                    resizeMode="contain"
                                    shouldPlay={false}
                                    useNativeControls={true}
                                />
                            ) : (
                                <Image
                                    source={{ uri: item.media_urls[0] }}
                                    style={{ width: '100%', height: 200, marginBottom: 10 }}
                                />
                            )
                        ) : null}
                        {/* Action Buttons */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity onPress={() => handleLikePost(item._id)}>
                                <FontAwesome name="thumbs-up" size={20} color="#007bff" />
                                <Text style={styles.actionText}>{item.likes.length} Like</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setSelectedPost(item)}>
                                <MaterialIcons name="comment" size={20} color="#007bff" />
                                <Text style={styles.actionText}>{item.comments.length} Comments</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing} // Bind the refreshing state
                        onRefresh={onRefresh}  // Trigger on refresh
                        colors={['#007bff']} // Optional: Set the color of the refresh indicator
                    />
                }
            />

            {/* Comment Modal */}
            <Modal visible={!!selectedPost} animationType="slide" onRequestClose={() => setSelectedPost(null)}>
                <View style={styles.modalContainer}>
                    <Button title="Close" onPress={() => setSelectedPost(null)} />
                    {selectedPost && (
                        <>
                            <Text style={styles.modalHeader}>Comments</Text>
                            <FlatList
                                data={selectedPost.comments}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.commentBubble}>
                                        <Text style={styles.commentAuthor}>{item.author_id?.username || 'Anonymous'}</Text>
                                        <Text style={styles.commentText}>{item.content}</Text>
                                    </View>
                                )}
                            />
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment..."
                                value={comment}
                                onChangeText={setComment}
                            />
                            <Button title="Send" onPress={() => handleAddComment(selectedPost._id)} />
                        </>
                    )}
                </View>
            </Modal>
            {/* Create Post Modal */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={handleCloseModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Create a Post</Text>
                        <TextInput
                            style={{ height: 100, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
                            placeholder="What's on your mind?"
                            value={newPostContent}
                            onChangeText={setNewPostContent}
                        />
                        {selectedFile && (
                            <View style={styles.filePreview}>
                                <Text>{selectedFile.fileName}</Text>
                                <Button title="Remove" onPress={() => setSelectedFile(null)} />
                            </View>
                        )}
                        <Button title="Choose File" onPress={selectFile} />
                        <View style={styles.modalActions}>
                            <Button title="Cancel" onPress={handleCloseModal} color="red" />
                            <Button
                                title="Post"
                                onPress={handleCreatePost}
                                disabled={isPosting} // Vô hiệu hóa nút nếu đang xử lý
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f0f2f5',
    },
    header: {
        color: '#00008b',
        fontSize: 24,
        fontWeight: 'bold',
        fontStyle: 'normal',
        textAlign: 'center',
    },
    createPostContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
    },
    avatar_post: {
        width: 50,
        height: 50,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#007bff',
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 10,
        marginRight: 10,
    },
    postContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        padding: 16,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    postContent: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    actionText: {
        fontSize: 14,
        color: '#007bff',
        marginLeft: 5,
    },
    modalContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    commentBubble: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    commentAuthor: {
        fontWeight: 'bold',
    },
    commentText: {
        fontSize: 14,
        color: '#333',
    },
    commentInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 10,
        marginTop: 10,
    },
    errorText: {
        color: 'red',
    },
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    createPostButtonContainer: {
        marginBottom: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    createPostButton: {
        flexDirection: 'row',
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    createPostButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 30,
        backgroundColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#007bff',
    },
});

export default NewsfeedScreen;

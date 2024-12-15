import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, RefreshControl, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import {
    getFriendsList,
    searchUsers,
    sendFriendRequest,
    getSentRequests,
    getReceivedRequests,
    acceptFriendRequest,
    removeFriend
} from '../store/slices/friendSlice';
import { createChatRoom, getUserChats, setCurrentChatRoom } from '../store/slices/chatSlice';

const FriendsScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { friends, users, sentRequests, receivedRequests, loading, error, userId } = useSelector((state) => state.friends);
    console.log('userId:', userId);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Fetch các danh sách khi màn hình được tải
    useFocusEffect(
        useCallback(() => {
            dispatch(getFriendsList());
            dispatch(getSentRequests());
            dispatch(getReceivedRequests());
        }, [dispatch])
    );

    // Xử lý tìm kiếm người dùng
    const handleSearch = () => {
        if (searchQuery.trim()) {
            dispatch(searchUsers(searchQuery));
        }
    };

    // Xử lý gửi lời mời kết bạn
    const handleSendRequest = async (userId) => {
        await dispatch(sendFriendRequest(userId));
        dispatch(getSentRequests());
    };

    // Xử lý chấp nhận yêu cầu kết bạn
    const handleAcceptRequest = async (userId) => {
        await dispatch(acceptFriendRequest(userId));
        dispatch(getFriendsList());
        dispatch(getReceivedRequests());
    };

    // Xử lý hủy hoặc từ chối yêu cầu kết bạn
    const handleRemoveRequest = async (userId) => {
        await dispatch(removeFriend(userId));
        dispatch(getFriendsList());
        dispatch(getSentRequests());
        dispatch(getReceivedRequests());
    };


    const handleChat = async (friendId) => {
        // Tạo dữ liệu chat với người bạn đã chọn
        const chatData = {
            members: [friendId._id], // ID của bạn sẽ tự động được thêm vào trong server
        };
        try {
            // Gọi action để tạo phòng chat và nhận phản hồi từ server
            const response = await dispatch(createChatRoom(chatData)).unwrap();
            // Sau khi tạo phòng chat thành công, lấy danh sách phòng chat cập nhật
            // await dispatch(getUserChats());
            // Nếu bạn cần xử lý thêm phản hồi, ví dụ như thông báo hoặc điều hướng đến phòng chat mới
            console.log('Chat room created:', response.chatRoom);
            const chatRoomData = {
                chatRoomId: response.chatRoom._id,
                userId,
                displayName: response.chatRoom.displayName,
                avatar: response.chatRoom.avatar,
            };
            // Nếu có thể, có thể điều hướng người dùng đến phòng chat vừa tạo:
            // history.push(`/chat/${response.chatRoom._id}`);
            navigation.navigate('ChatRoom', {
                chatRoomId: chatRoomData.chatRoomId,
                userId,
                chatRoomName: chatRoomData.displayName,
                avatar: chatRoomData.avatar
            });
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error('Failed to create chat room:', error);
        }
    };

    // Function to handle refreshing
    const onRefresh = () => {
        setRefreshing(true);
        dispatch(getFriendsList());
        dispatch(getSentRequests());
        dispatch(getReceivedRequests());
        setRefreshing(false);
    };

    const handleSelectChatRoom = (friend) => {
        // Assuming the friend object contains an avatar and username as part of chat data
        const chatRoomData = {
            chatRoomId: friend.chatRoom._id,
            userId: userId,
            displayName: friend.username,
            avatar: friend.avatar_url,
        };

        // Dispatch action to set the current chat room
        dispatch(setCurrentChatRoom(chatRoomData));

        // Navigate to the Chat Room screen, passing chatRoomId, userId, chatRoomName, and avatar as params
        navigation.navigate('ChatRoom', {
            chatRoomId: chatRoomData.chatRoomId,
            userId,
            chatRoomName: chatRoomData.displayName,
            avatar: chatRoomData.avatar
        });
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Friends</Text>

            {/* Tìm kiếm bạn bè */}
            <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
            />

            {/* Hiển thị kết quả tìm kiếm */}
            {searchQuery && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Search Results:</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#007bff" />
                    ) : (
                        <FlatList
                            data={users}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <View style={styles.userItem}>
                                    <Text style={styles.username}>{item.username || item.email}</Text>
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => handleSendRequest(item._id)}
                                    >
                                        <Text style={styles.addButtonText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    )}
                </View>
            )}

            {/* Hiển thị danh sách yêu cầu đã nhận */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Received Requests:</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                ) : (
                    <FlatList
                        data={receivedRequests}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={styles.userItem}>
                                <Text style={styles.username}>{item.username}</Text>
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => handleAcceptRequest(item._id)}
                                >
                                    <Text style={styles.acceptButtonText}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    onPress={() => handleRemoveRequest(item._id)}
                                >
                                    <Text style={styles.rejectButtonText}>Decline</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#007bff']}
                            />
                        }
                    />
                )}
            </View>

            {/* Hiển thị danh sách yêu cầu đã gửi */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sent Requests:</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                ) : (
                    <FlatList
                        data={sentRequests}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={styles.userItem}>
                                <Text style={styles.username}>{item.username}</Text>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => handleRemoveRequest(item._id)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#007bff']}
                            />
                        }
                    />
                )}
            </View>

            {/* Hiển thị danh sách bạn bè */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Friends:</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                ) : (
                    <FlatList
                        data={friends}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={styles.friendItem}>
                                <View>
                                    <Pressable
                                        onPress={() => {
                                            if (item.chatRoom?._id) {
                                                handleSelectChatRoom(item);
                                            } else {
                                                handleChat(item);
                                            }
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image
                                                source={{ uri: item.avatar_url }}
                                                style={{ width: 50, height: 50, borderRadius: 30, marginRight: 10 }}
                                            />
                                            <Text style={styles.username}>{item.username}</Text>
                                        </View>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#007bff']}
                            />
                        }
                    />
                )}
            </View>
            {/* Hiển thị lỗi nếu có */}
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    username: {
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 5,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    acceptButton: {
        backgroundColor: '#28a745',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 5,
        marginRight: 5,
    },
    acceptButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    rejectButton: {
        backgroundColor: '#dc3545',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 5,
    },
    rejectButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#ffc107',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 5,
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    friendItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    errorText: {
        color: 'red',
        marginTop: 10,
    },
});

export default FriendsScreen;

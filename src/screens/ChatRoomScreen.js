import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { receiveMessage, getMessagesInRoom } from '../store/slices/messageSlice';
import { getUser } from '../store/slices/authSlice';
import { io } from 'socket.io-client';

const ChatRoomScreen = ({ route, navigation }) => {
    const { chatRoomId, userId, recipient_id, chatRoomName, avatar } = route.params;
    const [newMessage, setNewMessage] = useState('');
    const [isAtBottom, setIsAtBottom] = useState(true); // State kiểm tra vị trí cuộn
    const dispatch = useDispatch();

    const Recipient_id = recipient_id;

    const { user } = useSelector((state) => state.auth);
    // Lấy tin nhắn từ Redux
    const { rooms } = useSelector((state) => state.messages);
    const room = rooms[chatRoomId] || { messages: [], cursor: null, hasMore: true };
    const { messages, cursor, hasMore } = room;

    const flatListRef = useRef();
    const socket = io('https://social-be-hyzv.onrender.com'); //https://social-be-hyzv.onrender.com

    useEffect(() => {
        // Chỉ gọi API nếu thông tin người dùng chưa được tải
        if (!user) {
            dispatch(getUser());
        }
        
        if (!rooms[chatRoomId]?.messages.length) {
            dispatch(getMessagesInRoom({ roomId: chatRoomId, cursor: null }));
        }
    
        socket.emit('joinRoom', chatRoomId);
        socket.on('receiveMessage', (message) => {
            dispatch(receiveMessage({ roomId: chatRoomId, message }));
        });
    
        return () => socket.disconnect();
    }, [chatRoomId, dispatch, user]); // user phụ thuộc để chỉ load một lần
    

    console.log('userId', userId);
    console.log("user", user);
    console.log("Recipient_id", Recipient_id);

    // Chỉ cuộn xuống khi người dùng đang ở cuối danh sách
    useEffect(() => {
        if (isAtBottom && flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
    }, [messages, isAtBottom]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                room_id: chatRoomId,
                sender_id: userId,
                sender_name: user.username,
                content: newMessage,
                timestamp: new Date(),
            };

            socket.emit('sendMessage', message);
            setNewMessage('');
        }
    };

    const loadMoreMessages = () => {
        if (hasMore && !rooms[chatRoomId]?.loadingFetch) {
            dispatch(getMessagesInRoom({ roomId: chatRoomId, cursor }));
        }
    };

    // Kiểm tra người dùng có ở vị trí cuối cùng không
    const handleScroll = (event) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const isNearBottom =
            contentOffset.y <= layoutMeasurement.height - contentSize.height + 20;
        setIsAtBottom(isNearBottom);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
                <Image source={{ uri: avatar }} style={styles.avatar} />
                <Text style={styles.headerText}>{chatRoomName}</Text>
            </View>

            {rooms[chatRoomId]?.loadingFetch ? (
                <Text>Loading...</Text>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index) => `${item.room_id}-${item._id || index}`}
                    inverted
                    onEndReached={loadMoreMessages}
                    onEndReachedThreshold={0.1}
                    onScroll={handleScroll} // Theo dõi vị trí cuộn
                    renderItem={({ item }) => {
                        const isSentByCurrentUser = item.sender_id === userId;
                        return (
                            <View
                                style={[
                                    styles.message,
                                    isSentByCurrentUser
                                        ? styles.sentMessage
                                        : styles.receivedMessage,
                                ]}
                            >
                                <Text style={styles.messageText}>{item.content}</Text>
                            </View>
                        );
                    }}
                    ListFooterComponent={
                        rooms[chatRoomId]?.loadingFetch ? <ActivityIndicator size="small" /> : null
                    }
                />
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message"
                />
                <Button title="Send" onPress={handleSendMessage} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'white',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    avatar: {
        width: 35,
        height: 35,
        borderRadius: 30,
        marginRight: 10,
        marginLeft: 10,
    },
    message: { padding: 10, margin: 5, borderRadius: 5 },
    sentMessage: { backgroundColor: '#d1f7d6', alignSelf: 'flex-end' },
    receivedMessage: { backgroundColor: '#f7d1d1', alignSelf: 'flex-start' },
    messageText: { fontSize: 16 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10 },
});

export default ChatRoomScreen;

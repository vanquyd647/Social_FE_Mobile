import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, Image, RefreshControl, Pressable } from 'react-native';
import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getUserChats, setCurrentChatRoom } from '../store/slices/chatSlice';

const ChatListScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  // Access Redux state
  const { chatRooms, loading, error, userId } = useSelector((state) => state.chats);

  // Local state for handling pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Fetch chat rooms when the screen is focused
  useFocusEffect(
    useCallback(() => {
      dispatch(getUserChats());
    }, [dispatch])
  );

  // Function to handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    dispatch(getUserChats())
      .unwrap() // .unwrap() giúp bạn xử lý thành công hoặc lỗi trực tiếp
      .finally(() => setRefreshing(false));
  };

  const handleSelectChatRoom = (chatRoom) => {
    // Dispatch action to set the current chat room
    dispatch(setCurrentChatRoom(chatRoom));

    // Navigate to the Chat Room screen, passing chatRoomId and userId as params
    navigation.navigate('ChatRoom', { chatRoomId: chatRoom._id, userId, chatRoomName: chatRoom.displayName, avatar: chatRoom.avatar });
  };

  const renderItem = ({ item }) => (
    <View style={styles.chatRoomItem}>
      <Pressable onPress={() => handleSelectChatRoom(item)}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={{ uri: item.avatar }} style={{ width: 50, height: 50, borderRadius: 30, marginRight: 10 }} />
          <Text style={{ fontSize: 25 }}>{item.displayName}</Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}  // Trigger refresh when user pulls down
              colors={['#007bff']}  // Optional: Set the color of the refresh indicator
            />
          }
        />
      )}
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
  chatRoomItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatRoomName: {
    fontSize: 18,
  },
  chatLink: {
    color: 'blue',
    marginTop: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ChatListScreen;

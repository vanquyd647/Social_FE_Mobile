import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead, clearError } from '../store/slices/notificationSlice';
import { useIsFocused } from '@react-navigation/native';

const NotificationsScreen = () => {
    const dispatch = useDispatch();
    const { notifications, loading, error } = useSelector((state) => state.notifications);
    const isFocused = useIsFocused();

    // Fetch notifications when the screen is focused
    useEffect(() => {
        if (isFocused) {
            dispatch(fetchNotifications());
        }
    }, [isFocused, dispatch]);

    // Handle errors
    useEffect(() => {
        if (error) {
            Alert.alert('Error', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
        }
    }, [error, dispatch]);

    const handleMarkAsRead = (notificationId) => {
        dispatch(markNotificationAsRead(notificationId));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Notifications</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.notificationItem,
                                item.is_read ? styles.read : styles.unread,
                            ]}
                            onPress={() => !item.is_read && handleMarkAsRead(item._id)}
                        >
                            <Text
                                style={[
                                    styles.notificationTitle,
                                    !item.is_read && styles.unreadTitle,
                                ]}
                            >
                                {item.title}
                            </Text>
                            <Text style={styles.notificationBody}>{item.body}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    notificationItem: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#fff',
        elevation: 1,
    },
    read: {
        opacity: 0.7,
    },
    unread: {
        borderLeftWidth: 4,
        borderLeftColor: '#007bff',
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    unreadTitle: {
        fontWeight: 'bold',
        color: '#000',
    },
    notificationBody: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
});

export default NotificationsScreen;

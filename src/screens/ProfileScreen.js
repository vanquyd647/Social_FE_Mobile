import { View, Text, StyleSheet, Image, Button, ScrollView, RefreshControl } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, getUser } from '../store/slices/authSlice'; // Import logout và getUser action

const ProfileScreen = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false); // State để kiểm soát RefreshControl

    const dispatch = useDispatch(); // Initialize dispatch for Redux

    // Lấy dữ liệu người dùng từ Redux store
    const { user, token, isAuthenticated } = useSelector((state) => state.auth);

    const fetchUserData = async () => {
        setLoading(true); // Bắt đầu trạng thái loading
        setError(null); // Reset error

        if (token && isAuthenticated) {
            try {
                await dispatch(getUser());
            } catch (err) {
                setError('Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [dispatch, token, isAuthenticated]) // Hook sẽ chạy lại khi các giá trị này thay đổi
    );

    console.log("user", user);

    const handleLogout = () => {
        dispatch(logout()); // Dispatch logout action to clear user data and token
    };

    const onRefresh = async () => {
        setRefreshing(true); // Bắt đầu trạng thái refreshing
        await fetchUserData(); // Gọi lại API để lấy dữ liệu
        setRefreshing(false); // Kết thúc trạng thái refreshing
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text>{error}</Text>
                <Button title="Logout" onPress={handleLogout} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>No user data available</Text>
            </View>
            
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.profileHeader}>
                {user.avatar_url ? (
                    <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                ) : (
                    <Text style={styles.avatar}>No Avatar</Text>
                )}
                <Text style={styles.username}>{user.username}</Text>
            </View>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.bio}>{user.bio || 'No bio available'}</Text>

            {/* Logout Button */}
            <Button title="Logout" onPress={handleLogout} />
        </ScrollView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 16,
        color: '#888',
        marginBottom: 10,
    },
    bio: {
        fontSize: 16,
        color: '#555',
    },
});

export default ProfileScreen;

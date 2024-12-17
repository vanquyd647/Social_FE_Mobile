import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import { login } from '../store/slices/authSlice';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    // Inside your component
    const handleLogin = async () => {
        try {
            // Lấy Firebase Token
            const firebaseToken = await messaging().getToken();

            // Dispatch action login với Firebase Token
            const result = await dispatch(
                login({
                    email,
                    password,
                    firebaseToken, // Gửi Firebase Token lên server
                })
            );

            if (login.fulfilled.match(result)) {
                navigation.replace('MainTabs');
            } else {
                Alert.alert('Login Failed', result.payload || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error getting Firebase Token:', error);
            Alert.alert('Error', 'Failed to get notification token');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <View style={{ marginTop: 20, padding: 10 }}>
                <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} />
                {error && <Text style={styles.error}>{error}</Text>}
                <View style={{ marginTop: 8 }}></View>
                <Button
                    title="Forgot Password?"
                    onPress={() => navigation.navigate('ForgotPasswordScreen')}
                />
                <View style={{ marginTop: 8 }}></View>
                <Button
                    title="Don't have an account? Register"
                    onPress={() => navigation.navigate('RegisterScreen')}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4 },
    error: { color: 'red', marginTop: 8 },
});

export default LoginScreen;

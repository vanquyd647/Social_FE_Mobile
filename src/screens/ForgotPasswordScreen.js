import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { sendResetPasswordOtp, resetPasswordWithOtp } from '../store/slices/authSlice';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [stage, setStage] = useState('request'); // 'request' hoặc 'reset'
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    // Gửi OTP
    const handleRequestOtp = async () => {
        const result = await dispatch(sendResetPasswordOtp({ email }));
        if (sendResetPasswordOtp.fulfilled.match(result)) {
            Alert.alert('OTP Sent', 'Check your email for the OTP.');
            setStage('reset');  // Chuyển sang bước reset mật khẩu
        } else {
            Alert.alert('Error', result.payload || 'Something went wrong');
        }
    };

    // Đặt lại mật khẩu sau khi xác thực OTP
    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match!');
            return;
        }

        const result = await dispatch(resetPasswordWithOtp({ email, otp, newPassword }));
        if (resetPasswordWithOtp.fulfilled.match(result)) {
            Alert.alert('Success', 'Password has been reset.');
            navigation.replace('LoginScreen');  // Quay lại màn hình đăng nhập
        } else {
            Alert.alert('Error', result.payload || 'Something went wrong');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>
            {stage === 'request' ? (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <Button
                        title={loading ? 'Sending OTP...' : 'Send OTP'}
                        onPress={handleRequestOtp}
                        disabled={loading}
                    />
                    {error && <Text style={styles.error}>{error}</Text>}
                </>
            ) : (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter OTP"
                        value={otp}
                        onChangeText={setOtp}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                    <Button
                        title={loading ? 'Resetting Password...' : 'Reset Password'}
                        onPress={handleResetPassword}
                        disabled={loading}
                    />
                    {error && <Text style={styles.error}>{error}</Text>}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4 },
    error: { color: 'red', marginTop: 8 },
});

export default ForgotPasswordScreen;

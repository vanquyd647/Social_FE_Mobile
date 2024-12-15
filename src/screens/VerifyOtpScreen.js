import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { verifyOtp } from '../store/slices/authSlice';

const VerifyOtpScreen = ({ navigation, route }) => {
    const [otp, setOtp] = useState('');
    const dispatch = useDispatch();
    const { email } = route.params; // Nhận email từ màn hình đăng ký

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter the OTP.');
            return;
        }

        const result = await dispatch(verifyOtp({ email, otp }));
        if (verifyOtp.fulfilled.match(result)) {
            Alert.alert('Success', 'OTP verified. You can now log in.');
            navigation.navigate('LoginScreen');
        } else {
            Alert.alert('Verification Failed', result.payload || 'Something went wrong.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify OTP</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
            />
            <Button title="Verify" onPress={handleVerifyOtp} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4 },
});

export default VerifyOtpScreen;

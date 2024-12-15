import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, showAlert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';
import { register } from '../store/slices/authSlice';

import { uploadImageAsync } from '../components/uploadImage';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [bio, setBio] = useState('');
    const dispatch = useDispatch();

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const avatarUrl = selectedFile ? await uploadImageAsync(selectedFile.uri) : "https://firebasestorage.googleapis.com/v0/b/red89-f8933.appspot.com/o/Social_app%2Favatar.png?alt=media&token=081b5305-d9eb-4dc1-86ad-e9e106758550";

        const result = await dispatch(register({ username, email, password, avatar_url: avatarUrl, bio }));
        if (register.fulfilled.match(result)) {
            Alert.alert('Success', 'OTP sent to your email. Verify your account.');
            navigation.navigate('VerifyOtpScreen', { email });
        } else {
            Alert.alert('Registration Failed', result.payload || 'Something went wrong');
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
            }
        } catch (error) {
            console.log('Error selecting file: ', error);
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Bio (Optional)"
                value={bio}
                onChangeText={setBio}
            />
            <View style={{padding:10}}>
                {selectedFile && (
                    <View style={styles.filePreview}>
                        <Text>{selectedFile.fileName}</Text>
                        <View style={{ marginTop: 5 }}></View>
                        <Button title="Remove" onPress={() => setSelectedFile(null)} />
                    </View>
                )}
                <View style={{ marginTop: 5 }}></View>
                <Button title="Choose Avatar image" onPress={selectFile} />
            </View>
            <View style={{ marginTop: 20, padding: 10 }}>
                <Button title="Register" onPress={handleRegister} />
                <View style={{ marginTop: 5 }}></View>
                <Button
                    title="Already have an account? Login"
                    onPress={() => navigation.navigate('LoginScreen')}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4 },
});

export default RegisterScreen;

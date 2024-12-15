import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from '../store';
import { restoreSession } from '../store/slices/authSlice';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabs from './MainTabs';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';

const Stack = createNativeStackNavigator();

// Kiểm tra trạng thái đăng nhập và render màn hình phù hợp
const RootNavigator = () => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Dispatch restore session when the app starts
    useEffect(() => {
        dispatch(restoreSession());
    }, [dispatch]);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <>
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                    <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="LoginScreen" component={LoginScreen} />
                    <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                    <Stack.Screen name="VerifyOtpScreen" component={VerifyOtpScreen} />
                    <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};

const App = () => {
    return (
        <Provider store={store}>

            <RootNavigator />

        </Provider>
    );
};

export default App;

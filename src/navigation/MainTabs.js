import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import ProfileScreen from '../screens/ProfileScreen';
import ChatListScreen from '../screens/ChatListScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import FriendsScreen from '../screens/FriendsScreen';
import NewsfeedScreen from '../screens/NewsfeedScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    switch (route.name) {
                        case 'Newsfeed':
                            iconName = 'newspaper-outline';
                            break;
                        case 'Friends':
                            iconName = 'people-outline';
                            break;
                        case 'Notifications':
                            iconName = 'notifications-outline';
                            break;
                        case 'Chats':
                            iconName = 'chatbubbles-outline';
                            break;
                        case 'Profile':
                            iconName = 'person-outline';
                            break;
                        default:
                            iconName = 'ellipse-outline';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007bff',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Newsfeed" component={NewsfeedScreen} options={{ headerShown: false }}/>
            <Tab.Screen name="Friends" component={FriendsScreen} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }}/>
            <Tab.Screen name="Chats" component={ChatListScreen} options={{ headerShown: false }}/>
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
        </Tab.Navigator>
    );
};

export default MainTabs;

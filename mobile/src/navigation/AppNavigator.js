
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { LayoutDashboard, ReceiptText, CreditCard, FileChartLine, UserCircle } from 'lucide-react-native';
import { View, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

import Dashboard from '../screens/Dashboard';
import Transactions from '../screens/Transactions';
import UpcomingPayments from '../screens/UpcomingPayments';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();
const CustomTabBar = (props) => {
    return (
        <View style={styles.tabBarWrapper}>
            <View style={styles.tabBarContainer}>
                {props.state.routes.map((route, index) => {
                    const { options } = props.descriptors[route.key];
                    const isFocused = props.state.index === index;

                    const onPress = () => {
                        const event = props.navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            props.navigation.navigate(route.name);
                        }
                    };

                    const Icon = options.tabBarIcon;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.tabItem}
                        >
                            <Icon color={isFocused ? COLORS.primary : 'rgba(255,255,255,0.4)'} focused={isFocused} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default function AppNavigator({ session, accountId, accountName }) {
    return (
        <NavigationContainer>
            <Tab.Navigator
                tabBar={props => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="Geral"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View style={styles.iconBox}>
                                <LayoutDashboard size={24} color={color} strokeWidth={focused ? 2.5 : 1.5} />
                                {focused && <View style={styles.dot} />}
                            </View>
                        ),
                    }}
                >
                    {() => <Dashboard accountId={accountId} />}
                </Tab.Screen>

                <Tab.Screen
                    name="Pagamentos"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View style={styles.iconBox}>
                                <CreditCard size={24} color={color} strokeWidth={focused ? 2.5 : 1.5} />
                                {focused && <View style={styles.dot} />}
                            </View>
                        ),
                    }}
                >
                    {() => <UpcomingPayments accountId={accountId} />}
                </Tab.Screen>

                <Tab.Screen
                    name="Lançamentos"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View style={styles.iconBox}>
                                <ReceiptText size={24} color={color} strokeWidth={focused ? 2.5 : 1.5} />
                                {focused && <View style={styles.dot} />}
                            </View>
                        ),
                    }}
                >
                    {() => <Transactions accountId={accountId} />}
                </Tab.Screen>

                <Tab.Screen
                    name="Perfil"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View style={styles.iconBox}>
                                <UserCircle size={24} color={color} strokeWidth={focused ? 2.5 : 1.5} />
                                {focused && <View style={styles.dot} />}
                            </View>
                        ),
                    }}
                >
                    {() => <Profile session={session} accountName={accountName} accountId={accountId} />}
                </Tab.Screen>
            </Tab.Navigator>
        </NavigationContainer>
    );
}



const styles = StyleSheet.create({
    tabBarWrapper: {
        backgroundColor: COLORS.secondary,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    tabBarContainer: {
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 90 : 70,
        paddingBottom: Platform.OS === 'ios' ? 25 : 0,
        backgroundColor: COLORS.secondary,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBox: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
        marginTop: 6,
        position: 'absolute',
        bottom: -10,
    }
});

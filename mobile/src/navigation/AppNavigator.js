
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { LayoutDashboard, ReceiptText, CreditCard, FileChartLine, UserCircle } from 'lucide-react-native';

import Dashboard from '../screens/Dashboard';
import Transactions from '../screens/Transactions';
import Bills from '../screens/Bills';
import BPAnalysis from '../screens/BPAnalysis';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function AppNavigator({ session, accountId, accountName }) {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#000',
                    tabBarInactiveTintColor: '#999',
                    tabBarStyle: {
                        paddingBottom: 8,
                        paddingTop: 8,
                        height: 60,
                    },
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="Geral"
                    options={{
                        tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
                    }}
                >
                    {() => <Dashboard accountId={accountId} />}
                </Tab.Screen>

                <Tab.Screen
                    name="Lançamentos"
                    options={{
                        tabBarIcon: ({ color, size }) => <ReceiptText size={size} color={color} />,
                    }}
                >
                    {() => <Transactions accountId={accountId} />}
                </Tab.Screen>

                <Tab.Screen
                    name="Contas"
                    options={{
                        tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
                    }}
                >
                    {() => <Bills accountId={accountId} />}
                </Tab.Screen>

                <Tab.Screen
                    name="BP"
                    options={{
                        tabBarIcon: ({ color, size }) => <FileChartLine size={size} color={color} />,
                    }}
                >
                    {() => <BPAnalysis accountId={accountId} />}
                </Tab.Screen>

                <Tab.Screen
                    name="Perfil"
                    options={{
                        tabBarIcon: ({ color, size }) => <UserCircle size={size} color={color} />,
                    }}
                >
                    {() => <Profile session={session} accountName={accountName} accountId={accountId} />}
                </Tab.Screen>
            </Tab.Navigator>
        </NavigationContainer>
    );
}

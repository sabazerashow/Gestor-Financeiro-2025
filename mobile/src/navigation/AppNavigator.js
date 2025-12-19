
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { LayoutDashboard, Zap, CreditCard, FileChartLine, UserCircle } from 'lucide-react-native';

import Dashboard from '../screens/Dashboard';
import QuickAdd from '../screens/QuickAdd';
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
                        tabBarLabel: 'Geral',
                        tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
                    }}
                >
                    {() => <Dashboard accountId={accountId} />}
                </Tab.Screen>

                <Tab.Screen
                    name="Lançar"
                    options={{
                        tabBarLabel: 'Lançar',
                        tabBarIcon: ({ color, size }) => <Zap size={size} color={color} fill={color === '#000' ? '#000' : 'none'} />,
                    }}
                >
                    {() => <QuickAdd accountId={accountId} />}
                </Tab.Screen>

                <Tab.Screen
                    name="BP"
                    options={{
                        tabBarLabel: 'BP',
                        tabBarIcon: ({ color, size }) => <FileChartLine size={size} color={color} />,
                    }}
                >
                    {() => <BPAnalysis accountId={accountId} />}
                </Tab.Screen>

                <Tab.Screen
                    name="Contas"
                    options={{
                        tabBarLabel: 'Contas',
                        tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
                    }}
                >
                    {() => <Bills accountId={accountId} />}
                </Tab.Screen>

                <Tab.Screen
                    name="Perfil"
                    options={{
                        tabBarLabel: 'Perfil',
                        tabBarIcon: ({ color, size }) => <UserCircle size={size} color={color} />,
                    }}
                >
                    {() => <Profile session={session} accountName={accountName} />}
                </Tab.Screen>
            </Tab.Navigator>
        </NavigationContainer>
    );
}


import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { User, LogOut, Share2, Shield, ChevronRight } from 'lucide-react-native';

export default function Profile({ session, accountName }) {
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Erro', error.message);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{session?.user?.email?.substring(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={styles.email}>{session?.user?.email}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{accountName || 'Conta Pessoal'}</Text>
                </View>
            </View>

            <View style={styles.menu}>
                <Text style={styles.menuLabel}>Configurações</Text>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.iconBox, { backgroundColor: '#e8f0fe' }]}>
                        <User size={20} color="#1a73e8" />
                    </View>
                    <Text style={styles.menuText}>Meu Perfil</Text>
                    <ChevronRight size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.iconBox, { backgroundColor: '#e6f4ea' }]}>
                        <Share2 size={20} color="#1e8e3e" />
                    </View>
                    <Text style={styles.menuText}>Compartilhar Conta</Text>
                    <ChevronRight size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.iconBox, { backgroundColor: '#fef7e0' }]}>
                        <Shield size={20} color="#f9ab00" />
                    </View>
                    <Text style={styles.menuText}>Segurança</Text>
                    <ChevronRight size={20} color="#ccc" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <LogOut size={20} color="#d93025" />
                    <Text style={styles.signOutText}>Sair da Conta</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.version}>Versão 1.0.0 (Paridade Web)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f8f9fa',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    badge: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    menu: {
        padding: 24,
    },
    menuLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 8,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f3f4',
        marginVertical: 16,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    signOutText: {
        fontSize: 16,
        color: '#d93025',
        fontWeight: 'bold',
    },
    version: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        textAlign: 'center',
        color: '#ccc',
        fontSize: 12,
    }
});

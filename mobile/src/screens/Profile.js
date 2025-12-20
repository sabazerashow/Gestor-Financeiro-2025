import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, ScrollView, StatusBar } from 'react-native';
import { supabase } from '../lib/supabase';
import { User, LogOut, Share2, Shield, ChevronRight, Calendar, Settings, Award } from 'lucide-react-native';
import InviteModal from '../components/InviteModal';
import EditProfileModal from '../components/EditProfileModal';
import { db } from '../lib/db';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Squircle } from '../components/common/Squircle';
import * as Haptics from 'expo-haptics';

export default function Profile({ session, accountName, accountId }) {
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [profile, setProfile] = useState(null);

    const fetchProfile = async () => {
        if (!session?.user?.id) return;
        try {
            const data = await db.fetchProfile(session.user.id);
            setProfile(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [session?.user?.id]);

    const handleSignOut = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Erro', error.message);
    };

    const handleSecurity = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Segurança",
            "Deseja receber um e-mail para redefinir sua senha?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Enviar E-mail",
                    onPress: async () => {
                        const { error } = await supabase.auth.resetPasswordForEmail(session?.user?.email);
                        if (error) Alert.alert("Erro", error.message);
                        else Alert.alert("Sucesso", "Link de redefinição enviado!");
                    }
                }
            ]
        );
    };

    const userName = profile?.full_name || session?.user?.email?.split('@')[0];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Squircle color={COLORS.secondary} size={100} style={styles.avatar}>
                        <Text style={styles.avatarText}>{userName.substring(0, 1).toUpperCase()}</Text>
                    </Squircle>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userEmail}>{session?.user?.email}</Text>

                    <View style={styles.rankBadge}>
                        <Award size={14} color={COLORS.primary} strokeWidth={2.5} />
                        <Text style={styles.rankText}>{profile?.rank || 'Piloto Aprendiz'}</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Conta Ativa</Text>
                        <Text style={styles.statValue} numberOfLines={1}>{accountName || 'Pessoal'}</Text>
                    </View>
                    <View style={styles.dividerVertical} />
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Membro Desde</Text>
                        <Text style={styles.statValue}>Dez 2025</Text>
                    </View>
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Preferências</Text>

                    {[
                        { icon: User, label: 'Meu Perfil', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', action: () => setIsEditOpen(true) },
                        { icon: Share2, label: 'Compartilhar Conta', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', action: () => setIsInviteOpen(true) },
                        { icon: Shield, label: 'Segurança e Senha', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', action: handleSecurity }
                    ].map((item, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.menuItem}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                item.action();
                            }}
                        >
                            <Squircle color={item.bg} size={44}>
                                <item.icon size={20} color={item.color} strokeWidth={2.5} />
                            </Squircle>
                            <Text style={styles.menuText}>{item.label}</Text>
                            <ChevronRight size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Sobre</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                        <Squircle color="#F1F5F9" size={44}>
                            <Settings size={20} color={COLORS.textSecondary} strokeWidth={2.5} />
                        </Squircle>
                        <Text style={styles.menuText}>Configurações do App</Text>
                        <ChevronRight size={20} color={COLORS.gray} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                    <LogOut size={20} color={COLORS.danger} strokeWidth={2.5} />
                    <Text style={styles.logoutText}>Encerrar Sessão</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Finance Pilot Mobile v1.0.0 • Premium Edition</Text>
            </ScrollView >

            <InviteModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                accountId={accountId}
            />

            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                userId={session?.user?.id}
                initialName={profile?.full_name}
                onUpdated={fetchProfile}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        ...SHADOWS.small,
    },
    avatar: {
        marginBottom: SPACING.md,
        ...SHADOWS.premium,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.primary,
    },
    userName: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: SPACING.md,
        gap: 6,
    },
    rankText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.primaryDark,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        margin: SPACING.lg,
        borderRadius: 24,
        padding: SPACING.md,
        ...SHADOWS.small,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
    },
    dividerVertical: {
        width: 1,
        backgroundColor: '#2D3748',
        height: '100%',
    },
    menuSection: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: SPACING.md,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
        ...SHADOWS.small,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginLeft: 14,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.xl,
        gap: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.danger,
    },
    versionText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 12,
        color: '#94A3B8',
    }
});

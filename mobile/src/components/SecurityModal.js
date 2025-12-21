
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { X, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import * as Haptics from 'expo-haptics';

export default function SecurityModal({ isOpen, onClose, userEmail }) {
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleUpdatePassword = async () => {
        if (!newPassword) {
            Alert.alert('Erro', 'Por favor, insira uma nova senha.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Sucesso', 'Sua senha foi atualizada com sucesso!');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (e) {
            Alert.alert('Erro', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetEmail = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
                redirectTo: 'gestor-financeiro://reset-password',
            });
            if (error) throw error;

            Alert.alert('E-mail Enviado', 'Enviamos as instruções para redefinir sua senha no seu e-mail.');
            onClose();
        } catch (e) {
            Alert.alert('Erro', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Lock size={20} color={COLORS.primary} />
                            <Text style={styles.title}>Segurança e Senha</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>
                                Sua conta está vinculada ao e-mail: {'\n'}
                                <Text style={styles.emailText}>{userEmail}</Text>
                            </Text>
                        </View>

                        <Text style={styles.sectionTitle}>Alterar Senha</Text>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Nova Senha</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mínimo 6 caracteres"
                                    placeholderTextColor="#4A5568"
                                    secureTextEntry={!showPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeBtn}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} color="#4A5568" /> : <Eye size={20} color="#4A5568" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Confirmar Senha</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Repita a nova senha"
                                placeholderTextColor="#4A5568"
                                secureTextEntry={!showPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.updateBtn}
                            onPress={handleUpdatePassword}
                            disabled={loading || !newPassword}
                        >
                            {loading ? <ActivityIndicator color={COLORS.secondary} /> : <Text style={styles.updateBtnText}>Atualizar Senha</Text>}
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>OU</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity
                            style={styles.resetBtn}
                            onPress={handleResetEmail}
                            disabled={loading}
                        >
                            <Mail size={18} color={COLORS.text} />
                            <Text style={styles.resetBtnText}>Receber Link por E-mail</Text>
                        </TouchableOpacity>

                        <View style={styles.securityBadge}>
                            <ShieldCheck size={16} color={COLORS.primary} strokeWidth={2.5} />
                            <Text style={styles.securityBadgeText}>Conexão Criptografada via Supabase</Text>
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: COLORS.secondary,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeBtn: {
        padding: 4,
    },
    form: {
        flex: 1,
    },
    infoBox: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    infoText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    emailText: {
        color: COLORS.text,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 24,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        backgroundColor: '#0F172A',
        borderRadius: 18,
        padding: 16,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#1E293B',
        color: COLORS.text,
    },
    eyeBtn: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    updateBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
        marginTop: 12,
        ...SHADOWS.small,
    },
    updateBtnText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
        gap: 16,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 18,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    resetBtnText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        gap: 8,
    },
    securityBadgeText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    }
});

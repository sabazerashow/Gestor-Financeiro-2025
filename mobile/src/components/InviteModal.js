
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert, FlatList } from 'react-native';
import { db } from '../lib/db';
import { X, UserPlus, Mail, Trash2, Clock } from 'lucide-react-native';

export default function InviteModal({ isOpen, onClose, accountId }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [invites, setInvites] = useState([]);
    const [members, setMembers] = useState([]);

    const fetchData = async () => {
        if (!accountId) return;
        try {
            const [m, i] = await Promise.all([
                db.fetchAccountMembers(accountId),
                db.fetchPendingInvites(accountId)
            ]);
            setMembers(m);
            setInvites(i);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isOpen) fetchData();
    }, [isOpen]);

    const handleInvite = async () => {
        if (!email.trim() || !email.includes('@')) {
            Alert.alert('E-mail inválido');
            return;
        }
        setLoading(true);
        try {
            await db.createInvite(accountId, email.toLowerCase(), 'member');
            setEmail('');
            fetchData();
            Alert.alert('Sucesso', 'Convite enviado!');
        } catch (e) {
            Alert.alert('Erro', e.message);
        } finally {
            setLoading(true);
            setLoading(false);
        }
    };

    const handleRevoke = async (id) => {
        try {
            await db.revokeInvite(id);
            fetchData();
        } catch (e) {
            Alert.alert('Erro', e.message);
        }
    };

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Compartilhar Conta</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Convidar por e-mail</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="exemplo@gmail.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <TouchableOpacity style={styles.addBtn} onPress={handleInvite} disabled={loading}>
                                <UserPlus size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.hint}>O usuário verá o convite ao fazer login.</Text>
                    </View>

                    <View style={styles.listSection}>
                        <Text style={styles.sectionTitle}>Membros e Convites</Text>
                        <ScrollView>
                            {members.map(m => (
                                <View key={m.id} style={styles.memberItem}>
                                    <View style={styles.avatarMini}>
                                        <Text style={styles.avatarMiniText}>M</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.memberEmail}>{m.user_id}</Text>
                                        <Text style={styles.memberRole}>{m.role === 'owner' ? 'Proprietário' : 'Membro'}</Text>
                                    </View>
                                </View>
                            ))}
                            {invites.map(i => (
                                <View key={i.id} style={styles.memberItem}>
                                    <View style={[styles.avatarMini, { backgroundColor: '#fef7e0' }]}>
                                        <Clock size={16} color="#f9ab00" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.memberEmail}>{i.email}</Text>
                                        <Text style={styles.pendingText}>Convite Pendente</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleRevoke(i.id)}>
                                        <Trash2 size={18} color="#999" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    inputSection: {
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#eee',
    },
    addBtn: {
        backgroundColor: '#000',
        width: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hint: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
    },
    listSection: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    avatarMini: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarMiniText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    memberEmail: {
        fontSize: 14,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    memberRole: {
        fontSize: 12,
        color: '#999',
    },
    pendingText: {
        fontSize: 12,
        color: '#f9ab00',
        fontWeight: 'bold',
    }
});


import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { db } from '../lib/db';
import { X, Save, User, Calendar, Award, ChevronDown } from 'lucide-react-native';

const GENDER_OPTIONS = ['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'];

export default function EditProfileModal({ isOpen, onClose, userId, profile, onUpdated }) {
    const [name, setName] = useState('');
    const [rank, setRank] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [isGenderPickerOpen, setIsGenderPickerOpen] = useState(false);

    useEffect(() => {
        if (isOpen && profile) {
            setName(profile.full_name || '');
            setRank(profile.rank || '');
            setBirthDate(profile.birth_date || '');
            setGender(profile.gender || '');
        }
    }, [isOpen, profile]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Erro', 'O nome é obrigatório.');
            return;
        }
        setLoading(true);
        try {
            await db.updateProfile(userId, {
                full_name: name.trim(),
                rank: rank.trim(),
                birth_date: birthDate || null,
                gender: gender
            });
            onUpdated?.();
            onClose();
            Alert.alert('Sucesso', 'Perfil atualizado!');
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
                        <Text style={styles.title}>Editar Perfil</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarLarge}>
                                <User size={40} color="#ccc" />
                            </View>
                            <TouchableOpacity style={styles.cameraIcon}>
                                <Award size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Nome Completo</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Diego Sabá"
                                />
                            </View>
                            <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Posto/Graduação</Text>
                                <TextInput
                                    style={styles.input}
                                    value={rank}
                                    onChangeText={setRank}
                                    placeholder="Capitão de Corveta"
                                />
                            </View>
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Data de Nascimento</Text>
                                <TextInput
                                    style={styles.input}
                                    value={birthDate}
                                    onChangeText={setBirthDate}
                                    placeholder="AAAA-MM-DD"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Sexo</Text>
                                <TouchableOpacity
                                    style={styles.selector}
                                    onPress={() => setIsGenderPickerOpen(!isGenderPickerOpen)}
                                >
                                    <Text style={styles.selectorText}>{gender || 'Selecionar'}</Text>
                                    <ChevronDown size={18} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {isGenderPickerOpen && (
                            <View style={styles.genderPicker}>
                                {GENDER_OPTIONS.map(opt => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={styles.genderItem}
                                        onPress={() => { setGender(opt); setIsGenderPickerOpen(false); }}
                                    >
                                        <Text style={[styles.genderText, gender === opt && styles.genderTextActive]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Salvar Alterações</Text>}
                        </TouchableOpacity>

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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        height: '90%',
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
    form: {
        flex: 1,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f1f3f4',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: '38%',
        backgroundColor: '#000',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    fieldGroup: {
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#eee',
    },
    selector: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    selectorText: {
        fontSize: 14,
        color: '#1a1a1a',
    },
    genderPicker: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#eee',
    },
    genderItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    genderText: {
        fontSize: 14,
        color: '#666',
    },
    genderTextActive: {
        color: '#000',
        fontWeight: 'bold',
    },
    saveBtn: {
        backgroundColor: '#000',
        width: '100%',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 16,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

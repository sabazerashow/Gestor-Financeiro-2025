
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { db } from '../lib/db';
import { X, Camera, User, Calendar, ChevronDown } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import * as ImagePicker from 'expo-image-picker';

const GENDER_OPTIONS = ['Masculino', 'Feminino'];

export default function EditProfileModal({ isOpen, onClose, userId, profile, onUpdated }) {
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState(''); // Store as DDMMYYYY
    const [gender, setGender] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isGenderPickerOpen, setIsGenderPickerOpen] = useState(false);

    useEffect(() => {
        if (isOpen && profile) {
            setName(profile.name || '');
            setGender(profile.gender || '');
            setPhoto(profile.photo || null);

            // Convert YYYY-MM-DD to DDMMYYYY for display
            if (profile.dob) {
                const parts = profile.dob.split('-');
                if (parts.length === 3) {
                    setBirthDate(`${parts[2]}${parts[1]}${parts[0]}`);
                }
            } else {
                setBirthDate('');
            }
        }
    }, [isOpen, profile]);

    const formatBirthDate = (text) => {
        // Only allow digits
        const cleaned = text.replace(/\D/g, '');
        // Limit to 8 digits
        const truncated = cleaned.slice(0, 8);
        setBirthDate(truncated);
    };

    const displayBirthDate = () => {
        if (!birthDate) return '';
        let d = birthDate.substring(0, 2);
        let m = birthDate.substring(2, 4);
        let y = birthDate.substring(4, 8);
        if (birthDate.length > 4) return `${d}/${m}/${y}`;
        if (birthDate.length > 2) return `${d}/${m}`;
        return d;
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Erro', 'O nome é obrigatório.');
            return;
        }

        let dbDate = null;
        if (birthDate.length === 8) {
            const d = birthDate.substring(0, 2);
            const m = birthDate.substring(2, 4);
            const y = birthDate.substring(4, 8);
            dbDate = `${y}-${m}-${d}`;
        } else if (birthDate.length > 0) {
            Alert.alert('Erro', 'Data de nascimento incompleta.');
            return;
        }

        setLoading(true);
        try {
            await db.updateProfile(userId, {
                name: name.trim(),
                dob: dbDate,
                gender: gender,
                photo: photo,
                updated_at: new Date().toISOString(),
                title: profile?.title || profile?.rank || 'Membro',
                email: profile?.email
            });
            onUpdated?.();
            onClose();
            Alert.alert('Sucesso', 'Perfil atualizado!');
        } catch (e) {
            console.error('Update Profile Error:', e);
            Alert.alert('Erro ao Salvar', `Não foi possível atualizar o perfil: ${e.message || 'Erro desconhecido'}`);
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
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeBtn}
                        >
                            <X size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        <View style={styles.avatarContainer}>
                            <TouchableOpacity onPress={handlePickImage} style={styles.avatarLarge}>
                                {photo ? (
                                    <Image source={{ uri: photo }} style={styles.profileImage} />
                                ) : (
                                    <User size={40} color="#ccc" />
                                )}
                                <View style={styles.cameraIcon}>
                                    <Camera size={14} color="#fff" />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.avatarHint}>Toque para mudar a foto</Text>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Nome Completo</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Seu nome aqui"
                                placeholderTextColor="#4A5568"
                            />
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.fieldGroup, { flex: 1.2, marginRight: 8 }]}>
                                <Text style={styles.label}>Data de Nascimento</Text>
                                <View style={styles.dateInputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={displayBirthDate()}
                                        onChangeText={formatBirthDate}
                                        placeholder="00/00/0000"
                                        placeholderTextColor="#4A5568"
                                        keyboardType="numeric"
                                        maxLength={10}
                                    />
                                    <Calendar size={16} color="#4A5568" style={styles.dateIcon} />
                                </View>
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
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: COLORS.secondary,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        height: '92%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    form: {
        flex: 1,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarLarge: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.secondary,
        zIndex: 10,
    },
    avatarHint: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 10,
        fontWeight: '600',
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 10,
        letterSpacing: 1.2,
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
    dateInputContainer: {
        position: 'relative',
    },
    dateIcon: {
        position: 'absolute',
        right: 16,
        top: 18,
    },
    selector: {
        backgroundColor: '#0F172A',
        borderRadius: 18,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    selectorText: {
        fontSize: 15,
        color: COLORS.text,
    },
    genderPicker: {
        backgroundColor: '#0F172A',
        borderRadius: 20,
        padding: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    genderItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    genderText: {
        fontSize: 15,
        color: COLORS.textSecondary,
    },
    genderTextActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        width: '100%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginTop: 10,
        ...SHADOWS.premium,
    },
    saveBtnText: {
        color: COLORS.secondary,
        fontSize: 17,
        fontWeight: 'bold',
    }
});

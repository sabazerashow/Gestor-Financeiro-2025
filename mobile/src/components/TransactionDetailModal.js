
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { db } from '../lib/db';
import { categories, PaymentMethod } from '../lib/constants';
import { X, Save, Trash2, Calendar, Clock, CreditCard, Tag, Edit2, ChevronDown } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CategorySelectionModal from './CategorySelectionModal';

export default function TransactionDetailModal({ isOpen, onClose, transaction, onUpdated }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);

    const [editedData, setEditedData] = useState(null);

    useEffect(() => {
        if (isOpen && transaction) {
            setEditedData({ ...transaction });
            setIsEditing(false);
        }
    }, [isOpen, transaction]);

    if (!transaction || !editedData) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            await db.updateTransaction(transaction.id, {
                description: editedData.description,
                amount: Number(editedData.amount),
                category: editedData.category,
                subcategory: editedData.subcategory,
                date: editedData.date,
                payment_method: editedData.payment_method
            });
            onUpdated?.();
            setIsEditing(false);
            Alert.alert('Sucesso', 'Lançamento atualizado!');
        } catch (e) {
            Alert.alert('Erro', 'Falha ao atualizar: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Excluir Lançamento',
            'Tem certeza que deseja excluir este registro?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await db.deleteTransaction(transaction.id);
                            onUpdated?.();
                            onClose();
                        } catch (e) {
                            Alert.alert('Erro', 'Falha ao excluir');
                        }
                    }
                }
            ]
        );
    };

    const DetailRow = ({ icon: Icon, label, value }) => (
        <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
                <Icon size={18} color={COLORS.textSecondary} />
            </View>
            <View>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
        </View>
    );

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={[styles.content, isEditing && { height: '90%' }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{isEditing ? 'Editar Registro' : 'Detalhes'}</Text>
                        <View style={styles.headerActions}>
                            {!isEditing && (
                                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerIcon}>
                                    <Edit2 size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
                                <X size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {isEditing ? (
                            <View style={styles.editForm}>
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Descrição</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editedData.description}
                                        onChangeText={(t) => setEditedData({ ...editedData, description: t })}
                                    />
                                </View>

                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Valor (R$)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={String(editedData.amount)}
                                        keyboardType="numeric"
                                        onChangeText={(t) => setEditedData({ ...editedData, amount: t })}
                                    />
                                </View>

                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Categoria</Text>
                                    <TouchableOpacity
                                        style={styles.selector}
                                        onPress={() => setIsCatModalOpen(true)}
                                    >
                                        <Text style={styles.selectorText}>{editedData.category} • {editedData.subcategory}</Text>
                                        <ChevronDown size={20} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Salvar Alterações</Text>}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.viewContent}>
                                <View style={styles.amountBanner}>
                                    <Text style={[styles.bannerAmount, { color: transaction.type === 'income' ? COLORS.primary : COLORS.danger }]}>
                                        {transaction.type === 'income' ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </Text>
                                    <Text style={styles.bannerDescription}>{transaction.description}</Text>
                                </View>

                                <View style={styles.detailsList}>
                                    <DetailRow
                                        icon={Calendar}
                                        label="Data"
                                        value={format(new Date(transaction.date + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                    />
                                    <DetailRow
                                        icon={Clock}
                                        label="Horário do Registro"
                                        value={transaction.created_at ? format(new Date(transaction.created_at), "HH:mm'h'") : 'Não disponível'}
                                    />
                                    <DetailRow
                                        icon={Tag}
                                        label="Categoria"
                                        value={`${transaction.category} • ${transaction.subcategory}`}
                                    />
                                    <DetailRow
                                        icon={CreditCard}
                                        label="Forma de Pagamento"
                                        value={transaction.payment_method || 'Outro'}
                                    />
                                </View>

                                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                                    <Trash2 size={20} color={COLORS.danger} />
                                    <Text style={styles.deleteBtnText}>Excluir Registro</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>

            <CategorySelectionModal
                isOpen={isCatModalOpen}
                onClose={() => setIsCatModalOpen(false)}
                type={editedData.type}
                onSelect={(cat, sub) => {
                    setEditedData({ ...editedData, category: cat, subcategory: sub });
                    setIsCatModalOpen(false);
                }}
            />
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
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    headerIcon: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    amountBanner: {
        alignItems: 'center',
        paddingVertical: 32,
        marginBottom: 24,
        backgroundColor: '#0F172A',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    bannerAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    bannerDescription: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    detailsList: {
        gap: 20,
        marginBottom: 40,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
    },
    editForm: {
        gap: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#0F172A',
        borderRadius: 16,
        padding: 16,
        color: COLORS.text,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    selector: {
        backgroundColor: '#0F172A',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectorText: {
        color: COLORS.text,
        fontSize: 15,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 18,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtnText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        marginBottom: 20,
    },
    deleteBtnText: {
        color: COLORS.danger,
        fontWeight: 'bold',
        fontSize: 15,
    }
});


import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { db } from '../lib/db';
import { categories, expenseCategoryList } from '../lib/constants';
import { X, Save, Calendar, ChevronDown } from 'lucide-react-native';
import CategorySelectionModal from './CategorySelectionModal';
import { COLORS, SHADOWS } from '../constants/theme';

export default function AddBillModal({ isOpen, onClose, accountId, onAdded }) {
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [dueDay, setDueDay] = useState('10');
    const [isAutoDebit, setIsAutoDebit] = useState(false);
    const [amountStr, setAmountStr] = useState('');
    const [category, setCategory] = useState('Casa/Moradia');
    const [subcategory, setSubcategory] = useState('Contas Domésticas');
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDescription('');
            setDueDay('10');
            setIsAutoDebit(false);
            setAmountStr('');
            setCategory('Casa/Moradia');
            setSubcategory('Contas Domésticas');
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!description || !dueDay) {
            alert('Por favor, preencha a descrição e o dia de vencimento');
            return;
        }

        setLoading(true);
        try {
            const billData = {
                id: Math.random().toString(36).substring(2, 11),
                description: description,
                due_day: parseInt(dueDay),
                is_auto_debit: isAutoDebit,
                amount: parseFloat(amountStr.replace(',', '.')) || null,
                category: category,
                subcategory: subcategory,
                account_id: accountId
            };

            await db.addBill(accountId, billData);
            onAdded?.();
            onClose();
        } catch (e) {
            console.error('Save Bill Error:', e);
            alert('Erro ao salvar conta: ' + (e.message || 'Verifique sua conexão'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Adicionar Conta Recorrente</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Descrição da Conta</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Fatura do Cartão, Internet"
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Dia do Vencimento (1-31)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 10"
                                keyboardType="numeric"
                                value={dueDay}
                                onChangeText={setDueDay}
                            />
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.switchLabel}>É Débito Automático com valor fixo?</Text>
                            <Switch
                                value={isAutoDebit}
                                onValueChange={setIsAutoDebit}
                                trackColor={{ false: '#eee', true: '#000' }}
                            />
                        </View>

                        <View style={styles.helperBox}>
                            <Text style={styles.helperText}>Ao preencher, um lançamento recorrente será criado automaticamente.</Text>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Valor Fixo Mensal (R$)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 59.90"
                                    keyboardType="numeric"
                                    value={amountStr}
                                    onChangeText={setAmountStr}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>Categoria</Text>
                                    <TouchableOpacity
                                        style={styles.selector}
                                        onPress={() => setIsCatModalOpen(true)}
                                    >
                                        <Text style={styles.selectorText}>{category}</Text>
                                        <ChevronDown size={18} color="#666" />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Subcategoria</Text>
                                    <TouchableOpacity
                                        style={styles.selector}
                                        onPress={() => setIsCatModalOpen(true)}
                                    >
                                        <Text style={styles.selectorText}>{subcategory}</Text>
                                        <ChevronDown size={18} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Salvar Conta</Text>}
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>

                <CategorySelectionModal
                    isOpen={isCatModalOpen}
                    onClose={() => setIsCatModalOpen(false)}
                    selectedCategory={category}
                    selectedSubcategory={subcategory}
                    onSelect={(cat, sub) => {
                        setCategory(cat);
                        setSubcategory(sub);
                    }}
                    type="expense"
                />
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
        color: COLORS.text,
    },
    form: {
        flex: 1,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#0F172A',
        borderRadius: 16,
        padding: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
        color: COLORS.text,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
        marginRight: 10,
    },
    helperBox: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
    },
    helperText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    selector: {
        backgroundColor: '#0F172A',
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    selectorText: {
        fontSize: 14,
        color: COLORS.text,
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 18,
        padding: 18,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    submitBtnText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

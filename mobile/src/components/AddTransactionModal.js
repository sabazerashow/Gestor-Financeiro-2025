
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { db } from '../lib/db';
import { X, Check, Save } from 'lucide-react-native';

const CATEGORIES = [
    'Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'
];

export default function AddTransactionModal({ isOpen, onClose, accountId, onAdded }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('Outros');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!description || !amount || !accountId) return;
        setLoading(true);
        try {
            await db.addTransaction(accountId, {
                id: Math.random().toString(36).substring(2, 15),
                description,
                amount: parseFloat(amount),
                type,
                category,
                date: new Date().toISOString().split('T')[0],
            });
            setDescription('');
            setAmount('');
            onAdded?.();
            onClose();
        } catch (e) {
            console.error(e);
            alert('Falha ao salvar transação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nova Transação</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
                                onPress={() => setType('expense')}
                            >
                                <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>Despesa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
                                onPress={() => setType('income')}
                            >
                                <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>Receita</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Descrição</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Aluguel, Supermercado..."
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Valor (R$)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0,00"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Categoria</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text style={[styles.categoryBtnText, category === cat && styles.categoryBtnTextActive]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSave}
                            disabled={loading || !description || !amount}
                        >
                            <Save size={20} color="#fff" />
                            <Text style={styles.saveBtnText}>{loading ? 'Salvando...' : 'Salvar Transação'}</Text>
                        </TouchableOpacity>
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
        height: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    form: {
        flex: 1,
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: '#f1f3f4',
        borderRadius: 16,
        padding: 6,
        marginBottom: 24,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    typeBtnActiveExpense: {
        backgroundColor: '#d93025',
    },
    typeBtnActiveIncome: {
        backgroundColor: '#1e8e3e',
    },
    typeBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    typeBtnTextActive: {
        color: '#fff',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f1f3f4',
    },
    categoryBtnActive: {
        backgroundColor: '#000',
    },
    categoryBtnText: {
        fontSize: 13,
        color: '#666',
    },
    categoryBtnTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: '#000',
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 20,
        marginBottom: 40,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});


import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { db } from '../lib/db';
import { TransactionType, PaymentMethod, categories, expenseCategoryList, incomeCategoryList } from '../lib/constants';
import { X, Check, Save, Zap, Edit2, ArrowRight, ChevronDown } from 'lucide-react-native';
import CategorySelectionModal from './CategorySelectionModal';
import { COLORS, SHADOWS } from '../constants/theme';

const monthMap = {
    'janeiro': 1, 'jan': 1,
    'fevereiro': 2, 'fev': 2,
    'março': 3, 'marco': 3, 'mar': 3,
    'abril': 4, 'abr': 4,
    'maio': 5,
    'junho': 6, 'jun': 6,
    'julho': 7, 'jul': 7,
    'agosto': 8, 'ago': 8,
    'setembro': 9, 'set': 9,
    'outubro': 10, 'out': 10,
    'novembro': 11, 'nov': 11,
    'dezembro': 12, 'dez': 12,
};

const toISO = (y, m, d) => {
    const dt = new Date(y, m - 1, d);
    return dt.toISOString().split('T')[0];
};

const parseDateFromText = (text, todayISO) => {
    const raw = text.toLowerCase();
    const today = new Date(todayISO + 'T00:00:00');

    if (raw.includes('ontem')) {
        const d = new Date(today); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0];
    }
    if (raw.includes('hoje')) return todayISO;

    const dm = raw.match(/(\b\d{1,2})\s*[\/\-]\s*(\d{1,2})(?:[\/\-](\d{4}))?/);
    if (dm) {
        const d = parseInt(dm[1]);
        const m = parseInt(dm[2]);
        const y = dm[3] ? parseInt(dm[3]) : today.getFullYear();
        return toISO(y, m, d);
    }

    const named = raw.match(/\b(\d{1,2})\s*(?:de\s*)?(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|jun|jul|ago|set|out|nov|dez)\b/);
    if (named) {
        const d = parseInt(named[1]);
        const m = monthMap[named[2]] || today.getMonth() + 1;
        const yearHint = raw.match(/\b(\d{4})\b/);
        const y = yearHint ? parseInt(yearHint[1]) : today.getFullYear();
        return toISO(y, m, d);
    }

    const onlyDay = raw.match(/\bdia\s*(\d{1,2})\b/);
    if (onlyDay) {
        const d = parseInt(onlyDay[1]);
        return toISO(today.getFullYear(), today.getMonth() + 1, d);
    }

    return todayISO;
};

export default function AddTransactionModal({ isOpen, onClose, accountId, initialType, onAdded }) {
    const [step, setStep] = useState('input'); // 'input', 'review', 'edit'
    const [inputText, setInputText] = useState('');

    // Use strings for numeric inputs to allow clean editing
    const [amountStr, setAmountStr] = useState('0');
    const [installmentsStr, setInstallmentsStr] = useState('1');

    const [details, setDetails] = useState({
        description: '',
        type: 'expense',
        category: 'A verificar',
        subcategory: 'A classificar',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: PaymentMethod.OUTRO
    });
    const [loading, setLoading] = useState(false);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep('input');
            setInputText('');
            setAmountStr('0');
            setInstallmentsStr('1');
            setDetails({
                description: '',
                type: initialType || 'expense',
                category: 'A verificar',
                subcategory: 'A classificar',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: PaymentMethod.OUTRO
            });
        }
    }, [isOpen, initialType]);

    const handleProcessMagic = () => {
        if (!inputText.trim()) return;

        const raw = inputText.toLowerCase();
        const amountMatch = raw.match(/(\d+[\.,]?\d*)\s*(reais|r\$|rs)?/);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.')) : 0;

        const installmentsMatch = raw.match(/(\d+)\s*x/);
        const installments = installmentsMatch ? parseInt(installmentsMatch[1]) : 1;

        const date = parseDateFromText(inputText, new Date().toISOString().split('T')[0]);

        let paymentMethod = PaymentMethod.OUTRO;
        if (raw.includes('crédito') || raw.includes('credito') || raw.includes('cartao') || raw.includes('cartão')) paymentMethod = PaymentMethod.CREDITO;
        else if (raw.includes('débito') || raw.includes('debito')) paymentMethod = PaymentMethod.DEBITO;
        else if (raw.includes('pix')) paymentMethod = PaymentMethod.PIX;
        else if (raw.includes('dinheiro')) paymentMethod = PaymentMethod.DINHEIRO;
        else if (raw.includes('boleto')) paymentMethod = PaymentMethod.BOLETO;

        setAmountStr(amount.toString());
        setInstallmentsStr(installments.toString());
        setDetails({
            ...details,
            description: inputText.trim(),
            date,
            paymentMethod,
            category: 'A verificar',
            subcategory: 'A classificar',
            type: initialType || 'expense'
        });
        setStep('review');
    };

    const handleSave = async () => {
        setLoading(true);
        const amount = parseFloat(amountStr.replace(',', '.')) || 0;
        const installments = parseInt(installmentsStr) || 1;

        try {
            // Manual mapping to snake_case to ensure Supabase compatibility
            const txData = {
                id: Math.random().toString(36).substring(2, 10), // Short random ID or omit let DB generate
                description: details.description,
                amount: amount,
                type: details.type,
                category: details.category,
                subcategory: details.subcategory,
                date: details.date,
                payment_method: details.paymentMethod, // Map to DB column name
            };

            if (installments > 1) {
                txData.installment_details = {
                    total: installments,
                    current: 1,
                    totalAmount: amount
                };
            }

            await db.addTransaction(accountId, txData);
            onAdded?.();
            onClose();
        } catch (e) {
            console.error('Save Error:', e);
            alert('Erro ao salvar lançamento: ' + (e.message || 'Verifique sua conexão'));
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (field, value) => {
        const updated = { ...details, [field]: value };
        if (field === 'category') {
            updated.subcategory = categories[value]?.subcategories[0] || '';
        }
        setDetails(updated);
    };

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.content, step === 'edit' && { height: '90%' }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {step === 'input' ? 'Lançamento Rápido' : (step === 'edit' ? 'Editar Lançamento' : 'Confirme os detalhes')}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    {step === 'input' && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>O que você {details.type === 'income' ? 'recebeu' : 'pagou'}?</Text>
                            <TextInput
                                style={styles.magicInput}
                                placeholder="Ex: Almoço 45 reais no pix hoje"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                autoFocus
                            />
                            <TouchableOpacity
                                style={styles.processBtn}
                                onPress={handleProcessMagic}
                                disabled={!inputText.trim()}
                            >
                                <Zap size={20} color="#fff" fill="#fff" />
                                <Text style={styles.processBtnText}>Analisar Gasto</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 'review' && (
                        <ScrollView style={styles.reviewContainer}>
                            <View style={styles.reviewCard}>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Descrição</Text>
                                    <Text style={styles.reviewValue}>{details.description}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Valor</Text>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.reviewValueBold, { color: details.type === 'income' ? '#1e8e3e' : '#d93025' }]}>
                                            R$ {(parseFloat(amountStr) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </Text>
                                        {parseInt(installmentsStr) > 1 && (
                                            <Text style={styles.subtext}>{installmentsStr}x de R$ {((parseFloat(amountStr) || 0) / (parseInt(installmentsStr) || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Data</Text>
                                    <Text style={styles.reviewValue}>{new Date(details.date + 'T00:00:00').toLocaleDateString('pt-BR')}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Categoria</Text>
                                    <View style={styles.tag}>
                                        <ArrowRight size={12} color="#666" />
                                        <Text style={styles.tagText}>{details.category} {' > '} {details.subcategory}</Text>
                                    </View>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Pagamento</Text>
                                    <Text style={styles.reviewValue}>{details.paymentMethod}</Text>
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep('input')}>
                                    <Text style={styles.secondaryBtnText}>Voltar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep('edit')}>
                                    <Edit2 size={16} color="#000" />
                                    <Text style={styles.secondaryBtnText}>Editar Detalhes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirmar e Adicionar</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}

                    {step === 'edit' && (
                        <ScrollView style={styles.editContainer}>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.editLabel}>Descrição</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={details.description}
                                    onChangeText={(val) => handleEditChange('description', val)}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.editLabel}>Valor (R$)</Text>
                                    <TextInput
                                        style={styles.editInput}
                                        keyboardType="numeric"
                                        value={amountStr}
                                        onChangeText={setAmountStr}
                                    />
                                </View>
                                <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.editLabel}>Data</Text>
                                    <TextInput
                                        style={styles.editInput}
                                        placeholder="YYYY-MM-DD"
                                        value={details.date}
                                        onChangeText={(val) => handleEditChange('date', val)}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.editLabel}>Categoria e Subcategoria</Text>
                                <TouchableOpacity
                                    style={styles.pickerContainerElegant}
                                    onPress={() => setIsCatModalOpen(true)}
                                >
                                    <View>
                                        <Text style={styles.selectorTextBold}>{details.category}</Text>
                                        <Text style={styles.selectorTextSub}>{details.subcategory}</Text>
                                    </View>
                                    <ChevronDown size={20} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.editLabel}>Pagamento</Text>
                                    <View style={styles.pickerContainer}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {Object.values(PaymentMethod).map(m => (
                                                <TouchableOpacity
                                                    key={m}
                                                    style={[styles.chip, details.paymentMethod === m && styles.chipActive]}
                                                    onPress={() => handleEditChange('paymentMethod', m)}
                                                >
                                                    <Text style={[styles.chipText, details.paymentMethod === m && styles.chipTextActive]}>{m}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                                <View style={[styles.fieldGroup, { width: 100, marginLeft: 8 }]}>
                                    <Text style={styles.editLabel}>Parcelas</Text>
                                    <TextInput
                                        style={styles.editInput}
                                        keyboardType="numeric"
                                        value={installmentsStr}
                                        onChangeText={setInstallmentsStr}
                                    />
                                </View>
                            </View>

                            <View style={styles.editFooter}>
                                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep('review')}>
                                    <Text style={styles.secondaryBtnText}>Voltar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Salvar Alterações</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>
            <CategorySelectionModal
                isOpen={isCatModalOpen}
                onClose={() => setIsCatModalOpen(false)}
                selectedCategory={details.category}
                selectedSubcategory={details.subcategory}
                onSelect={(cat, sub) => {
                    setDetails({ ...details, category: cat, subcategory: sub });
                }}
                type={details.type}
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
        minHeight: '60%',
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
        color: COLORS.text,
    },
    inputContainer: {
        gap: 16,
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    magicInput: {
        backgroundColor: '#0F172A',
        borderRadius: 24,
        padding: 20,
        fontSize: 18,
        minHeight: 120,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#1E293B',
        color: COLORS.text,
    },
    processBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 18,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        ...SHADOWS.small,
    },
    processBtnText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    reviewContainer: {
        flex: 1,
    },
    reviewCard: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 20,
        gap: 16,
    },
    reviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reviewLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    reviewValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'right',
        flex: 1,
        marginLeft: 12,
    },
    reviewValueBold: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtext: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 208, 156, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    tagText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'column',
        gap: 12,
        marginTop: 24,
        marginBottom: 40,
    },
    editFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
        marginBottom: 40,
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 18,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    confirmBtnText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#1E293B',
        backgroundColor: 'transparent',
        gap: 8,
    },
    secondaryBtnText: {
        color: COLORS.text,
        fontWeight: '600',
    },
    editContainer: {
        flex: 1,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    editLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    editInput: {
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
    },
    pickerContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    chipTextActive: {
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    pickerContainerElegant: {
        backgroundColor: '#0F172A',
        borderRadius: 18,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    selectorTextBold: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    selectorTextSub: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    }
});

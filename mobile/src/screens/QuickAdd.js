
import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { db } from '../lib/db';
import { Zap, Send, CheckCircle2, AlertCircle } from 'lucide-react-native';

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
        const dt = new Date(y, m - 1, d);
        return dt.toISOString().split('T')[0];
    }
    return todayISO;
};

export default function QuickAdd({ accountId }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const handleQuickAdd = async () => {
        if (!input.trim() || !accountId) return;
        setLoading(true);

        // O Mágico: Extração simples de valor e descrição (Igual ao PC)
        const raw = input.toLowerCase();
        const amountMatch = raw.match(/(\d+[\.,]?\d*)\s*(reais|r\$|rs)?/);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.')) : 0;

        const installmentsMatch = raw.match(/(\d+)\s*x/);
        const installments = installmentsMatch ? parseInt(installmentsMatch[1]) : 1;

        const today = new Date().toISOString().split('T')[0];
        const date = parseDateFromText(input, today);

        try {
            await db.addTransaction(accountId, {
                id: Math.random().toString(36).substring(2, 15),
                description: input.trim(),
                amount: amount,
                type: 'expense', // Assume despesa por padrão na entrada rápida
                category: 'A verificar', // A mágica: deixa para classificar depois
                subcategory: 'A classificar',
                date: date,
            });

            setSuccess(true);
            setInput('');
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.delay(2000),
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
            ]).start(() => setSuccess(false));

        } catch (e) {
            console.error(e);
            alert('Erro ao salvar gasto rápido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <View style={styles.zapIcon}>
                        <Zap size={32} color="#000" fill="#000" />
                    </View>
                    <Text style={styles.title}>Lançamento Rápido</Text>
                    <Text style={styles.subtitle}>Apenas descreva o gasto. A IA organizará os detalhes depois.</Text>
                </View>

                <View style={styles.inputCard}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Almoço 45 pix hoje"
                        placeholderTextColor="#999"
                        value={input}
                        onChangeText={setInput}
                        multiline
                        numberOfLines={3}
                        autoFocus
                    />

                    <TouchableOpacity
                        style={[styles.btn, (!input.trim() || loading) && styles.btnDisabled]}
                        onPress={handleQuickAdd}
                        disabled={!input.trim() || loading}
                    >
                        <Send size={20} color="#fff" />
                        <Text style={styles.btnText}>{loading ? 'Lançando...' : 'Lançar Agora'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tips}>
                    <Text style={styles.tipsTitle}>Dicas da Magia ✨</Text>
                    <Text style={styles.tip}>• "Uber 25 ontem"</Text>
                    <Text style={styles.tip}>• "Mercado 350 no crédito"</Text>
                    <Text style={styles.tip}>• "Tênis 600 em 6x"</Text>
                </View>

                {success && (
                    <Animated.View style={[styles.successToast, { opacity: fadeAnim }]}>
                        <CheckCircle2 size={24} color="#1e8e3e" />
                        <Text style={styles.successText}>Gasto lançado com sucesso!</Text>
                    </Animated.View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scroll: {
        padding: 24,
        paddingTop: 80,
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    zapIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#f1f3f4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    inputCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#eee',
    },
    input: {
        fontSize: 20,
        color: '#1a1a1a',
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 24,
    },
    btn: {
        backgroundColor: '#000',
        borderRadius: 16,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    btnDisabled: {
        opacity: 0.5,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tips: {
        marginTop: 40,
        padding: 20,
        backgroundColor: '#fef7e0',
        borderRadius: 16,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b06000',
        marginBottom: 8,
    },
    tip: {
        fontSize: 13,
        color: '#b06000',
        opacity: 0.8,
        marginBottom: 4,
    },
    successToast: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: '#e6f4ea',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#1e8e3e',
    },
    successText: {
        color: '#1e8e3e',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

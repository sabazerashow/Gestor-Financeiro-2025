
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { db } from '../lib/db';
import { TrendingUp, TrendingDown, Bell, ChevronRight, Wallet, Plus, Minus } from 'lucide-react-native';
import AddTransactionModal from '../components/AddTransactionModal';

export default function Dashboard({ accountId }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ transactions: [], bills: [] });
    const [refreshing, setRefreshing] = useState(false);
    const [modalType, setModalType] = useState(null); // 'income' or 'expense'

    const fetchData = async () => {
        if (!accountId) return;
        try {
            const [tx, bl] = await Promise.all([
                db.fetchTransactions(accountId),
                db.fetchBills(accountId)
            ]);
            setData({ transactions: tx, bills: bl });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [accountId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const upcomingReminders = (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        return data.bills
            .filter(bill => !bill.isAutoDebit)
            .map(bill => {
                const dueDate = new Date(currentYear, currentMonth, bill.dueDay || 10);
                return { bill, dueDate };
            })
            .filter(({ bill }) => {
                const hasBeenPaid = data.transactions.some(t =>
                    t.description.toLowerCase().includes((bill.name || bill.description).toLowerCase()) &&
                    new Date(t.date).getMonth() === currentMonth &&
                    new Date(t.date).getFullYear() === currentYear
                );
                return !hasBeenPaid;
            })
            .filter(({ dueDate }) => {
                const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                return diffDays <= 15;
            })
            .sort((a, b) => a.dueDate - b.dueDate);
    })();

    const totalIncome = data.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = data.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const balance = totalIncome - totalExpense;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Visão Geral</Text>
                    <Text style={styles.subtitle}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                </View>

                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceLabel}>Saldo Disponível</Text>
                        <Wallet size={20} color="rgba(255,255,255,0.4)" />
                    </View>
                    <Text style={styles.balanceValue}>R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <TrendingUp size={16} color="#4ade80" />
                            <Text style={styles.statText}>+ R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <TrendingDown size={16} color="#f87171" />
                            <Text style={styles.statText}>- R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                        </View>
                    </View>
                </View>

                {/* Botões de Ação Rápida */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#e6f4ea' }]}
                        onPress={() => setModalType('income')}
                    >
                        <Plus size={20} color="#1e8e3e" />
                        <Text style={[styles.actionBtnText, { color: '#1e8e3e' }]}>Receita</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#fce8e6' }]}
                        onPress={() => setModalType('expense')}
                    >
                        <Minus size={20} color="#d93025" />
                        <Text style={[styles.actionBtnText, { color: '#d93025' }]}>Despesa</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Lembretes de Pagamento</Text>
                        {upcomingReminders.length > 0 && <View style={styles.alertBadge} />}
                    </View>

                    {upcomingReminders.map(({ bill, dueDate }, idx) => {
                        const diffDays = Math.ceil((dueDate - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
                        const isOverdue = diffDays < 0;
                        return (
                            <TouchableOpacity key={bill.id || idx} style={styles.reminderCard}>
                                <View style={[styles.reminderIcon, isOverdue && { backgroundColor: '#fce8e6' }]}>
                                    <Bell size={20} color={isOverdue ? '#d93025' : '#1a73e8'} />
                                </View>
                                <View style={styles.reminderInfo}>
                                    <Text style={styles.reminderName}>{bill.name || bill.description}</Text>
                                    <Text style={[styles.reminderDue, isOverdue && { color: '#d93025', fontWeight: 'bold' }]}>
                                        {isOverdue ? `Atrasado ${Math.abs(diffDays)}d` : `Vence em ${diffDays} dias`}
                                    </Text>
                                </View>
                                <ChevronRight size={18} color="#ccc" />
                            </TouchableOpacity>
                        );
                    })}
                    {upcomingReminders.length === 0 && (
                        <Text style={styles.emptyText}>Tudo em dia por enquanto!</Text>
                    )}
                </View>

                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>Análise Rápida</Text>
                    <View style={styles.insightCard}>
                        <Text style={styles.insightText}>
                            {balance > 0
                                ? "Seu saldo está positivo. Que tal planejar um investimento?"
                                : "Atenção: Suas despesas superaram as receitas este mês."}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <AddTransactionModal
                isOpen={!!modalType}
                onClose={() => setModalType(null)}
                accountId={accountId}
                initialType={modalType}
                onAdded={fetchData}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        textTransform: 'capitalize',
    },
    balanceCard: {
        margin: 24,
        marginTop: 0,
        backgroundColor: '#1a1a1a',
        borderRadius: 24,
        padding: 24,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balanceValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
    },
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 16,
        marginTop: 8,
    },
    actionBtn: {
        flex: 1,
        height: 54,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionBtnText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 24,
        marginTop: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    alertBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#d93025',
    },
    reminderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        marginBottom: 12,
    },
    reminderIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#e8f0fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    reminderInfo: {
        flex: 1,
    },
    reminderName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    reminderDue: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    insightCard: {
        padding: 20,
        backgroundColor: '#f1f3f4',
        borderRadius: 16,
        marginTop: 8,
    },
    insightText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
        fontSize: 14,
    }
});

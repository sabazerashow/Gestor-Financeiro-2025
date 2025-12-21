
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Platform, Dimensions, StatusBar } from 'react-native';
import { db } from '../lib/db';
import { Bell, Plus, Minus, CreditCard, PieChart, TrendingUp, History } from 'lucide-react-native';
import AddTransactionModal from '../components/AddTransactionModal';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { PremiumCard } from '../components/Dashboard/PremiumCard';
import { Squircle } from '../components/common/Squircle';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function Dashboard({ accountId }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ transactions: [] });
    const [refreshing, setRefreshing] = useState(false);
    const [modalType, setModalType] = useState(null);

    const fetchData = async () => {
        if (!accountId) return;
        try {
            const tx = await db.fetchTransactions(accountId);
            setData({ transactions: tx });
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

    const handleAction = (type) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setModalType(type);
    };

    const totalIncome = data.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = data.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const balance = totalIncome - totalExpense;

    // Group transactions by date
    const groupedTransactions = data.transactions.slice(0, 8).reduce((acc, current) => {
        const date = new Date(current.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
        if (!acc[date]) acc[date] = [];
        acc[date].push(current);
        return acc;
    }, {});

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 150 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Bem-vindo de volta,</Text>
                        <Text style={styles.subGreeting}>Sua Conta</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                        <Bell size={24} color={COLORS.text} />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                </View>

                {/* Premium Balance Card */}
                <PremiumCard balance={balance} income={totalIncome} expense={totalExpense} />

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.bigActionItem, { backgroundColor: 'rgba(0, 208, 156, 0.1)' }]}
                        onPress={() => handleAction('income')}
                    >
                        <Squircle color={COLORS.primaryLight} size={64}>
                            <Plus size={32} color={COLORS.primary} strokeWidth={3} />
                        </Squircle>
                        <View style={styles.actionTextContent}>
                            <Text style={styles.bigActionLabel}>Adicionar Receita</Text>
                            <Text style={styles.bigActionSub}>Entradas, salários e extras</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.bigActionItem, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                        onPress={() => handleAction('expense')}
                    >
                        <Squircle color="rgba(255, 90, 90, 0.1)" size={64}>
                            <Minus size={32} color={COLORS.danger} strokeWidth={3} />
                        </Squircle>
                        <View style={styles.actionTextContent}>
                            <Text style={styles.bigActionLabel}>Adicionar Despesa</Text>
                            <Text style={styles.bigActionSub}>Gastos, contas e boletos</Text>
                        </View>
                    </TouchableOpacity>
                </View>


                {/* Content ends here for a cleaner look as requested */}
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
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: SPACING.lg,
    },
    greeting: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    subGreeting: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    notificationBtn: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    badge: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 10,
        height: 10,
        backgroundColor: COLORS.danger,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    actionContainer: {
        marginTop: SPACING.xl,
    },
    actionScroll: {
        paddingHorizontal: SPACING.lg,
    },
    actionItem: {
        alignItems: 'center',
        gap: 8,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
    },
    bigActionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 28,
        marginBottom: 16,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)', // White border with low opacity
    },
    actionTextContent: {
        flex: 1,
    },
    bigActionLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    bigActionSub: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    section: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '700',
    },
    dateHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    transactionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        ...SHADOWS.small,
    },
    transactionDetails: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    transactionCategory: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    amountBox: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '800',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    }
});

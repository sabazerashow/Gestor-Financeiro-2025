import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Platform, StatusBar, FlatList } from 'react-native';
import { db } from '../lib/db';
import { CreditCard, Calendar, Plus, CheckCircle2, AlertCircle, Clock } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Squircle } from '../components/common/Squircle';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function UpcomingPayments({ accountId }) {
    const [loading, setLoading] = useState(true);
    const [bills, setBills] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!accountId) return;
        try {
            const data = await db.fetchBills(accountId);
            // In a real scenario, we would check which ones are already paid this month
            // For now, we show all template bills from the 'bills' table
            const sorted = data.sort((a, b) => a.dueDay - b.dueDay);
            setBills(sorted);
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

    const handlePay = async (bill) => {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Create a transaction based on the bill
            await db.addTransaction(accountId, {
                description: `Pagamento: ${bill.description}`,
                amount: bill.amount || 0,
                type: 'expense',
                category: bill.category || 'Outros',
                date: new Date().toISOString(),
                paymentMethod: 'Débito', // Default
                linkedBillId: bill.id
            });

            // In a more complex app, we'd mark this month as 'paid' for this bill
            // For now, we just give feedback.
            alert(`Pagamento de "${bill.description}" registrado com sucesso!`);
        } catch (e) {
            console.error(e);
            alert('Erro ao processar pagamento.');
        }
    };

    const renderBill = ({ item }) => {
        const today = new Date().getDate();
        const isOverdue = item.dueDay < today;

        return (
            <View style={styles.billCard}>
                <Squircle color={isOverdue ? "rgba(255, 90, 90, 0.1)" : "rgba(0, 208, 156, 0.1)"} size={48}>
                    <CreditCard size={24} color={isOverdue ? COLORS.danger : COLORS.primary} />
                </Squircle>

                <View style={styles.billDetails}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.billName} numberOfLines={1}>{item.description}</Text>
                        {item.isAutoDebit && (
                            <View style={styles.autoDebitBadge}>
                                <Text style={styles.autoDebitText}>DDA</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.dateRow}>
                        <Calendar size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.billDate}>Vence todo dia {String(item.dueDay).padStart(2, '0')}</Text>
                    </View>
                </View>

                <View style={styles.amountContainer}>
                    <Text style={styles.billAmount}>R$ {Number(item.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                    <TouchableOpacity style={styles.payButton} onPress={() => handlePay(item)}>
                        <Text style={styles.payButtonText}>Registrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Pagamentos</Text>
                    <Text style={styles.subtitle}>Acompanhe seus próximos vencimentos</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                    <Plus size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.summarySection}>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryIcon}>
                        <Clock size={20} color={COLORS.primary} />
                    </View>
                    <View>
                        <Text style={styles.summaryLabel}>Total Pendente</Text>
                        <Text style={styles.summaryValue}>
                            R$ {bills.reduce((sum, b) => sum + Number(b.amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={bills}
                renderItem={renderBill}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <CheckCircle2 size={64} color={COLORS.primaryLight} strokeWidth={1} />
                        <Text style={styles.emptyTitle}>Tudo em dia!</Text>
                        <Text style={styles.emptySubtitle}>Você não possui pagamentos pendentes para os próximos dias.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: SPACING.lg,
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    addBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    summarySection: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        ...SHADOWS.small,
    },
    summaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 208, 156, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 200,
    },
    billCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        ...SHADOWS.small,
    },
    billDetails: {
        flex: 1,
        marginLeft: 12,
    },
    billName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    billDate: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    autoDebitBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    autoDebitText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    billAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    payButton: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    payButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.text,
        marginTop: 16,
    },
    emptySubtitle: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginTop: 8,
        lineHeight: 20,
    }
});

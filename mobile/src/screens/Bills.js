
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { db } from '../lib/db';
import { CreditCard, Plus, CheckCircle2, Circle, Calendar, ArrowRight } from 'lucide-react-native';
import AddBillModal from '../components/AddBillModal';

export default function Bills({ accountId }) {
    const [loading, setLoading] = useState(true);
    const [bills, setBills] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        if (!accountId) return;
        try {
            const bl = await db.fetchBills(accountId);
            setBills(bl);
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

    const handlePayBill = (bill) => {
        Alert.alert(
            "Confirmar Pagamento",
            `Deseja marcar "${bill.name || bill.description}" como pago?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        // Aqui no futuro adicionamos a lógica de criar a transação de pagamento
                        // Por enquanto simulamos o sucesso
                        Alert.alert("Sucesso", "Pagamento registrado com sucesso!");
                    }
                }
            ]
        );
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Menu de Contas</Text>
                <Text style={styles.subtitle}>Gerencie seus boletos e pagamentos fixos</Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
                    <Plus size={20} color="#fff" />
                    <Text style={styles.addBtnText}>Nova Conta</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Suas Contas</Text>
                {bills.map((bill, idx) => (
                    <TouchableOpacity
                        key={bill.id || idx}
                        style={styles.billCard}
                        onPress={() => handlePayBill(bill)}
                    >
                        <View style={styles.billIcon}>
                            <CreditCard size={20} color="#000" />
                        </View>
                        <View style={styles.billInfo}>
                            <Text style={styles.billName}>{bill.name || bill.description}</Text>
                            <View style={styles.billMeta}>
                                <Calendar size={12} color="#666" />
                                <Text style={styles.billDue}>Todo dia {bill.due_day || bill.dueDay || '10'}</Text>
                            </View>
                        </View>
                        <View style={styles.billAction}>
                            <Text style={styles.billAmount}>R$ {Number(bill.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                            <ArrowRight size={16} color="#ccc" />
                        </View>
                    </TouchableOpacity>
                ))}
                {bills.length === 0 && (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Nenhuma conta cadastrada ainda.</Text>
                    </View>
                )}
            </View>

            <View style={styles.footerInfo}>
                <Text style={styles.footerText}>
                    Toque em uma conta para registrar o pagamento deste mês.
                </Text>
            </View>

            <AddBillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                accountId={accountId}
                onAdded={fetchData}
            />
        </ScrollView>
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
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    actionRow: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    addBtn: {
        backgroundColor: '#000',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    billCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    billIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    billInfo: {
        flex: 1,
    },
    billName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    billMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    billDue: {
        fontSize: 12,
        color: '#666',
    },
    billAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    billAmount: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    emptyCard: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
    },
    footerInfo: {
        padding: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#ccc',
        textAlign: 'center',
    }
});

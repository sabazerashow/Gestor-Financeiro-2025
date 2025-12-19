
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { db } from '../lib/db';
import { PieChart } from 'react-native-svg-charts';
import { FileText, TrendingUp, ShieldCheck, Info } from 'lucide-react-native';

export default function BPAnalysis({ accountId }) {
    const [loading, setLoading] = useState(true);
    const [payslips, setPayslips] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!accountId) return;
        try {
            const ps = await db.fetchPayslips(accountId);
            setPayslips(ps);
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

    const latestPayslip = payslips[0]; // Assume o mais recente

    if (!latestPayslip) {
        return (
            <View style={styles.emptyContainer}>
                <FileText size={48} color="#ccc" />
                <Text style={styles.emptyTitle}>Nenhum BP Encontrado</Text>
                <Text style={styles.emptySubtitle}>Importe seus contracheques na versão Web para vê-los aqui.</Text>
            </View>
        );
    }

    const netSalary = Number(latestPayslip.netTotal || latestPayslip.amount || 0);
    const deductions = Number(latestPayslip.deductionsTotal || 0);
    const grossSalary = netSalary + deductions;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Análise de BP</Text>
                <Text style={styles.subtitle}>Detalhamento do seu último contracheque</Text>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.salaryRow}>
                    <View>
                        <Text style={styles.salaryLabel}>Salário Líquido</Text>
                        <Text style={styles.salaryValue}>R$ {netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={styles.badge}>
                        <ShieldCheck size={16} color="#1e8e3e" />
                        <Text style={styles.badgeText}>Margem Segura</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '75%', backgroundColor: '#1a73e8' }]} />
                    </View>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressText}>Gastos Fixos: 75%</Text>
                        <Text style={styles.progressText}>Disponível: 25%</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Composição</Text>

                <View style={styles.compositionItem}>
                    <View style={[styles.dot, { backgroundColor: '#1e8e3e' }]} />
                    <Text style={styles.compLabel}>Proventos (Bruto)</Text>
                    <Text style={styles.compValue}>R$ {grossSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                </View>

                <View style={styles.compositionItem}>
                    <View style={[styles.dot, { backgroundColor: '#d93025' }]} />
                    <Text style={styles.compLabel}>Descontos / Retenções</Text>
                    <Text style={styles.compValue}>- R$ {deductions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                </View>

                <View style={[styles.compositionItem, styles.compTotal]}>
                    <Text style={styles.compLabelTotal}>Total Líquido</Text>
                    <Text style={styles.compValueTotal}>R$ {netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                </View>
            </View>

            <View style={styles.infoBox}>
                <Info size={18} color="#1a73e8" />
                <Text style={styles.infoText}>
                    Estes dados são extraídos do seu BP de {latestPayslip.month}/{latestPayslip.year}. Para atualizar, use a Importação OCR na Web.
                </Text>
            </View>
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
    summaryCard: {
        margin: 24,
        marginTop: 0,
        padding: 24,
        backgroundColor: '#f8f9fa',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#eee',
    },
    salaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    salaryLabel: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    salaryValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginTop: 4,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#e6f4ea',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1e8e3e',
    },
    progressContainer: {
        marginTop: 24,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
    },
    section: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 20,
    },
    compositionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
    },
    compLabel: {
        flex: 1,
        fontSize: 14,
        color: '#444',
    },
    compValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    compTotal: {
        borderBottomWidth: 0,
        marginTop: 12,
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
    },
    compLabelTotal: {
        flex: 1,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    compValueTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    infoBox: {
        margin: 24,
        padding: 16,
        backgroundColor: '#e8f0fe',
        borderRadius: 16,
        flexDirection: 'row',
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#1967d2',
        lineHeight: 18,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        color: '#1a1a1a',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    }
});

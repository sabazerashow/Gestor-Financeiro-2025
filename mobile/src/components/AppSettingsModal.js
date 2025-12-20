
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { db } from '../lib/db';
import { seedMockData } from '../lib/seed';
import { X, Database, Trash2, Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Squircle } from './common/Squircle';
import * as Haptics from 'expo-haptics';

export default function AppSettingsModal({ isOpen, onClose, accountId, onDataChanged }) {
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        const confirmed = Platform.OS === 'web'
            ? window.confirm("Deseja popular a conta com dados fictícios para teste?")
            : await new Promise(resolve => {
                Alert.alert("Popular Dados", "Isso irá adicionar várias transações e contas fictícias. Continuar?", [
                    { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
                    { text: "Sim", onPress: () => resolve(true) }
                ]);
            });

        if (!confirmed) return;

        setLoading(true);
        try {
            await seedMockData(accountId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            if (Platform.OS === 'web') {
                alert("Sucesso! Dados populados. O app será reiniciado para atualizar.");
                window.location.reload();
            } else {
                alert("Sucesso! Dados populados. Navegue para outras abas para ver.");
                onDataChanged?.();
            }
        } catch (e) {
            alert("Erro: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        const confirmed = Platform.OS === 'web'
            ? window.confirm("CUIDADO: Isso apagará TODOS os seus lançamentos e contas. Esta ação não tem volta. Tem certeza?")
            : await new Promise(resolve => {
                Alert.alert("APAGAR TUDO", "CUIDADO: Isso apagará TODOS os seus lançamentos e contas. Esta ação não tem volta. Tem certeza?", [
                    { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
                    { text: "APAGAR TUDO", style: "destructive", onPress: () => resolve(true) }
                ]);
            });

        if (!confirmed) return;

        setLoading(true);
        try {
            const count = await db.resetAccountData(accountId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            if (Platform.OS === 'web') {
                alert(`Sucesso! ${count} registros apagados. O app será reiniciado.`);
                window.location.reload();
            } else {
                alert(`Sucesso! ${count} registros apagados.`);
                onDataChanged?.();
            }
        } catch (e) {
            alert("Erro: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const transactions = await db.fetchTransactions(accountId);
            const dataStr = JSON.stringify(transactions, null, 2);

            if (Platform.OS === 'web') {
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `backup_financeiro_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // In a real mobile app, use expo-sharing or similar
                alert('Exportação JSON gerada (Simulação no Mobile)');
                console.log('Mobile Export:', dataStr);
            }
        } catch (e) {
            alert("Erro ao exportar: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        alert('Funcionalidade de Importação em desenvolvimento. Selecione o arquivo JSON no seu dispositivo.');
        // This would involve a FilePicker and validation
    };

    return (
        <Modal visible={isOpen} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Configurações do App</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Ferramentas de Dados</Text>

                            <TouchableOpacity style={styles.option} onPress={handleSeed} disabled={loading}>
                                <Squircle color="rgba(0, 208, 156, 0.1)" size={48}>
                                    <Database size={22} color={COLORS.primary} />
                                </Squircle>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionLabel}>Popular com Dados Fake</Text>
                                    <Text style={styles.optionDesc}>Gera lançamentos fictícios para teste.</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.option} onPress={handleExport} disabled={loading}>
                                <Squircle color="rgba(59, 130, 246, 0.1)" size={48}>
                                    <Download size={22} color="#3B82F6" />
                                </Squircle>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionLabel}>Exportar Backup (JSON)</Text>
                                    <Text style={styles.optionDesc}>Baixe todos os seus dados.</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.option} onPress={handleImport} disabled={loading}>
                                <Squircle color="rgba(168, 85, 247, 0.1)" size={48}>
                                    <Upload size={22} color="#A855F7" />
                                </Squircle>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionLabel}>Importar Backup</Text>
                                    <Text style={styles.optionDesc}>Restaure dados de um arquivo.</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>Zona de Perigo</Text>

                            <TouchableOpacity style={[styles.option, styles.dangerOption]} onPress={handleReset} disabled={loading}>
                                <Squircle color="rgba(255, 90, 90, 0.1)" size={48}>
                                    <Trash2 size={22} color={COLORS.danger} />
                                </Squircle>
                                <View style={styles.optionInfo}>
                                    <Text style={[styles.optionLabel, { color: COLORS.danger }]}>Apagar Todos os Lançamentos</Text>
                                    <Text style={styles.optionDesc}>Isso limpa sua conta permanentemente.</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    content: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 32,
        padding: SPACING.lg,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.premium,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    closeBtn: {
        padding: 4,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: SPACING.lg,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 20,
        marginBottom: 12,
    },
    dangerOption: {
        backgroundColor: 'rgba(255, 90, 90, 0.05)',
        borderColor: 'rgba(255, 90, 90, 0.1)',
        borderWidth: 1,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 158, 11, 0.1)',
        padding: 12,
        borderRadius: 16,
        marginBottom: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#F59E0B',
    },
    optionInfo: {
        flex: 1,
        marginLeft: 16,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    optionDesc: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(11, 14, 17, 0.7)',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

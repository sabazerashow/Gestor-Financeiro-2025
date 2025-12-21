import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING } from '../../constants/theme';
import { Wallet, ArrowUp, ArrowDown } from 'lucide-react-native';

export const PremiumCard = ({ balance, income, expense }) => {
    return (
        <View style={styles.outerContainer}>
            <LinearGradient
                colors={balance < 0 ? ['#D9534F', '#C1413E', '#A92F2D'] : [COLORS.primary, '#05C392', '#00A87E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Decorative Elements */}
                <View style={styles.circle1} />
                <View style={styles.circle2} />

                <View style={styles.header}>
                    <View>
                        <Text style={styles.label}>Saldo Total</Text>
                        <Text style={styles.balanceText}>
                            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <Wallet size={24} color={COLORS.primary} strokeWidth={2.5} />
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.footer}>
                    <View style={styles.stat}>
                        <View style={styles.statLabelRow}>
                            <View style={styles.arrowUp}>
                                <ArrowUp size={12} color="#fff" strokeWidth={3} />
                            </View>
                            <Text style={styles.statLabel}>Entradas</Text>
                        </View>
                        <Text style={styles.statValue}>
                            R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>

                    <View style={styles.stat}>
                        <View style={styles.statLabelRow}>
                            <View style={styles.arrowDown}>
                                <ArrowDown size={12} color="#fff" strokeWidth={3} />
                            </View>
                            <Text style={styles.statLabel}>Saídas</Text>
                        </View>
                        <Text style={styles.statValue}>
                            R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        marginHorizontal: SPACING.lg,
        ...SHADOWS.premium,
    },
    card: {
        borderRadius: 32,
        padding: SPACING.lg,
        height: 200,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    circle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    circle2: {
        position: 'absolute',
        bottom: -20,
        left: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    balanceText: {
        color: '#fff',
        fontSize: 34,
        fontWeight: 'bold',
        letterSpacing: -1,
    },
    iconContainer: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 16,
        ...SHADOWS.small,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginVertical: SPACING.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stat: {
        flex: 1,
    },
    statLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginLeft: 6,
    },
    statValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    arrowUp: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowDown: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(239, 68, 68, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

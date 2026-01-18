import React from 'react';
import { motion } from 'framer-motion';
import { colors, typography, spacing, shadows, borderRadius } from '../lib/designSystem';

interface MetricCardProps {
    label: string;
    value: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: 'success' | 'danger' | 'primary' | 'warning';
    delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, trend, color, delay = 0 }) => {
    const colorMap = {
        success: colors.success,
        danger: colors.danger,
        primary: colors.primary,
        warning: colors.warning,
    };

    const bgColorMap = {
        success: '#ECFDF5',
        danger: '#FEF2F2',
        primary: '#EFF6FF',
        warning: '#FFF7ED',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            style={{
                padding: spacing.card,
                boxShadow: shadows.md,
            }}
        >
            {/* Background decoration */}
            <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ backgroundColor: colorMap[color] }}
            />

            {/* Label */}
            <p
                className="uppercase font-bold tracking-wider mb-2"
                style={{
                    fontSize: typography.small.size,
                    color: colors.gray[500],
                    letterSpacing: typography.small.letterSpacing,
                }}
            >
                {label}
            </p>

            {/* Value */}
            <p
                className="font-black tracking-tight mb-2"
                style={{
                    fontSize: '32px',
                    lineHeight: '1.2',
                    color: colors.gray[900],
                    letterSpacing: '-0.02em',
                }}
            >
                {value}
            </p>

            {/* Trend */}
            {trend && (
                <div className="flex items-center gap-1">
                    <span
                        className="font-bold"
                        style={{
                            fontSize: typography.caption.size,
                            color: trend.isPositive ? colors.success : colors.danger,
                        }}
                    >
                        {Math.abs(trend.value)}%
                    </span>
                    <span
                        className="font-medium"
                        style={{
                            fontSize: typography.caption.size,
                            color: colors.gray[400],
                        }}
                    >
                        vs mês anterior
                    </span>
                </div>
            )}
        </motion.div>
    );
};

interface MetricsRowProps {
    currentBalance: number;
    income: number;
    expense: number;
    projectedBalance: number;
}

const MetricsRow: React.FC<MetricsRowProps> = ({
    currentBalance,
    income,
    expense,
    projectedBalance,
}) => {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // Calcular tendências (mock - você pode calcular comparando com mês anterior)
    const balanceTrend = currentBalance > 0 ? { value: 12, isPositive: true } : undefined;
    const incomeTrend = { value: 5, isPositive: true };
    const expenseTrend = { value: 8, isPositive: false };
    const projectionStatus = projectedBalance >= 0 ? 'success' : 'danger';

    return (
        <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
            style={{ marginBottom: spacing.section }}
        >
            <MetricCard
                label="Saldo Atual"
                value={formatCurrency(currentBalance)}
                trend={balanceTrend}
                color={currentBalance >= 0 ? 'success' : 'danger'}
                delay={0}
            />

            <MetricCard
                label="Receitas"
                value={formatCurrency(income)}
                trend={incomeTrend}
                color="success"
                delay={0.1}
            />

            <MetricCard
                label="Despesas"
                value={formatCurrency(expense)}
                trend={expenseTrend}
                color="danger"
                delay={0.2}
            />

            <MetricCard
                label="Previsão"
                value={formatCurrency(projectedBalance)}
                color={projectionStatus}
                delay={0.3}
            />
        </div>
    );
};

export default MetricsRow;

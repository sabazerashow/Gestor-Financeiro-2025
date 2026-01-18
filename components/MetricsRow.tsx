import React from 'react';
import { motion } from 'framer-motion';
import { colors, typography, spacing, shadows } from '../lib/designSystem';

interface MetricCardProps {
    label: string;
    value: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: 'success' | 'danger' | 'primary' | 'warning';
    note?: string;
    delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, trend, color, note, delay = 0 }) => {
    const colorMap = {
        success: colors.success,
        danger: colors.danger,
        primary: colors.primary,
        warning: colors.warning,
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

            {note && (
                <p className="mt-3 text-[10px] font-bold text-gray-400 leading-snug max-w-[32ch]">
                    {note}
                </p>
            )}
        </motion.div>
    );
};

interface CombinedMetricsCardProps {
    currentBalance: number;
    income: number;
    expense: number;
    balanceTrend?: { value: number; isPositive: boolean };
    incomeTrend?: { value: number; isPositive: boolean };
    expenseTrend?: { value: number; isPositive: boolean };
    delay?: number;
}

const CombinedMetricsCard: React.FC<CombinedMetricsCardProps> = ({
    currentBalance,
    income,
    expense,
    balanceTrend,
    incomeTrend,
    expenseTrend,
    delay = 0,
}) => {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const valueColors = {
        balance: currentBalance >= 0 ? colors.success : colors.danger,
        income: colors.success,
        expense: colors.danger,
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
            <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ backgroundColor: colors.primary }}
            />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="py-2 sm:py-0 sm:pr-6">
                    <p
                        className="uppercase font-bold tracking-wider mb-2"
                        style={{
                            fontSize: typography.small.size,
                            color: colors.gray[500],
                            letterSpacing: typography.small.letterSpacing,
                        }}
                    >
                        Saldo Atual
                    </p>
                    <p
                        className="font-black tracking-tight mb-2"
                        style={{
                            fontSize: '32px',
                            lineHeight: '1.2',
                            color: valueColors.balance,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {formatCurrency(currentBalance)}
                    </p>
                    {balanceTrend && (
                        <div className="flex items-center gap-1">
                            <span
                                className="font-bold"
                                style={{
                                    fontSize: typography.caption.size,
                                    color: balanceTrend.isPositive ? colors.success : colors.danger,
                                }}
                            >
                                {Math.abs(balanceTrend.value)}%
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
                </div>

                <div className="py-4 sm:py-0 sm:px-6">
                    <p
                        className="uppercase font-bold tracking-wider mb-2"
                        style={{
                            fontSize: typography.small.size,
                            color: colors.gray[500],
                            letterSpacing: typography.small.letterSpacing,
                        }}
                    >
                        Receitas
                    </p>
                    <p
                        className="font-black tracking-tight mb-2"
                        style={{
                            fontSize: '32px',
                            lineHeight: '1.2',
                            color: valueColors.income,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {formatCurrency(income)}
                    </p>
                    {incomeTrend && (
                        <div className="flex items-center gap-1">
                            <span
                                className="font-bold"
                                style={{
                                    fontSize: typography.caption.size,
                                    color: incomeTrend.isPositive ? colors.success : colors.danger,
                                }}
                            >
                                {Math.abs(incomeTrend.value)}%
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
                </div>

                <div className="py-2 sm:py-0 sm:pl-6">
                    <p
                        className="uppercase font-bold tracking-wider mb-2"
                        style={{
                            fontSize: typography.small.size,
                            color: colors.gray[500],
                            letterSpacing: typography.small.letterSpacing,
                        }}
                    >
                        Despesas
                    </p>
                    <p
                        className="font-black tracking-tight mb-2"
                        style={{
                            fontSize: '32px',
                            lineHeight: '1.2',
                            color: valueColors.expense,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {formatCurrency(expense)}
                    </p>
                    {expenseTrend && (
                        <div className="flex items-center gap-1">
                            <span
                                className="font-bold"
                                style={{
                                    fontSize: typography.caption.size,
                                    color: expenseTrend.isPositive ? colors.success : colors.danger,
                                }}
                            >
                                {Math.abs(expenseTrend.value)}%
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
                </div>
            </div>
        </motion.div>
    );
};

interface MetricsRowProps {
    currentBalance: number;
    income: number;
    expense: number;
    projectedBalance: number;
    previousMonthSummary?: {
        income: number;
        expense: number;
        balance: number;
    };
}

const MetricsRow: React.FC<MetricsRowProps> = ({
    currentBalance,
    income,
    expense,
    projectedBalance,
    previousMonthSummary,
}) => {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const calculateTrend = (current: number, previous: number, options?: { lowerIsBetter?: boolean }) => {
        const denom = Math.abs(previous);
        if (!Number.isFinite(denom) || denom === 0) return undefined;
        const delta = current - previous;
        const pct = Math.round((delta / denom) * 100);
        const lowerIsBetter = options?.lowerIsBetter === true;
        const isPositive = lowerIsBetter ? current <= previous : current >= previous;
        return { value: pct, isPositive };
    };

    const balanceTrend = previousMonthSummary
        ? calculateTrend(currentBalance, previousMonthSummary.balance)
        : undefined;

    const incomeTrend = previousMonthSummary
        ? calculateTrend(income, previousMonthSummary.income)
        : undefined;

    const expenseTrend = previousMonthSummary
        ? calculateTrend(expense, previousMonthSummary.expense, { lowerIsBetter: true })
        : undefined;

    const projectionStatus = projectedBalance >= 0 ? 'success' : 'danger';

    return (
        <div
            className="grid grid-cols-1 xl:grid-cols-3 gap-5"
            style={{ marginBottom: spacing.section }}
        >
            <div className="xl:col-span-2">
                <CombinedMetricsCard
                    currentBalance={currentBalance}
                    income={income}
                    expense={expense}
                    balanceTrend={balanceTrend}
                    incomeTrend={incomeTrend}
                    expenseTrend={expenseTrend}
                    delay={0}
                />
            </div>

            <MetricCard
                label="Previsão"
                value={formatCurrency(projectedBalance)}
                color={projectionStatus}
                delay={0.1}
                note="Baseado no saldo atual, contas a vencer e média diária de despesas."
            />
        </div>
    );
};

export default MetricsRow;

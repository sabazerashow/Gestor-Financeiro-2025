import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, ScrollView, Platform, StatusBar } from 'react-native';
import { db } from '../lib/db';
import { Search, Filter, Sparkles, Trash2, Edit2, History, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Squircle } from '../components/common/Squircle';
import * as Haptics from 'expo-haptics';
import { generateGLMContent } from '../lib/aiClient';
import { categories } from '../lib/constants';
import { ActivityIndicator, Alert, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function Transactions({ accountId }) {
    const [loading, setLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'charts'
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Todas');

    const fetchData = async () => {
        if (!accountId) return;
        try {
            const tx = await db.fetchTransactions(accountId);
            setTransactions(tx);
            setFilteredTransactions(tx);
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

    useEffect(() => {
        let filtered = transactions.filter(t =>
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.category?.toLowerCase().includes(search.toLowerCase())
        );

        if (activeFilter === 'Entradas') filtered = filtered.filter(t => t.type === 'income');
        if (activeFilter === 'Saídas') filtered = filtered.filter(t => t.type === 'expense');

        setFilteredTransactions(filtered);
    }, [search, transactions, activeFilter]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleFilterPress = (filter) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveFilter(filter);
    };

    const handleAIClassification = async () => {
        const pending = transactions.filter(t => t.category === 'A verificar');
        if (pending.length === 0) {
            Alert.alert('IA', 'Nenhum registro marcado como "A verificar".');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsAnalyzing(true);

        const availableCategories = JSON.stringify(
            Object.fromEntries(
                Object.keys(categories)
                    .filter(catName => catName !== 'Receitas/Entradas')
                    .map(catName => [catName, categories[catName].subcategories])
            ), null, 2
        );

        try {
            for (const t of pending) {
                const glmMessages = [
                    { role: 'system', content: 'Você é um classificador de despesas pessoais. Responda APENAS com JSON: {"category":"...","subcategory":"..."}' },
                    { role: 'user', content: `Descrição: ${t.description}\nEstrutura:\n${availableCategories}` }
                ];

                const glmResp = await generateGLMContent({
                    model: 'glm-4',
                    messages: glmMessages,
                    temperature: 0.1
                });

                const content = glmResp?.choices?.[0]?.message?.content || '';
                const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
                const suggestion = JSON.parse(cleanJson);

                if (suggestion.category && categories[suggestion.category]) {
                    const chosenSub = suggestion.subcategory && categories[suggestion.category].subcategories.includes(suggestion.subcategory)
                        ? suggestion.subcategory
                        : categories[suggestion.category].subcategories[0];

                    await db.updateTransaction(t.id, {
                        category: suggestion.category,
                        subcategory: chosenSub
                    });
                }
            }
            fetchData();
            Alert.alert('Sucesso', 'Registros classificados com sucesso pela IA.');
        } catch (err) {
            console.error(err);
            Alert.alert('Erro', 'Falha ao classificar com IA.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderItem = ({ item }) => {
        const isVerificar = item.category === 'A verificar';
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
                <Squircle
                    color={item.type === 'income' ? COLORS.primaryLight : '#FFEBEE'}
                    size={48}
                >
                    {item.type === 'income' ? (
                        <TrendingUp size={20} color={COLORS.primary} />
                    ) : (
                        <TrendingDown size={20} color={COLORS.danger} />
                    )}
                </Squircle>

                <View style={styles.cardContent}>
                    <View style={styles.cardMain}>
                        <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                        <Text style={styles.amount}>
                            {item.type === 'income' ? '+' : '-'} R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>

                    <View style={styles.cardSub}>
                        <Text style={styles.category}>{item.category} • {item.paymentMethod || 'Outro'}</Text>
                        <Text style={styles.date}>{format(new Date(item.date), "dd MMM", { locale: ptBR })}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Lançamentos</Text>
                    <TouchableOpacity
                        style={[styles.aiButton, isAnalyzing && { opacity: 0.7 }]}
                        onPress={handleAIClassification}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <Sparkles size={16} color={COLORS.primary} strokeWidth={2.5} />
                        )}
                        <Text style={styles.aiButtonText}>
                            {isAnalyzing ? 'Classificando...' : 'Classificar com IA'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Search size={20} color={COLORS.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="O que você está procurando?"
                        placeholderTextColor="#4A5568"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterContainer}
                >
                    <TouchableOpacity
                        style={[styles.viewTab, viewMode === 'list' && styles.viewTabActive]}
                        onPress={() => setViewMode('list')}
                    >
                        <Text style={[styles.viewTabText, viewMode === 'list' && styles.viewTabTextActive]}>Lista</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewTab, viewMode === 'charts' && styles.viewTabActive]}
                        onPress={() => setViewMode('charts')}
                    >
                        <Text style={[styles.viewTabText, viewMode === 'charts' && styles.viewTabTextActive]}>Gráficos</Text>
                    </TouchableOpacity>

                    <View style={styles.tabDivider} />

                    {['Todas', 'Entradas', 'Saídas'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                activeFilter === filter && styles.filterChipActive
                            ]}
                            onPress={() => handleFilterPress(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter && styles.filterTextActive
                            ]}>{filter}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {viewMode === 'list' ? (
                <FlatList
                    data={filteredTransactions}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Nada por aqui ainda.</Text>
                        </View>
                    }
                />
            ) : (
                <ScrollView
                    style={styles.chartsContainer}
                    contentContainerStyle={{ paddingBottom: 150 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                >
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Análise de Fluxo</Text>
                        <View style={styles.chartContent}>
                            <Svg width={180} height={180} viewBox="0 0 100 100">
                                <Circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="#1E293B"
                                    strokeWidth="12"
                                    fill="transparent"
                                />
                                {(() => {
                                    const totals = filteredTransactions.reduce((acc, t) => {
                                        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
                                        return acc;
                                    }, {});
                                    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
                                    if (grandTotal === 0) return null;

                                    let cumulativePercent = 0;
                                    return Object.entries(totals)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([cat, val], i) => {
                                            const percentage = val / grandTotal;
                                            const strokeDasharray = "251.2";
                                            const strokeDashoffset = 251.2 * (1 - percentage);
                                            const rotation = (cumulativePercent * 360) - 90;
                                            cumulativePercent += percentage;
                                            const catColor = categories[cat]?.color || COLORS.primary;

                                            return (
                                                <Circle
                                                    key={i}
                                                    cx="50"
                                                    cy="50"
                                                    r="40"
                                                    stroke={catColor}
                                                    strokeWidth="12"
                                                    fill="transparent"
                                                    strokeDasharray={strokeDasharray}
                                                    strokeDashoffset={strokeDashoffset}
                                                    strokeLinecap="round"
                                                    transform={`rotate(${rotation} 50 50)`}
                                                />
                                            );
                                        });
                                })()}
                            </Svg>

                            <View style={styles.chartLegend}>
                                {Object.entries(
                                    filteredTransactions.reduce((acc, t) => {
                                        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
                                        return acc;
                                    }, {})
                                ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([cat, val], i) => (
                                    <View key={i} style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: categories[cat]?.color || COLORS.primary }]} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.legendLabel} numberOfLines={1}>{cat}</Text>
                                            <Text style={styles.legendValue}>R$ {val.toLocaleString('pt-BR')}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.summaryGrid}>
                        <View style={[styles.summaryItem, { borderLeftColor: COLORS.primary }]}>
                            <Text style={styles.summaryLabel}>Total Entradas</Text>
                            <Text style={[styles.summaryValue, { color: COLORS.primary }]}>
                                R$ {filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString('pt-BR')}
                            </Text>
                        </View>
                        <View style={[styles.summaryItem, { borderLeftColor: COLORS.danger }]}>
                            <Text style={styles.summaryLabel}>Total Saídas</Text>
                            <Text style={[styles.summaryValue, { color: COLORS.danger }]}>
                                R$ {filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString('pt-BR')}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: SPACING.md,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        ...SHADOWS.small,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    aiButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.primaryDark,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        marginHorizontal: SPACING.lg,
        paddingHorizontal: 16,
        borderRadius: 16,
        height: 48,
        gap: 12,
        marginBottom: SPACING.lg,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    filterScroll: {
        paddingLeft: SPACING.lg,
    },
    filterContainer: {
        paddingRight: SPACING.lg,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#0F172A',
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    filterTextActive: {
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: SPACING.lg,
        paddingBottom: 200,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        ...SHADOWS.small,
    },
    cardContent: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    cardMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    description: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
        marginRight: 8,
    },
    amount: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    cardSub: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    category: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    date: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    viewTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#0F172A',
        marginRight: 8,
    },
    viewTabActive: {
        backgroundColor: COLORS.primaryLight,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    viewTabText: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        fontSize: 13,
    },
    viewTabTextActive: {
        color: COLORS.primary,
    },
    tabDivider: {
        width: 1,
        height: '60%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center',
        marginRight: 12,
    },
    chartsContainer: {
        flex: 1,
        padding: SPACING.lg,
    },
    chartCard: {
        backgroundColor: COLORS.white,
        borderRadius: 32,
        padding: 24,
        ...SHADOWS.small,
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 24,
    },
    chartContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    chartLegend: {
        flex: 1,
        marginLeft: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    legendLabel: {
        flex: 1,
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    legendValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 2,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    summaryItem: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        borderLeftWidth: 4,
        ...SHADOWS.small,
    },
    summaryLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
    }
});

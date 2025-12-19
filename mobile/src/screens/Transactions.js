
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { db } from '../lib/db';
import { Search, Filter, DollarSign, Calendar, Sparkles, Trash2, Edit2 } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Transactions({ accountId }) {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

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
        const filtered = transactions.filter(t =>
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.category?.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredTransactions(filtered);
    }, [search, transactions]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderItem = ({ item }) => {
        const isVerificar = item.category === 'A verificar';
        return (
            <View style={styles.txItem}>
                {/* Barra lateral indicativa como na Imagem 1 */}
                <View style={[styles.indicator, { backgroundColor: item.type === 'income' ? '#4ade80' : (isVerificar ? '#d93025' : '#ccc') }]} />

                <View style={styles.txContent}>
                    <View style={styles.txMain}>
                        <View style={styles.txInfo}>
                            <Text style={styles.txDescription}>{item.description}</Text>
                            <View style={styles.txMeta}>
                                <Text style={styles.txDate}>{format(new Date(item.date), "dd/MM/yyyy")}</Text>
                                <Text style={styles.txDot}>•</Text>
                                <View style={[styles.categoryBadge, isVerificar && styles.categoryBadgeVerificar]}>
                                    {isVerificar && <Text style={styles.warningIcon}>⚠️</Text>}
                                    <Text style={[styles.txCategory, isVerificar && styles.txCategoryVerificar]}>
                                        {item.category} {' > '} {item.subcategory || 'A classificar'}
                                    </Text>
                                </View>
                                <Text style={styles.txDot}>•</Text>
                                <Text style={styles.txMethod}>{item.paymentMethod || 'Outro'}</Text>
                            </View>
                        </View>
                        <View style={styles.txRight}>
                            <Text style={[styles.txAmount, { color: item.type === 'income' ? '#1e8e3e' : '#1a1a1a' }]}>
                                R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>
                            <View style={styles.txActions}>
                                <TouchableOpacity onPress={() => { }}>
                                    <Edit2 size={16} color="#999" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { }}>
                                    <Trash2 size={16} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.title}>Lançamentos</Text>
                    <TouchableOpacity style={styles.analyzeBtn}>
                        <Sparkles size={16} color="#fff" />
                        <Text style={styles.analyzeBtnText}>Analisar registros</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.filtersWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
                        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
                            <Text style={styles.filterChipTextActive}>Todas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.filterChip}>
                            <Text style={styles.filterChipText}>À Vista</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.filterChip}>
                            <Text style={styles.filterChipText}>Parceladas</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={18} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar lançamentos..."
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            <FlatList
                data={filteredTransactions}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id || index.toString()}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>{search ? 'Nenhum resultado encontrado.' : 'Nenhuma transação registrada.'}</Text>
                    </View>
                }
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
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    analyzeBtn: {
        backgroundColor: '#1a1a1a',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    analyzeBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    filtersWrapper: {
        marginBottom: 16,
    },
    filtersScroll: {
        flexDirection: 'row',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#1a1a1a',
    },
    filterChipText: {
        fontSize: 13,
        color: '#666',
    },
    filterChipTextActive: {
        fontSize: 13,
        color: '#fff',
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 14,
        color: '#1a1a1a',
    },
    list: {
        paddingBottom: 40,
    },
    txItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    indicator: {
        width: 4,
        height: '100%',
    },
    txContent: {
        flex: 1,
        padding: 16,
    },
    txMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    txInfo: {
        flex: 1,
        marginRight: 12,
    },
    txDescription: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    txMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    txDate: {
        fontSize: 12,
        color: '#666',
    },
    txDot: {
        marginHorizontal: 6,
        color: '#ccc',
        fontSize: 12,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f3f4',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    categoryBadgeVerificar: {
        backgroundColor: '#fef7e0',
    },
    warningIcon: {
        fontSize: 10,
        marginRight: 4,
    },
    txCategory: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666',
    },
    txCategoryVerificar: {
        color: '#b06000',
    },
    txMethod: {
        fontSize: 11,
        color: '#1a73e8',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    txRight: {
        alignItems: 'flex-end',
    },
    txAmount: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    txActions: {
        flexDirection: 'row',
        gap: 12,
    },
    empty: {
        paddingTop: 80,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
        fontStyle: 'italic',
    }
});

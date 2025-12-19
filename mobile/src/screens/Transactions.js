
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { db } from '../lib/db';
import { Search, Filter, DollarSign, Calendar } from 'lucide-react-native';
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

    const renderItem = ({ item }) => (
        <View style={styles.txItem}>
            <View style={[styles.txIcon, { backgroundColor: item.type === 'income' ? '#e6f4ea' : '#f8f9fa' }]}>
                <DollarSign size={20} color={item.type === 'income' ? '#1e8e3e' : '#5f6368'} />
            </View>
            <View style={styles.txInfo}>
                <Text style={styles.txDescription}>{item.description}</Text>
                <View style={styles.txMeta}>
                    <Text style={styles.txCategory}>{item.category || 'Geral'}</Text>
                    <Text style={styles.txDot}>•</Text>
                    <Text style={styles.txDate}>{format(new Date(item.date), "dd 'de' MMM", { locale: ptBR })}</Text>
                </View>
            </View>
            <Text style={[styles.txAmount, { color: item.type === 'income' ? '#1e8e3e' : '#d93025' }]}>
                {item.type === 'income' ? '+' : '-'} R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Transações</Text>
                <View style={styles.searchContainer}>
                    <Search size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por descrição ou categoria..."
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            <FlatList
                data={filteredTransactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
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
        paddingTop: 40,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
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
        fontSize: 15,
        color: '#1a1a1a',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    txItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    txIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    txInfo: {
        flex: 1,
    },
    txDescription: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    txMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    txCategory: {
        fontSize: 12,
        color: '#666',
    },
    txDot: {
        fontSize: 12,
        color: '#ccc',
        marginHorizontal: 8,
    },
    txDate: {
        fontSize: 12,
        color: '#666',
    },
    txAmount: {
        fontSize: 15,
        fontWeight: 'bold',
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

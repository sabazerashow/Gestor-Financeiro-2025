
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, FlatList } from 'react-native';
import { categories } from '../lib/constants';
import { X, ChevronRight, Check } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export default function CategorySelectionModal({ isOpen, onClose, onSelect, selectedCategory, selectedSubcategory, type = 'expense' }) {
    const [step, setStep] = useState('category'); // 'category' or 'subcategory'
    const [tempCategory, setTempCategory] = useState(selectedCategory);

    const categoryList = Object.entries(categories)
        .filter(([_, info]) => info.type === type)
        .map(([name, info]) => ({ name, ...info }));

    const handleCategorySelect = (catName) => {
        setTempCategory(catName);
        setStep('subcategory');
    };

    const handleSubcategorySelect = (subName) => {
        onSelect(tempCategory, subName);
        setStep('category');
        onClose();
    };

    const resetAndClose = () => {
        setStep('category');
        onClose();
    };

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={resetAndClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {step === 'category' ? 'Selecionar Categoria' : `Subcategorias de ${tempCategory}`}
                        </Text>
                        <TouchableOpacity onPress={resetAndClose}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {step === 'category' ? (
                        <FlatList
                            data={categoryList}
                            keyExtractor={(item) => item.name}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.item, selectedCategory === item.name && styles.itemSelected]}
                                    onPress={() => handleCategorySelect(item.name)}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                                        <Text style={{ fontSize: 18 }}>{item.icon === 'utensils' ? '🍴' : item.icon === 'home' ? '🏠' : '📦'}</Text>
                                    </View>
                                    <Text style={styles.itemText}>{item.name}</Text>
                                    {selectedCategory === item.name && <Check size={18} color="#1a73e8" />}
                                    <ChevronRight size={18} color="#ccc" />
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <ScrollView>
                            {categories[tempCategory]?.subcategories.map(sub => (
                                <TouchableOpacity
                                    key={sub}
                                    style={[styles.item, selectedSubcategory === sub && styles.itemSelected]}
                                    onPress={() => handleSubcategorySelect(sub)}
                                >
                                    <Text style={styles.itemText}>{sub}</Text>
                                    {selectedSubcategory === sub ? <Check size={18} color="#1a73e8" /> : <View style={{ width: 18 }} />}
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={styles.backBtn} onPress={() => setStep('category')}>
                                <Text style={styles.backBtnText}>Voltar para Categorias</Text>
                            </TouchableOpacity>
                        </ScrollView>
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
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: COLORS.secondary,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
    },
    itemSelected: {
        backgroundColor: 'rgba(0, 208, 156, 0.05)',
        borderRadius: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    backBtn: {
        marginTop: 24,
        padding: 16,
        alignItems: 'center',
    },
    backBtnText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    }
});

import React, { useState, useEffect } from 'react';
import { Bill } from '../types';
import { categories, expenseCategoryList } from '../categories';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Checkbox } from './ui/checkbox';

interface EditBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    bill: Bill;
    onUpdate: (id: string, updates: Partial<Bill>) => void;
}

const EditBillModal: React.FC<EditBillModalProps> = ({ isOpen, onClose, bill, onUpdate }) => {
    const [description, setDescription] = useState(bill.description);
    const [dueDay, setDueDay] = useState(bill.dueDay.toString());
    const [isAutoDebit, setIsAutoDebit] = useState(bill.isAutoDebit);
    const [amount, setAmount] = useState(bill.amount?.toString() || '');
    const [category, setCategory] = useState(bill.category || '');
    const [subcategory, setSubcategory] = useState(bill.subcategory || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (category && categories[category]) {
            // Only reset subcategory if it's not one of the available subcategories for the new category
            if (!categories[category].subcategories.includes(subcategory)) {
                setSubcategory(categories[category].subcategories[0]);
            }
        }
    }, [category]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const day = parseInt(dueDay, 10);

        if (!description || !dueDay) {
            setError('Descrição e dia do vencimento são obrigatórios.');
            return;
        }
        if (isNaN(day) || day < 1 || day > 31) {
            setError('O dia do vencimento deve ser um número entre 1 e 31.');
            return;
        }

        let updates: Partial<Bill> = {
            description,
            dueDay: day,
            isAutoDebit,
        };

        if (isAutoDebit) {
            const numericAmount = parseFloat(amount);
            if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
                setError('Para débito automático, o valor fixo é obrigatório.');
                return;
            }
            if (!category || !subcategory) {
                setError('Para débito automático, a categoria e a subcategoria são obrigatórias.');
                return;
            }
            updates = { ...updates, amount: numericAmount, category, subcategory };
        } else {
            // Clear these if turned off
            updates = { ...updates, amount: undefined, category: undefined, subcategory: undefined };
        }

        onUpdate(bill.id, updates);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <i className="fas fa-edit"></i>
                        </div>
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">EDITAR CONTA</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-bill-description">Descrição da Conta</Label>
                        <Input
                            type="text"
                            id="edit-bill-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-bill-due-day">Dia do Vencimento (1-31)</Label>
                        <Input
                            type="number"
                            id="edit-bill-due-day"
                            value={dueDay}
                            onChange={(e) => setDueDay(e.target.value)}
                            min={1}
                            max={31}
                        />
                    </div>
                    <div className="flex items-center gap-2 py-2">
                        <Checkbox
                            id="edit-bill-auto-debit"
                            checked={isAutoDebit}
                            onChange={(e) => setIsAutoDebit(e.target.checked)}
                        />
                        <Label htmlFor="edit-bill-auto-debit">Débito Automático fixo?</Label>
                    </div>

                    {isAutoDebit && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-bill-amount">Valor Fixo (R$)</Label>
                                <Input
                                    type="number"
                                    id="edit-bill-amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    step="0.01"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-bill-category">Categoria</Label>
                                <Select id="edit-bill-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option value="" disabled>Selecione</option>
                                    {expenseCategoryList.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-bill-subcategory">Subcategoria</Label>
                                <Select
                                    id="edit-bill-subcategory"
                                    value={subcategory}
                                    onChange={(e) => setSubcategory(e.target.value)}
                                    disabled={!category}
                                >
                                    <option value="" disabled>Selecione</option>
                                    {category && categories[category]?.subcategories.map(subcat => (
                                        <option key={subcat} value={subcat}>{subcat}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1">Salvar Alterações</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBillModal;

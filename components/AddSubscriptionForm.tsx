import React, { useState, useEffect } from 'react';
import { Bill } from '../types';
import { categories, expenseCategoryList } from '../categories';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { getProviderOptions } from '../lib/providerLogos';

interface AddSubscriptionFormProps {
    onAddBill: (bill: Omit<Bill, 'id' | 'recurringTransactionId'>) => void;
}

const AddSubscriptionForm: React.FC<AddSubscriptionFormProps> = ({ onAddBill }) => {
    const [description, setDescription] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [isAutoDebit, setIsAutoDebit] = useState(false);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [paymentUrl, setPaymentUrl] = useState('');
    const [paymentUser, setPaymentUser] = useState('');
    const [paymentPass, setPaymentPass] = useState('');

    // Novos campos
    const [providerLogo, setProviderLogo] = useState('');
    const [contractEndDate, setContractEndDate] = useState('');
    const [lastAmount, setLastAmount] = useState('');

    const [error, setError] = useState('');

    const providerOptions = getProviderOptions();

    useEffect(() => {
        // When category changes, reset subcategory and set a default if possible
        if (category && categories[category]) {
            setSubcategory(categories[category].subcategories[0]);
        } else {
            setSubcategory('');
        }
    }, [category]);

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

        let billData: Omit<Bill, 'id' | 'recurringTransactionId'> = {
            description,
            dueDay: day,
            isAutoDebit,
            paymentUrl,
            paymentUser,
            paymentPass,
            providerLogo: providerLogo || undefined,
            contractEndDate: contractEndDate || undefined,
            lastAmount: lastAmount ? parseFloat(lastAmount) : undefined,
            status: 'pending', // Sempre começa como pending
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
            billData = { ...billData, amount: numericAmount, category, subcategory };
        }

        onAddBill(billData);

        // Reset form
        setDescription('');
        setDueDay('');
        setIsAutoDebit(false);
        setAmount('');
        setCategory('');
        setSubcategory('');
        setPaymentUrl('');
        setPaymentUser('');
        setPaymentPass('');
        setProviderLogo('');
        setContractEndDate('');
        setLastAmount('');
        setError('');
    };

    return (
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                    <i className="fas fa-plus"></i>
                </div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adicionar Assinatura</h2>
            </div>
            <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Descrição */}
                    <div className="grid gap-2">
                        <Label htmlFor="bill-description">Descrição da Assinatura *</Label>
                        <Input
                            type="text"
                            id="bill-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: Netflix, Internet, Aluguel"
                        />
                    </div>

                    {/* Provedor/Serviço */}
                    <div className="grid gap-2">
                        <Label htmlFor="bill-provider">Serviço / Provedor</Label>
                        <Select
                            id="bill-provider"
                            value={providerLogo}
                            onChange={(e) => setProviderLogo(e.target.value)}
                        >
                            <option value="">Selecione (opcional)</option>
                            {providerOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </Select>
                        <p className="text-xs text-gray-500">Escolha para ter um ícone personalizado</p>
                    </div>

                    {/* Dia do vencimento */}
                    <div className="grid gap-2">
                        <Label htmlFor="bill-due-day">Dia do Vencimento (1-31) *</Label>
                        <Input
                            type="number"
                            id="bill-due-day"
                            value={dueDay}
                            onChange={(e) => setDueDay(e.target.value)}
                            placeholder="Ex: 10"
                            min={1}
                            max={31}
                        />
                    </div>

                    {/* Data fim de contrato */}
                    <div className="grid gap-2">
                        <Label htmlFor="bill-contract-end">Data Fim de Contrato/Fidelidade</Label>
                        <Input
                            type="date"
                            id="bill-contract-end"
                            value={contractEndDate}
                            onChange={(e) => setContractEndDate(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">Receba alertas 30 dias antes do fim</p>
                    </div>

                    {/* Débito automático */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="bill-auto-debit"
                            checked={isAutoDebit}
                            onChange={(e) => setIsAutoDebit(e.target.checked)}
                        />
                        <Label htmlFor="bill-auto-debit">É Débito Automático com valor fixo?</Label>
                    </div>

                    {isAutoDebit && (
                        <div className="space-y-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                            <p className="text-xs text-blue-700 font-medium">
                                <i className="fas fa-info-circle mr-1"></i>
                                Ao preencher, um lançamento recorrente será criado automaticamente.
                            </p>

                            {/* Valor fixo */}
                            <div className="grid gap-2">
                                <Label htmlFor="bill-amount">Valor Fixo Mensal (R$) *</Label>
                                <Input
                                    type="number"
                                    id="bill-amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Ex: 59.90"
                                    step="0.01"
                                />
                            </div>

                            {/* Valor anterior para tendência */}
                            <div className="grid gap-2">
                                <Label htmlFor="bill-last-amount">Valor do Mês Anterior (opcional)</Label>
                                <Input
                                    type="number"
                                    id="bill-last-amount"
                                    value={lastAmount}
                                    onChange={(e) => setLastAmount(e.target.value)}
                                    placeholder="Ex: 54.90"
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500">Para análise de tendência de preço</p>
                            </div>

                            {/* Categoria e Subcategoria */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="bill-category">Categoria *</Label>
                                    <Select id="bill-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option value="" disabled>Selecione</option>
                                        {expenseCategoryList.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="bill-subcategory">Subcategoria *</Label>
                                    <Select
                                        id="bill-subcategory"
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
                        </div>
                    )}

                    {/* Dados de pagamento */}
                    <div className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Dados de Pagamento (Opcional)</h3>

                        <div className="grid gap-2">
                            <Label htmlFor="bill-payment-url">Site para Pagamento</Label>
                            <Input
                                type="url"
                                id="bill-payment-url"
                                value={paymentUrl}
                                onChange={(e) => setPaymentUrl(e.target.value)}
                                placeholder="https://exemplo.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="bill-payment-user">Usuário</Label>
                                <Input
                                    type="text"
                                    id="bill-payment-user"
                                    value={paymentUser}
                                    onChange={(e) => setPaymentUser(e.target.value)}
                                    placeholder="Seu login"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="bill-payment-pass">Senha</Label>
                                <Input
                                    type="text"
                                    id="bill-payment-pass"
                                    value={paymentPass}
                                    onChange={(e) => setPaymentPass(e.target.value)}
                                    placeholder="Sua senha"
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                    <Button type="submit" className="w-full">
                        <i className="fas fa-plus mr-2"></i>
                        Salvar Assinatura
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AddSubscriptionForm;

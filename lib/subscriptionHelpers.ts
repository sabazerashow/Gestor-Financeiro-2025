import { Bill, BillStatus } from '../types';

/**
 * Determina o status de uma conta baseado em dueDay e paidDate
 */
export function getSubscriptionStatus(bill: Bill, currentDate: Date = new Date()): BillStatus {
    // Se tem status definido e foi pago este mês, usar status
    if (bill.status === 'paid' && bill.paidDate) {
        const paidDate = new Date(bill.paidDate);
        const isSameMonth = paidDate.getMonth() === currentDate.getMonth() &&
            paidDate.getFullYear() === currentDate.getFullYear();
        if (isSameMonth) return 'paid';
    }

    const today = currentDate.getDate();
    const dueDay = bill.dueDay;

    // Se já passou do dia de vencimento e não foi pago
    if (today > dueDay) {
        return 'overdue';
    }

    // Se ainda não chegou o dia de vencimento
    return 'pending';
}

/**
 * Calcula a variação percentual entre valor atual e anterior
 */
export function calculateTrendPercentage(current?: number, previous?: number): number | null {
    if (!current || !previous || previous === 0) return null;

    const variation = ((current - previous) / previous) * 100;
    return Math.round(variation * 10) / 10; // Arredonda para 1 casa decimal
}

/**
 * Retorna quantos dias faltam até o fim do contrato
 */
export function getContractDaysRemaining(contractEndDate?: string): number | null {
    if (!contractEndDate) return null;

    const endDate = new Date(contractEndDate);
    const today = new Date();

    // Zera as horas para comparar apenas datas
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Calcula o percentual de comprometimento da renda com custos fixos
 */
export function getIncomeCommitmentPercentage(totalFixed: number, monthlyIncome: number): number {
    if (monthlyIncome <= 0) return 0;

    const percentage = (totalFixed / monthlyIncome) * 100;
    return Math.round(percentage * 10) / 10; // Arredonda para 1 casa decimal
}

/**
 * Retorna a próxima data de vencimento baseada no dueDay
 */
export function getNextDueDate(dueDay: number, referenceDate: Date = new Date()): Date {
    const nextDue = new Date(referenceDate);
    nextDue.setDate(dueDay);

    // Se o dia já passou neste mês, pegar o próximo mês
    if (nextDue < referenceDate) {
        nextDue.setMonth(nextDue.getMonth() + 1);
    }

    return nextDue;
}

/**
 * Retorna dias até o próximo vencimento
 */
export function getDaysUntilDue(dueDay: number, currentDate: Date = new Date()): number {
    const nextDue = getNextDueDate(dueDay, currentDate);
    const today = new Date(currentDate);

    today.setHours(0, 0, 0, 0);
    nextDue.setHours(0, 0, 0, 0);

    const diffTime = nextDue.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Filtra contas com alertas de contrato (vence em até X dias)
 */
export function getContractAlerts(bills: Bill[], daysThreshold: number = 30): Bill[] {
    return bills.filter(bill => {
        const daysRemaining = getContractDaysRemaining(bill.contractEndDate);
        return daysRemaining !== null && daysRemaining > 0 && daysRemaining <= daysThreshold;
    });
}

/**
 * Calcula o custo fixo total mensal
 */
export function getTotalFixedCost(bills: Bill[]): number {
    return bills
        .filter(bill => bill.amount && bill.amount > 0)
        .reduce((sum, bill) => sum + (bill.amount || 0), 0);
}

/**
 * Encontra a próxima conta de maior valor a vencer
 */
export function getNextHighestBill(bills: Bill[], currentDate: Date = new Date()): Bill | null {
    const pendingBills = bills.filter(bill => {
        const status = getSubscriptionStatus(bill, currentDate);
        return status === 'pending' && bill.amount && bill.amount > 0;
    });

    if (pendingBills.length === 0) return null;

    // Ordena por valor decrescente e retorna o primeiro
    return pendingBills.sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];
}

/**
 * Retorna mensagem motivacional baseada no percentual de comprometimento
 */
export function getCommitmentMessage(percentage: number): { text: string; emoji: string; color: string } {
    if (percentage < 30) {
        return {
            text: 'Excelente controle financeiro!',
            emoji: '🎉',
            color: 'text-green-600',
        };
    } else if (percentage < 50) {
        return {
            text: 'Ótimo! Seus custos fixos estão equilibrados.',
            emoji: '👍',
            color: 'text-blue-600',
        };
    } else if (percentage < 70) {
        return {
            text: 'Atenção! Alto comprometimento da renda.',
            emoji: '⚠️',
            color: 'text-yellow-600',
        };
    } else {
        return {
            text: 'Alerta! Custos fixos muito elevados.',
            emoji: '🚨',
            color: 'text-red-600',
        };
    }
}

/**
 * Gera dados de sparkline (últimos 3 meses de variação)
 * Para simplificar, vamos simular com base no lastAmount e amount
 */
export function generateSparklineData(current?: number, previous?: number): number[] {
    if (!current) return [];
    if (!previous) return [current];

    // Simula uma tendência de 3 pontos
    const diff = current - previous;
    const mid = previous + (diff / 2);

    return [previous, mid, current];
}

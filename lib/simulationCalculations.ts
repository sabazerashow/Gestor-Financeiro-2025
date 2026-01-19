/**
 * Financial Simulation Calculations
 * Pure functions for compound interest, FIRE, and reverse planning calculations
 */

export interface CompoundInterestDataPoint {
    month: number;
    invested: number;
    total: number;
    interest: number;
}

/**
 * Calculate compound interest growth over time
 * @param principal - Initial investment amount
 * @param monthlyContribution - Monthly contribution amount
 * @param annualRate - Annual interest rate (as percentage, e.g., 10 for 10%)
 * @param years - Investment period in years
 * @returns Array of data points for charting
 */
export function calculateCompoundInterest(
    principal: number,
    monthlyContribution: number,
    annualRate: number,
    years: number
): CompoundInterestDataPoint[] {
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;
    const data: CompoundInterestDataPoint[] = [];

    let balance = principal;
    let invested = principal;

    for (let i = 0; i <= months; i++) {
        const interest = balance - invested;

        data.push({
            month: i,
            invested: Math.round(invested * 100) / 100,
            total: Math.round(balance * 100) / 100,
            interest: Math.round(interest * 100) / 100
        });

        if (i < months) {
            balance = balance * (1 + monthlyRate) + monthlyContribution;
            invested += monthlyContribution;
        }
    }

    return data;
}

/**
 * Calculate final values for compound interest
 */
export function calculateCompoundInterestFinal(
    principal: number,
    monthlyContribution: number,
    annualRate: number,
    years: number
): {
    totalInvested: number;
    totalInterest: number;
    finalWealth: number;
} {
    const data = calculateCompoundInterest(principal, monthlyContribution, annualRate, years);
    const finalPoint = data[data.length - 1];

    return {
        totalInvested: finalPoint.invested,
        totalInterest: finalPoint.interest,
        finalWealth: finalPoint.total
    };
}

/**
 * Calculate required monthly contribution to reach a target amount
 * @param targetAmount - Desired final amount
 * @param years - Time period in years
 * @param annualRate - Expected annual return rate (as percentage)
 * @param principal - Initial investment (optional)
 * @returns Required monthly contribution
 */
export function calculateRequiredMonthlyContribution(
    targetAmount: number,
    years: number,
    annualRate: number,
    principal: number = 0
): number {
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;

    if (monthlyRate === 0) {
        // If no interest, simple division
        return (targetAmount - principal) / months;
    }

    // Future value of principal
    const futurePrincipal = principal * Math.pow(1 + monthlyRate, months);

    // Remaining amount needed from contributions
    const remainingAmount = targetAmount - futurePrincipal;

    // Calculate required monthly payment using future value of annuity formula
    // FV = PMT * [(1 + r)^n - 1] / r
    // PMT = FV * r / [(1 + r)^n - 1]
    const monthlyContribution = remainingAmount * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);

    return Math.round(monthlyContribution * 100) / 100;
}

/**
 * Calculate FIRE (Financial Independence, Retire Early) target
 * Uses the 4% rule: need 25x annual expenses
 * @param monthlyExpenses - Desired monthly living expenses
 * @returns Target wealth needed for FIRE
 */
export function calculateFIRETarget(monthlyExpenses: number): number {
    const annualExpenses = monthlyExpenses * 12;
    const fireTarget = annualExpenses * 25; // 4% rule
    return Math.round(fireTarget * 100) / 100;
}

/**
 * Calculate years to FIRE based on current situation
 * @param currentAssets - Current invested assets
 * @param targetAssets - FIRE target amount
 * @param monthlyContribution - Monthly investment amount
 * @param annualRate - Expected annual return rate
 * @returns Estimated years to FIRE
 */
export function calculateYearsToFIRE(
    currentAssets: number,
    targetAssets: number,
    monthlyContribution: number,
    annualRate: number
): number {
    if (currentAssets >= targetAssets) return 0;
    if (monthlyContribution <= 0) return Infinity;

    const monthlyRate = annualRate / 12 / 100;

    // Using future value formula, solve for n (number of months)
    // FV = PV * (1 + r)^n + PMT * [(1 + r)^n - 1] / r
    // This requires iterative solution

    let months = 0;
    let balance = currentAssets;
    const maxMonths = 100 * 12; // Cap at 100 years

    while (balance < targetAssets && months < maxMonths) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
        months++;
    }

    const years = months / 12;
    return Math.round(years * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate current progress towards FIRE
 * @param currentAssets - Current invested assets
 * @param targetAssets - FIRE target amount
 * @returns Progress percentage (0-100)
 */
export function calculateFIREProgress(
    currentAssets: number,
    targetAssets: number
): number {
    if (targetAssets <= 0) return 0;
    const progress = (currentAssets / targetAssets) * 100;
    return Math.min(Math.round(progress * 10) / 10, 100); // Cap at 100%
}

/**
 * Interest rate presets for different investment types
 */
export const INTEREST_RATE_PRESETS = {
    poupanca: { rate: 6, label: 'Poupança', color: '#94a3b8' },
    cdi: { rate: 10, label: 'CDI', color: '#3b82f6' },
    bolsa: { rate: 12, label: 'Bolsa', color: '#10b981' }
} as const;

export type InterestRatePreset = keyof typeof INTEREST_RATE_PRESETS;

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Format large numbers with K/M suffix
 */
export function formatLargeNumber(value: number): string {
    if (value >= 1000000) {
        return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
}

/**
 * Calculate months between two dates
 */
export function monthsBetweenDates(startDate: Date, endDate: Date): number {
    const years = endDate.getFullYear() - startDate.getFullYear();
    const months = endDate.getMonth() - startDate.getMonth();
    return years * 12 + months;
}

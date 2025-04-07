import { create } from "zustand"
import type { Company, Investment, Transaction } from "../types"

interface GameState {
  companies: Company[]
  transactions: Transaction[]
  updateValuations: () => void
  invest: (investorId: string, targetId: string, amount: number) => Promise<void>
  takeLoan: (companyId: string, amount: number) => void
}

const DICE_OUTCOMES = [
  { probability: 1 / 12, shares: 1, valuationDrop: 0, timeout: 0 }, // 100% shares
  { probability: 2 / 12, shares: 0.5, valuationDrop: 0, timeout: 0 }, // 50% shares
  { probability: 3 / 12, shares: 0.35, valuationDrop: 0, timeout: 0 }, // 35% shares
  { probability: 3 / 12, shares: 0, valuationDrop: 5000, timeout: 10 }, // -$5k, 10min
  { probability: 2 / 12, shares: 0, valuationDrop: 25000, timeout: 20 }, // -$25k, 20min
  { probability: 1 / 12, shares: 0, valuationDrop: 50000, timeout: 30 }, // -$50k, 30min
]

const rollDice = () => {
  const roll = Math.random()
  let cumulative = 0

  for (const outcome of DICE_OUTCOMES) {
    cumulative += outcome.probability
    if (roll <= cumulative) {
      return outcome
    }
  }

  return DICE_OUTCOMES[0] // Fallback to first outcome
}

const calculateNewValuation = (company: Company): number => {
  const baseValuation = company.value
  const investorCount = company.incomingInvestments.length
  const totalShares = company.incomingInvestments.reduce((sum, inv) => sum + inv.amount, 0)

  return baseValuation * (1 + investorCount * 0.3) * (1 + totalShares * 0.002)
}

const updateCompanyRanks = (companies: Company[]): Company[] => {
  const sortedCompanies = [...companies].sort((a, b) => b.value - a.value)
  return sortedCompanies.map((company, index) => ({
    ...company,
    rank: index + 1,
    valueChange:
      company.value > 0 ? ((company.value - company.value / (1 + Math.random() * 0.1)) / company.value) * 100 : 0,
  }))
}

export const useGameStore = create<GameState>((set, get) => ({
  companies: [],
  transactions: [],

  updateValuations: () => {
    set((state) => {
      const updatedCompanies = state.companies.map((company) => {
        const newValue = calculateNewValuation(company)
        return {
          ...company,
          value: newValue,
          sharePrice: newValue / 1000, // Assuming 1000 total shares
        }
      })

      return {
        companies: updateCompanyRanks(updatedCompanies),
      }
    })
  },

  invest: async (investorId: string, targetId: string, amount: number) => {
    const investor = get().companies.find((c) => c.id === investorId)
    const target = get().companies.find((c) => c.id === targetId)

    if (!investor || !target) return
    if (investor.availableFunds < amount) return
    if (investor.currentInvestment !== null) return
    if (investor.isDisqualified) return
    if (investor.cooldownUntil && investor.cooldownUntil > Date.now()) return

    const diceOutcome = rollDice()
    const sharesAcquired = amount * diceOutcome.shares
    const newInvestment: Investment = {
      id: crypto.randomUUID(),
      investorId,
      targetId,
      amount: sharesAcquired,
      timestamp: Date.now(),
      outcome: diceOutcome.shares > 0 ? (diceOutcome.shares === 1 ? "full" : "partial") : "negative",
      multiplier: diceOutcome.shares,
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: "investment",
      amount,
      timestamp: Date.now(),
      fromId: investorId,
      toId: targetId,
      outcome: newInvestment.outcome,
    }

    set((state) => {
      const updatedCompanies = state.companies.map((company) => {
        if (company.id === investorId) {
          return {
            ...company,
            availableFunds: company.availableFunds - amount,
            value: company.value - diceOutcome.valuationDrop,
            currentInvestment: diceOutcome.shares > 0 ? newInvestment : null,
            lastTradeTimestamp: Date.now(),
            cooldownUntil:
              diceOutcome.timeout > 0
                ? Date.now() + diceOutcome.timeout * 60 * 1000
                : // Convert minutes to milliseconds
                  undefined,
          }
        }
        if (company.id === targetId) {
          return {
            ...company,
            incomingInvestments: [...company.incomingInvestments, newInvestment],
          }
        }
        return company
      })

      return {
        companies: updateCompanyRanks(updatedCompanies),
        transactions: [newTransaction, ...state.transactions],
      }
    })
  },

  takeLoan: (companyId: string, amount: number) => {
    const company = get().companies.find((c) => c.id === companyId)
    if (!company || company.loanTaken || company.isDisqualified) return

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: "loan",
      amount,
      timestamp: Date.now(),
      toId: companyId,
    }

    set((state) => {
      const updatedCompanies = state.companies.map((company) =>
        company.id === companyId
          ? {
              ...company,
              availableFunds: company.availableFunds + amount,
              loanTaken: true,
            }
          : company,
      )

      return {
        companies: updateCompanyRanks(updatedCompanies),
        transactions: [newTransaction, ...state.transactions],
      }
    })
  },
}))


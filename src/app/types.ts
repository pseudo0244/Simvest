export interface Company {
  id: string
  name: string
  value: number
  sharePrice: number
  availableFunds: number
  currentInvestment: Investment | null
  incomingInvestments: Investment[]
  loanTaken: boolean
  isDisqualified: boolean
  lastTradeTimestamp: number
  cooldownUntil?: number
  rank?: number
  valueChange?: number
  profitLoss?: number
}

export interface Investment {
  id: string
  investorId: string
  targetId: string
  amount: number
  timestamp: number
  outcome: "full" | "partial" | "negative"
  multiplier: number
}

export interface Transaction {
  id: string
  type: "investment" | "loan" | "return"
  amount: number
  timestamp: Date | number
  fromId?: string
  toId?: string
  outcome?: "full" | "partial" | "negative"
}


"use client"

import { useState } from "react"
import { Dialog } from "@headlessui/react"
import type { Company } from "../types"

interface InvestmentModalProps {
  company: Company
  investorId: string
  action: "buy" | "sell"
  onClose: () => void
}

export function InvestmentModal({ company, investorId, action, onClose }: InvestmentModalProps) {
  const [amount, setAmount] = useState("")

  const sharePrice = company.sharePrice
  const availableShares = Math.floor(company.value / sharePrice)
  const yourShares = company.investors?.find((inv) => inv.investorId === investorId)?.shares || 0

  const handleConfirm = async () => {
    try {
      const response = await fetch('/api/invest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerId: investorId,
          sellerId: company.id,
          amount: parseFloat(amount) * sharePrice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Investment failed');
      }

      onClose();
    } catch (error) {
      console.error('Investment error:', error);
      // Handle error (show toast, etc.)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 text-black">
        <Dialog.Title className="text-xl font-semibold text-black">
          {action === "buy" ? "Buy Shares" : "Sell Shares"} – {company.name}
        </Dialog.Title>

        <div className="space-y-2 text-sm text-black">
          <div>
            <strong>Share Price:</strong> ${sharePrice.toLocaleString()}
          </div>

          {action === "buy" ? (
            <div>
              <strong>Available Shares:</strong> {availableShares.toLocaleString()}
            </div>
          ) : (
            <div>
              <strong>Your Shares:</strong> {yourShares.toLocaleString()}
            </div>
          )}
        </div>

        <div className="mt-4">
          <label htmlFor="amount" className="block text-sm font-medium text-black mb-1">
            {action === "buy" ? "Number of Shares to Buy" : "Number of Shares to Sell"}
          </label>
          <input
            id="amount"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-black hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Company } from '../types';
import { useGameStore } from '../store/gameStore';

interface InvestmentModalProps {
  company: Company;
  onClose: () => void;
  investorId: string;
}

export function InvestmentModal({ company, onClose, investorId }: InvestmentModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const invest = useGameStore((state) => state.invest);
  const investor = useGameStore((state) => 
    state.companies.find((c) => c.id === investorId)
  );

  const handleInvest = async () => {
    if (!investor || amount <= 0 || amount > investor.availableFunds) return;
    await invest(investorId, company.id, amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Invest in {company.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount..."
              min="0"
              max={investor?.availableFunds}
            />
          </div>

          <div className="text-sm text-gray-500">
            <p>Current Share Price: ${company.sharePrice.toLocaleString()}</p>
            <p>Your Available Funds: ${investor?.availableFunds.toLocaleString()}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Investment outcomes are determined by dice roll. You may receive:
              <br />• 100% of shares (1/12 chance)
              <br />• 50% of shares (2/12 chance)
              <br />• 35% of shares (3/12 chance)
              <br />• Value drop + timeout (6/12 chance)
            </p>
          </div>

          <button
            onClick={handleInvest}
            disabled={!amount || amount > (investor?.availableFunds || 0)}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Confirm Investment
          </button>
        </div>
      </div>
    </div>
  );
}
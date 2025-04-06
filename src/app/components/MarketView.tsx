import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import { Company } from '../types';
import { InvestmentModal } from './InvestmentModal';
import { useGameStore } from '../store/gameStore';

interface MarketViewProps {
  companies: Company[];
  currentCompanyId: string;
}

export function MarketView({ companies, currentCompanyId }: MarketViewProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Market Overview</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Updates every 10-20 minutes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {companies.map((company) => (
          <div
            key={company.id}
            className={`relative rounded-lg p-4 ${
              company.isDisqualified
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            {company.isDisqualified && (
              <div className="absolute top-2 right-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            )}
            
            <h3 className="font-semibold text-lg mb-2">{company.name}</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Share Price</span>
                <div className="flex items-center gap-1">
                  {company.sharePrice > (company.value / 1100) ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-medium">
                    ${company.sharePrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Value</span>
                <span className="font-medium">
                  ${company.value.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Investors</span>
                <span className="font-medium">
                  {company.incomingInvestments.length}
                </span>
              </div>

              {company.loanTaken && (
                <div className="text-amber-600 text-sm mt-2">
                  Loan active at 15% interest
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedCompany(company)}
              disabled={
                company.isDisqualified ||
                company.id === currentCompanyId ||
                Boolean(companies.find((c) => c.id === currentCompanyId)?.currentInvestment)
              }
              className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                company.isDisqualified || company.id === currentCompanyId
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Invest
            </button>
          </div>
        ))}
      </div>

      {selectedCompany && (
        <InvestmentModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          investorId={currentCompanyId}
        />
      )}
    </div>
  );
}
import React from 'react';
import { BarChart3, TrendingUp, Users, History, Wallet, Trophy, Clock, TrendingDown } from 'lucide-react';
import { Company, Transaction } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import CountUp from 'react-countup';

interface DashboardProps {
  company: Company;
  transactions: Transaction[];
}

export function Dashboard({ company, transactions }: DashboardProps) {
  if (!company) return null;

  const nextInvestmentTime = company.cooldownUntil 
    ? new Date(company.cooldownUntil) 
    : null;

  const canInvest = !nextInvestmentTime || nextInvestmentTime.getTime() < Date.now();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Company Value Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Company Value</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  <CountUp
                    end={company.value}
                    prefix="$"
                    separator=","
                    decimal="."
                    decimals={0}
                    duration={2}
                  />
                </p>
                {company.valueChange && (
                  <span className={`flex items-center text-sm ${
                    company.valueChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {company.valueChange >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(company.valueChange).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <BarChart3 className="text-emerald-500 w-8 h-8" />
          </div>
        </div>

        {/* Share Price Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Share Price</p>
              <p className="text-2xl font-bold">
                <CountUp
                  end={company.sharePrice}
                  prefix="$"
                  separator=","
                  decimal="."
                  decimals={2}
                  duration={2}
                />
              </p>
            </div>
            <TrendingUp className="text-blue-500 w-8 h-8" />
          </div>
        </div>

        {/* Available Funds Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available Funds</p>
              <p className="text-2xl font-bold">
                <CountUp
                  end={company.availableFunds}
                  prefix="$"
                  separator=","
                  decimal="."
                  decimals={0}
                  duration={2}
                />
              </p>
            </div>
            <Wallet className="text-purple-500 w-8 h-8" />
          </div>
        </div>

        {/* Rank Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Market Rank</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">#{company.rank || '-'}</p>
                <span className="text-sm text-gray-500">of 40</span>
              </div>
            </div>
            <Trophy className="text-amber-500 w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Investment Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Investment Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-500 mb-2">Next Investment Available</h3>
            {!canInvest && nextInvestmentTime ? (
              <div className="text-lg font-medium text-red-600">
                In {formatDistanceToNow(nextInvestmentTime)}
              </div>
            ) : (
              <div className="text-lg font-medium text-green-600">
                Ready to invest!
              </div>
            )}
          </div>
          <div>
            <h3 className="text-gray-500 mb-2">Current Investment</h3>
            {company.currentInvestment ? (
              <div className="space-y-1">
                <p className="font-medium">
                  ${company.currentInvestment.amount.toLocaleString()} in Company #{company.currentInvestment.targetId}
                </p>
                <p className="text-sm text-gray-500">
                  Made {formatDistanceToNow(company.currentInvestment.timestamp)} ago
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No active investments</p>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="text-gray-700 w-6 h-6" />
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-3 px-2">Type</th>
                <th className="pb-3 px-2">Amount</th>
                <th className="pb-3 px-2">From/To</th>
                <th className="pb-3 px-2">Outcome</th>
                <th className="pb-3 px-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      tx.type === 'investment' ? 'bg-blue-100 text-blue-800' :
                      tx.type === 'loan' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-2">${tx.amount.toLocaleString()}</td>
                  <td className="py-3 px-2">{tx.fromId || tx.toId}</td>
                  <td className="py-3 px-2">
                    {tx.outcome && (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        tx.outcome === 'full' ? 'bg-green-100 text-green-800' :
                        tx.outcome === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.outcome}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {format(tx.timestamp, 'HH:mm:ss')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
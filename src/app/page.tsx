"use client"

import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { MarketView } from './components/MarketView';
import { useGameStore } from './store/gameStore';
import { useRouter } from 'next/navigation';

// Initialize with mock data
const initializeGame = () => {
  const companies = Array.from({ length: 40 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Company ${i + 1}`,
    value: Math.random() * 1000000 + 500000,
    sharePrice: Math.random() * 500 + 100,
    availableFunds: Math.random() * 500000 + 100000,
    currentInvestment: null,
    incomingInvestments: [],
    loanTaken: false,
    isDisqualified: false,
    lastTradeTimestamp: Date.now(),
  }));

  return companies;
};

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'market'>('dashboard');
  const { companies, transactions, updateValuations } = useGameStore();
  const router = useRouter();

  // Initialize game state
  useEffect(() => {
    if (companies.length === 0) {
      useGameStore.setState({ companies: initializeGame() });
    }
  }, [companies.length]);

  // Update valuations every 10-20 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      updateValuations();
    }, Math.random() * 600000 + 600000); // Random interval between 10-20 minutes

    return () => clearInterval(interval);
  }, [updateValuations]);

  const currentCompany = companies[0]; // For demo, using first company as current user

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-black">TradeTurf</h1>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('market')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'market'
                    ? 'bg-blue-600 text-white'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => router.push('/leaderboard')}
                className="px-4 py-2 rounded-lg font-medium text-black hover:bg-gray-100 transition-colors"
              >
                Leaderboard
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 rounded-lg font-medium text-black hover:bg-gray-100 transition-colors"
              >
                LoginPage
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && currentCompany ? (
          <Dashboard company={currentCompany} transactions={transactions} />
        ) : (
          <MarketView 
            companies={companies} 
            currentCompanyId={currentCompany?.id || ''}
          />
        )}
      </main>
    </div>
  );
}

export default App;

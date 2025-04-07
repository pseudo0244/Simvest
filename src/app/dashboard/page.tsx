"use client"

import { useState, useEffect } from "react"
import { Activity, LogOut } from "lucide-react"
import { Dashboard } from "../components/Dashboard"
import { MarketView } from "../components/MarketView"
import { useGameStore } from "../store/gameStore"
import { useRouter } from "next/navigation"

// Initialize with mock data
const generateMockCompanies = () => {
  return Array.from({ length: 40 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Company ${i + 1}`,
    value: 0,
    sharePrice: 0,
    availableFunds: 0,
    currentInvestment: null,
    incomingInvestments: [],
    loanTaken: false,
    isDisqualified: false,
    lastTradeTimestamp: Date.now(),
  }))
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "market">("dashboard")
  const [currentTeam, setCurrentTeam] = useState<string>("")
  const { companies, transactions, updateValuations } = useGameStore()
  const router = useRouter()

  // On mount: check user auth and saved tab
  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userStr)
      setCurrentTeam(user.team)

      // Restore activeTab from localStorage if exists
      const savedTab = localStorage.getItem("activeTab")
      if (savedTab === "market" || savedTab === "dashboard") {
        setActiveTab(savedTab)
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    }
  }, [router])

  // Save tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab)
  }, [activeTab])

  // Initialize game state if empty
  useEffect(() => {
    if (companies.length === 0) {
      useGameStore.setState({ companies: generateMockCompanies() })
    }
  }, [companies.length])

  // Update valuations randomly every 10-20 mins
  useEffect(() => {
    const interval = setInterval(updateValuations, Math.random() * 600000 + 600000)
    return () => clearInterval(interval)
  }, [updateValuations])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const getTeamCompany = () => {
    if (!currentTeam) return null
    const teamNumber = Number.parseInt(currentTeam.replace(/\D/g, ""))
    const companyIndex = (teamNumber - 1) % companies.length
    return companies[companyIndex] || companies[0]
  }

  const currentCompany = getTeamCompany()

  if (!currentTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-black">TradeTurf</h1>
                <p className="text-sm text-gray-600">Terminal: {currentTeam}</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-black hover:bg-gray-100"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("market")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "market" ? "bg-blue-600 text-white" : "text-black hover:bg-gray-100"
                }`}
              >
                Market
              </button>
              <button
                onClick={() => router.push("/leaderboard")}
                className="px-4 py-2 rounded-lg font-medium text-black hover:bg-gray-100 transition-colors"
              >
                Leaderboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && currentCompany ? (
          <Dashboard company={currentCompany} transactions={transactions} />
        ) : (
          <MarketView companies={companies} currentCompanyId={currentCompany?.id || ""} currentTeam={currentTeam} />
        )}
      </main>
    </div>
  )
}

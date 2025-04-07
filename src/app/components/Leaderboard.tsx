'use client'

import { useEffect, useState } from 'react'

type Company = {
  id: string
  name: string
  value: number
}

export function Leaderboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const res = await fetch('/api/leaderboard')
      const data = await res.json()
      setCompanies(data)
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  return (
    <div className="mt-8 p-4 bg-gray-900 rounded-lg shadow text-white w-full max-w-xl">
      <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
        🏆 Leaderboard
      </h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {companies.map((company, index) => (
            <li
              key={company.id}
              className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded"
            >
              <span>#{index + 1} {company.name}</span>
              <span>₹{company.value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

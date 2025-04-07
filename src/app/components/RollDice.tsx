'use client'

import { useState } from 'react'
import { Dice6 } from 'lucide-react'

export function RollDice() {
  const [dice, setDice] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)

  const handleRoll = () => {
    setRolling(true)
    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1
      setDice(rolled)
      setRolling(false)
    }, 600)
  }

  return (
    <div className="mt-6 text-center">
      <button
        onClick={handleRoll}
        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition"
        disabled={rolling}
      >
        {rolling ? 'Rolling...' : '🎲 Roll Dice'}
      </button>
      {dice && !rolling && (
        <div className="mt-4 text-2xl font-bold text-gray-800">You rolled a {dice}!</div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function FlashcardsPage() {
  const [words, setWords] = useState([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWords() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setWords(data)
      setLoading(false)
    }
    fetchWords()
  }, [])

  function handleFlip() {
    setFlipped(!flipped)
  }

  function handleNext() {
    setFlipped(false)
    setTimeout(() => setCurrent(c => Math.min(c + 1, words.length - 1)), 150)
  }

  function handlePrev() {
    setFlipped(false)
    setTimeout(() => setCurrent(c => Math.max(c - 1, 0)), 150)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading flashcards...</p>
    </div>
  )

  if (words.length === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">No words yet!</p>
        <Link href="/" className="text-blue-600 hover:underline">Add some words first</Link>
      </div>
    </div>
  )

  const word = words[current]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 text-sm hover:underline">← Back</Link>
          <h1 className="text-xl font-bold text-gray-800">Flashcards</h1>
          <p className="text-sm text-gray-400">{current + 1} / {words.length}</p>
        </div>

        <div
          onClick={handleFlip}
          className="cursor-pointer"
          style={{ perspective: '1000px' }}
        >
          <div
            style={{
              transition: 'transform 0.5s',
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              position: 'relative',
              height: '280px'
            }}
          >
            {/* Front */}
            <div
              style={{ backfaceVisibility: 'hidden' }}
              className="absolute inset-0 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center p-8"
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Word</p>
              <p className="text-4xl font-bold text-gray-800 capitalize">{word.word}</p>
              <p className="text-sm text-gray-400 mt-6">Click to reveal definition</p>
            </div>

            {/* Back */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
              className="absolute inset-0 bg-blue-600 rounded-2xl shadow-md flex flex-col items-center justify-center p-8"
            >
              <p className="text-xs text-white/70 uppercase tracking-wide mb-4">Definition</p>
              <p className="text-xl text-white text-center leading-relaxed">{word.definition}</p>
              {word.example_sentence && (
                <p className="text-sm text-white/70 text-center mt-4 italic">"{word.example_sentence}"</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="px-6 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-30"
          >
            ← Prev
          </button>
          <button
            onClick={handleFlip}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {flipped ? 'Hide' : 'Reveal'}
          </button>
          <button
            onClick={handleNext}
            disabled={current === words.length - 1}
            className="px-6 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-30"
          >
            Next →
          </button>
        </div>

      </div>
    </div>
  )
}
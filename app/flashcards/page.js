'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function FlashcardsPage() {
  const [words, setWords] = useState([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState({ knew: 0, didnt: 0 })
  const [userId, setUserId] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWords() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user.id)
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

  async function handleResult(knewIt) {
    const word = words[current]

    await supabase.from('reviews').insert({
      word_id: word.id,
      user_id: userId,
      knew_it: knewIt
    })

    setScore(s => ({
      knew: knewIt ? s.knew + 1 : s.knew,
      didnt: !knewIt ? s.didnt + 1 : s.didnt
    }))

    if (current + 1 >= words.length) {
      setDone(true)
    } else {
      setFlipped(false)
      setTimeout(() => setCurrent(c => c + 1), 150)
    }
  }

  function handleRestart() {
    setCurrent(0)
    setFlipped(false)
    setDone(false)
    setScore({ knew: 0, didnt: 0 })
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

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-10 text-center max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Session Complete!</h2>
        <p className="text-gray-400 mb-8">You reviewed {words.length} words</p>

        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-green-50 rounded-xl p-5 w-28">
            <p className="text-3xl font-bold text-green-600">{score.knew}</p>
            <p className="text-sm text-green-500 mt-1">Knew it</p>
          </div>
          <div className="bg-red-50 rounded-xl p-5 w-28">
            <p className="text-3xl font-bold text-red-500">{score.didnt}</p>
            <p className="text-sm text-red-400 mt-1">Didn't know</p>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition mb-3"
        >
          Study Again
        </button>
        <Link href="/" className="text-sm text-gray-400 hover:underline">Back to words</Link>
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
            <div
              style={{ backfaceVisibility: 'hidden' }}
              className="absolute inset-0 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center p-8"
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Word</p>
              <p className="text-4xl font-bold text-gray-800 capitalize">{word.word}</p>
              <p className="text-sm text-gray-400 mt-6">Click to reveal definition</p>
            </div>

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

        {!flipped ? (
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">Flip the card first to reveal the definition</p>
          </div>
        ) : (
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => handleResult(false)}
              className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-500 font-medium hover:bg-red-50 transition"
            >
              ✗ Didn't Know
            </button>
            <button
              onClick={() => handleResult(true)}
              className="flex-1 py-3 rounded-xl border-2 border-green-200 text-green-600 font-medium hover:bg-green-50 transition"
            >
              ✓ Knew It
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
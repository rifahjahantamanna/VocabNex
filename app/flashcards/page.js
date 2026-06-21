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
      if (data) setWords(data.filter(w => w.definition && w.definition !== 'null'))
      setLoading(false)
    }
    fetchWords()
  }, [])

  function handleFlip() { setFlipped(!flipped) }

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f13' }}>
      <p style={{ color: '#6b6b80' }}>Loading flashcards...</p>
    </div>
  )

  if (words.length === 0) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f13' }}>
      <div className="text-center">
        <p className="text-5xl mb-4">📭</p>
        <p className="mb-4" style={{ color: '#6b6b80' }}>No words yet!</p>
        <Link href="/" className="text-indigo-400 hover:text-indigo-300">Add some words first</Link>
      </div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f13' }}>
      <div className="rounded-2xl p-10 text-center max-w-md w-full" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
        <p className="mb-8" style={{ color: '#6b6b80' }}>You reviewed {words.length} words</p>

        <div className="flex justify-center gap-4 mb-8">
          <div className="rounded-xl p-5 w-28" style={{ background: '#0f2a1a' }}>
            <p className="text-3xl font-bold text-green-400">{score.knew}</p>
            <p className="text-sm mt-1 text-green-600">Knew it</p>
          </div>
          <div className="rounded-xl p-5 w-28" style={{ background: '#2a0f0f' }}>
            <p className="text-3xl font-bold text-red-400">{score.didnt}</p>
            <p className="text-sm mt-1 text-red-600">Didn't know</p>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3 rounded-xl font-semibold text-white mb-3 hover:opacity-90 transition"
          style={{ background: '#4f46e5' }}
        >
          Study Again
        </button>
        <Link href="/" className="text-sm hover:text-white transition" style={{ color: '#6b6b80' }}>Back to words</Link>
      </div>
    </div>
  )

  const word = words[current]

  return (
    <div className="min-h-screen" style={{ background: '#0f0f13' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="text-sm hover:text-white transition" style={{ color: '#6b6b80' }}>← Back</Link>
          <h1 className="text-xl font-bold text-white">Flashcards</h1>
          <p className="text-sm" style={{ color: '#6b6b80' }}>{current + 1} / {words.length}</p>
        </div>

        <div onClick={handleFlip} className="cursor-pointer" style={{ perspective: '1000px' }}>
          <div style={{
            transition: 'transform 0.5s',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            position: 'relative',
            height: '300px'
          }}>
            <div
              style={{ backfaceVisibility: 'hidden', background: '#1a1a24', border: '1px solid #2a2a38' }}
              className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8"
            >
              <p className="text-xs uppercase tracking-widest mb-6" style={{ color: '#6b6b80' }}>Word</p>
              <p className="text-5xl font-bold text-white capitalize">{word.word}</p>
              <p className="text-sm mt-8" style={{ color: '#6b6b80' }}>Click to reveal definition</p>
            </div>

            <div
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: '#2d2a5e',
                border: '1px solid #4f46e5'
              }}
              className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8"
            >
              <p className="text-xs uppercase tracking-widest mb-6" style={{ color: '#818cf8' }}>Definition</p>
              <p className="text-xl text-white text-center leading-relaxed">{word.definition}</p>
              {word.example_sentence && (
                <p className="text-sm text-center mt-4 italic" style={{ color: '#818cf8' }}>"{word.example_sentence}"</p>
              )}
            </div>
          </div>
        </div>

        {!flipped ? (
          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: '#6b6b80' }}>Flip the card to reveal the definition</p>
          </div>
        ) : (
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => handleResult(false)}
              className="flex-1 py-3 rounded-xl font-semibold transition hover:opacity-90"
              style={{ background: '#2a0f0f', color: '#f87171', border: '1px solid #7f1d1d' }}
            >
              ✗ Didn't Know
            </button>
            <button
              onClick={() => handleResult(true)}
              className="flex-1 py-3 rounded-xl font-semibold transition hover:opacity-90"
              style={{ background: '#0f2a1a', color: '#4ade80', border: '1px solid #14532d' }}
            >
              ✓ Knew It
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
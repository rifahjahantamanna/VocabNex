'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function WordDetail({ params }) {
  const { id } = use(params)
  const [word, setWord] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWord() {
      const { data } = await supabase
        .from('words')
        .select('*')
        .eq('id', id)
        .single()
      if (data) setWord(data)
      setLoading(false)
    }
    fetchWord()
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f13' }}>
      <p style={{ color: '#6b6b80' }}>Loading...</p>
    </div>
  )

  if (!word) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f13' }}>
      <p style={{ color: '#6b6b80' }}>Word not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#0f0f13' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        <Link href="/" className="text-sm hover:text-white transition mb-8 inline-block" style={{ color: '#6b6b80' }}>
          ← Back to words
        </Link>

        <div className="rounded-2xl p-8 mb-4" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
          <h1 className="text-5xl font-bold text-white capitalize mb-2">{word.word}</h1>
          <p className="text-xs mb-8" style={{ color: '#6b6b80' }}>
            Added on {new Date(word.created_at).toLocaleDateString()}
          </p>

          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#6b6b80' }}>Definition</p>
            <p className="text-lg leading-relaxed" style={{ color: '#c0c0d8' }}>{word.definition}</p>
          </div>

          {word.example_sentence && (
            <div className="mb-8 rounded-xl p-5" style={{ background: '#0f0f13', border: '1px solid #2a2a38' }}>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#6b6b80' }}>Example</p>
              <p className="italic text-lg" style={{ color: '#818cf8' }}>"{word.example_sentence}"</p>
            </div>
          )}

          {word.synonyms && word.synonyms.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#6b6b80' }}>Synonyms</p>
              <div className="flex gap-2 flex-wrap">
                {word.synonyms.map(s => (
                  <span key={s} className="px-4 py-2 rounded-full text-sm font-medium" style={{ background: '#2a2a3f', color: '#818cf8' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/flashcards" className="py-3 rounded-xl font-semibold text-white hover:opacity-90 transition text-center text-sm" style={{ background: '#4f46e5' }}>
            Study Flashcards
          </Link>
          <Link href="/quiz" className="py-3 rounded-xl font-semibold text-white hover:opacity-90 transition text-center text-sm" style={{ background: '#7c3aed' }}>
            Take Quiz
          </Link>
        </div>

      </div>
    </div>
  )
}
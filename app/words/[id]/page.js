'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  if (!word) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Word not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <Link href="/" className="text-blue-600 text-sm hover:underline mb-6 inline-block">
          ← Back to words
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-800 capitalize mb-2">{word.word}</h1>
          <p className="text-xs text-gray-400 mb-6">
            Added on {new Date(word.created_at).toLocaleDateString()}
          </p>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Definition</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{word.definition}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Example</h2>
            <p className="text-gray-600 italic text-lg">"{word.example_sentence}"</p>
          </div>

          {word.synonyms && word.synonyms.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Synonyms</h2>
              <div className="flex gap-2 flex-wrap">
                {word.synonyms.map(s => (
                  <span key={s} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
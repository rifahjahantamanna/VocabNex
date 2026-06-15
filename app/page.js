'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const [words, setWords] = useState([])
  const [newWord, setNewWord] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setUser(data.user)
    })
    fetchWords()
  }, [])

  async function fetchWords() {
    const { data } = await supabase
      .from('words')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setWords(data)
  }

  
  async function addWord() {
  if (!newWord.trim()) return
  setLoading(true)

  try {
    const enrichRes = await fetch('/api/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: newWord.trim() })
    })
    const enriched = await enrichRes.json()

    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('words').insert({
      word: newWord.trim(),
      definition: enriched.definition,
      example_sentence: enriched.example_sentence,
      synonyms: enriched.synonyms,
      user_id: user.id
    })

    setNewWord('')
    await fetchWords()
  } catch (err) {
    console.error(err)
  }

  setLoading(false)
}

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">VocabNex</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Add a new word</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter a word..."
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addWord()}
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addWord}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {words.length === 0 && (
            <p className="text-center text-gray-400 py-8">No words yet. Add your first word!</p>
          )}
          {words.map(w => (
  <Link href={`/words/${w.id}`} key={w.id}>
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition cursor-pointer">
      <p className="text-xl font-semibold text-gray-800 capitalize">{w.word}</p>
      {w.definition && (
        <p className="text-gray-600 mt-2 text-sm line-clamp-2">{w.definition}</p>
      )}
      {w.synonyms && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {w.synonyms.map(s => (
            <span key={s} className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">
              {s}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3">
        {new Date(w.created_at).toLocaleDateString()}
      </p>
    </div>
  </Link>

))}
          
        </div>

      </div>
    </div>
  )
}
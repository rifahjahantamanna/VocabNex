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
    <div className="min-h-screen" style={{ background: '#0f0f13' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">VocabNex</h1>
            <p className="text-sm mt-1" style={{ color: '#6b6b80' }}>Your personal vocabulary builder</p>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/dashboard" className="text-sm hover:text-white transition" style={{ color: '#6b6b80' }}>Dashboard</Link>
            <Link href="/flashcards" className="text-sm hover:text-white transition" style={{ color: '#6b6b80' }}>Flashcards</Link>
            <Link href="/quiz" className="text-sm hover:text-white transition" style={{ color: '#6b6b80' }}>Quiz</Link>
            <button onClick={handleLogout} className="text-sm hover:text-white transition" style={{ color: '#6b6b80' }}>Logout</button>
          </div>
        </div>

        <div className="rounded-2xl p-6 mb-8" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-widest" style={{ color: '#6b6b80' }}>Add a new word</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter a word..."
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addWord()}
              className="flex-1 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: '#0f0f13', border: '1px solid #2a2a38' }}
            />
            <button
              onClick={addWord}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-semibold text-white transition disabled:opacity-40"
              style={{ background: loading ? '#3730a3' : '#4f46e5' }}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {words.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">📖</p>
              <p style={{ color: '#6b6b80' }}>No words yet. Add your first word above!</p>
            </div>
          )}
          {words.map(w => (
            <Link href={`/words/${w.id}`} key={w.id}>
              <div
                className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01]"
                style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}
              >
                <div className="flex justify-between items-start">
                  <p className="text-xl font-bold text-white capitalize">{w.word}</p>
                  <p className="text-xs" style={{ color: '#6b6b80' }}>{new Date(w.created_at).toLocaleDateString()}</p>
                </div>
                {w.definition ? (
               <p className="mt-2 text-sm line-clamp-2" style={{ color: '#9090a8' }}>{w.definition}</p>
                 ) : (
               <span className="mt-2 inline-block text-xs px-2 py-1 rounded-full" style={{ background: '#2a1a0f', color: '#f97316' }}>
                No definition — click to regenerate
                </span>
)}
                
                {w.synonyms && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {w.synonyms.map(s => (
                      <span key={s} className="text-xs px-3 py-1 rounded-full" style={{ background: '#2a2a3f', color: '#818cf8' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
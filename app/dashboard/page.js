'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [recentWords, setRecentWords] = useState([])
  const [quizHistory, setQuizHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: words } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)

      const { data: scores } = await supabase
        .from('quiz_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const totalWords = words?.length || 0
      const totalReviews = reviews?.length || 0
      const knewIt = reviews?.filter(r => r.knew_it).length || 0
      const avgScore = scores?.length
        ? Math.round(scores.reduce((a, b) => a + (b.score / b.total) * 100, 0) / scores.length)
        : 0

      setStats({ totalWords, totalReviews, knewIt, avgScore })
      setRecentWords(words?.slice(0, 5) || [])
      setQuizHistory(scores?.slice(0, 5) || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f13' }}>
      <p style={{ color: '#6b6b80' }}>Loading dashboard...</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#0f0f13' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: '#6b6b80' }}>Your learning progress</p>
          </div>
          <Link href="/" className="text-sm hover:text-white transition" style={{ color: '#6b6b80' }}>← Back</Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl p-6" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
            <p className="text-3xl font-bold text-indigo-400">{stats.totalWords}</p>
            <p className="text-sm mt-1" style={{ color: '#6b6b80' }}>Words learned</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
            <p className="text-3xl font-bold text-green-400">{stats.totalReviews}</p>
            <p className="text-sm mt-1" style={{ color: '#6b6b80' }}>Cards reviewed</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
            <p className="text-3xl font-bold text-purple-400">
              {stats.totalReviews > 0
                ? Math.round((stats.knewIt / stats.totalReviews) * 100)
                : 0}%
            </p>
            <p className="text-sm mt-1" style={{ color: '#6b6b80' }}>Flashcard accuracy</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
            <p className="text-3xl font-bold text-amber-400">{stats.avgScore}%</p>
            <p className="text-sm mt-1" style={{ color: '#6b6b80' }}>Avg quiz score</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 mb-6" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#6b6b80' }}>Recent words</h2>
          {recentWords.length === 0 ? (
            <p className="text-sm" style={{ color: '#6b6b80' }}>No words yet</p>
          ) : (
            <div className="space-y-1">
              {recentWords.map(w => (
                <Link href={`/words/${w.id}`} key={w.id}>
                  <div className="flex justify-between items-center py-3 px-2 rounded-xl hover:bg-white/5 transition">
                    <p className="font-medium text-white capitalize">{w.word}</p>
                    <p className="text-xs" style={{ color: '#6b6b80' }}>{new Date(w.created_at).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-6 mb-8" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#6b6b80' }}>Quiz history</h2>
          {quizHistory.length === 0 ? (
            <p className="text-sm" style={{ color: '#6b6b80' }}>No quizzes taken yet</p>
          ) : (
            <div className="space-y-1">
              {quizHistory.map(q => (
                <div key={q.id} className="flex justify-between items-center py-3 px-2 rounded-xl">
                  <p className="font-medium text-white">{q.score}/{q.total} correct</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium" style={{
                      color: Math.round((q.score / q.total) * 100) >= 70 ? '#4ade80' : '#f87171'
                    }}>
                      {Math.round((q.score / q.total) * 100)}%
                    </span>
                    <p className="text-xs" style={{ color: '#6b6b80' }}>{new Date(q.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Link href="/flashcards" className="py-3 rounded-xl font-semibold text-white hover:opacity-90 transition text-center text-sm" style={{ background: '#4f46e5' }}>
            Flashcards
          </Link>
          <Link href="/quiz" className="py-3 rounded-xl font-semibold text-white hover:opacity-90 transition text-center text-sm" style={{ background: '#7c3aed' }}>
            Take Quiz
          </Link>
          <Link href="/" className="py-3 rounded-xl font-semibold text-white hover:opacity-90 transition text-center text-sm" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
            Add Words
          </Link>
        </div>

      </div>
    </div>
  )
}
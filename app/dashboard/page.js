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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading dashboard...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">← Back</Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-3xl font-bold text-blue-600">{stats.totalWords}</p>
            <p className="text-sm text-gray-500 mt-1">Words learned</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-3xl font-bold text-green-600">{stats.totalReviews}</p>
            <p className="text-sm text-gray-500 mt-1">Cards reviewed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-3xl font-bold text-purple-600">
              {stats.totalReviews > 0
                ? Math.round((stats.knewIt / stats.totalReviews) * 100)
                : 0}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Flashcard accuracy</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-3xl font-bold text-amber-500">{stats.avgScore}%</p>
            <p className="text-sm text-gray-500 mt-1">Avg quiz score</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent words</h2>
          {recentWords.length === 0 ? (
            <p className="text-gray-400 text-sm">No words yet</p>
          ) : (
            <div className="space-y-2">
              {recentWords.map(w => (
                <Link href={`/words/${w.id}`} key={w.id}>
                  <div className="flex justify-between items-center py-2 border-b last:border-0 hover:bg-gray-50 px-2 rounded-lg">
                    <p className="font-medium text-gray-700 capitalize">{w.word}</p>
                    <p className="text-xs text-gray-400">{new Date(w.created_at).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Quiz history</h2>
          {quizHistory.length === 0 ? (
            <p className="text-gray-400 text-sm">No quizzes taken yet</p>
          ) : (
            <div className="space-y-2">
              {quizHistory.map(q => (
                <div key={q.id} className="flex justify-between items-center py-2 border-b last:border-0 px-2">
                  <p className="font-medium text-gray-700">{q.score}/{q.total} correct</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${Math.round((q.score / q.total) * 100) >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                      {Math.round((q.score / q.total) * 100)}%
                    </span>
                    <p className="text-xs text-gray-400">{new Date(q.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Link href="/flashcards" className="bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition text-center text-sm">
            Flashcards
          </Link>
          <Link href="/quiz" className="bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition text-center text-sm">
            Take Quiz
          </Link>
          <Link href="/" className="bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition text-center text-sm">
            Add Words
          </Link>
        </div>

      </div>
    </div>
  )
}
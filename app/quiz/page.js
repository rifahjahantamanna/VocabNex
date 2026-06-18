'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function QuizPage() {
  const [words, setWords] = useState([])
  const [current, setCurrent] = useState(0)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWords() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      const validWords = data.filter(w => w.definition && w.definition !== 'null')
      if (validWords.length >= 4) {
        setWords(validWords)
        generateQuestion(validWords, 0)
      }
      setLoading(false)
    }
    fetchWords()
  }, [])

  async function generateQuestion(wordList, index) {
    setGenerating(true)
    setSelected(null)
    setQuestion(null)

    const word = wordList[index]
    const allWords = wordList.map(w => w.word)

    const res = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: word.word,
        definition: word.definition,
        allWords
      })
    })

    const data = await res.json()
    setQuestion(data)
    setGenerating(false)
  }

  async function handleAnswer(option) {
    if (selected) return
    setSelected(option)
    if (option === question.correct) {
      setScore(s => s + 1)
    }
  }

  async function handleNext() {
    if (current + 1 >= words.length) {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('quiz_scores').insert({
        user_id: user.id,
        score: score + (selected === question.correct ? 1 : 0),
        total: words.length
      })
      setDone(true)
    } else {
      const next = current + 1
      setCurrent(next)
      await new Promise(r => setTimeout(r, 15000))
      generateQuestion(words, next)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f13' }}>
      <p style={{ color: '#6b6b80' }}>Loading quiz...</p>
    </div>
  )

  if (words.length < 4) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f13' }}>
      <div className="text-center">
        <p className="text-5xl mb-4">📝</p>
        <p className="mb-2" style={{ color: '#6b6b80' }}>You need at least 4 words to take a quiz!</p>
        <Link href="/" className="text-indigo-400 hover:text-indigo-300">Add more words</Link>
      </div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f13' }}>
      <div className="rounded-2xl p-10 text-center max-w-md w-full" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
        <p className="text-5xl mb-4">🏆</p>
        <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
        <p className="mb-8" style={{ color: '#6b6b80' }}>You answered {words.length} questions</p>

        <div className="rounded-xl p-6 mb-8" style={{ background: '#1e1b4b' }}>
          <p className="text-5xl font-bold text-indigo-400">{score}/{words.length}</p>
          <p className="mt-2" style={{ color: '#818cf8' }}>
            {Math.round((score / words.length) * 100)}% correct
          </p>
          <p className="mt-1 text-sm" style={{ color: '#818cf8' }}>
            {score === words.length ? 'Perfect score! 🎉' :
             score >= words.length / 2 ? 'Good job! Keep studying 💪' :
             'Keep practicing! You\'ll get there 📚'}
          </p>
        </div>

        <Link
          href="/"
          className="block w-full py-3 rounded-xl font-semibold text-white hover:opacity-90 transition text-center"
          style={{ background: '#4f46e5' }}
        >
          Back to words
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#0f0f13' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="text-sm hover:text-white transition" style={{ color: '#6b6b80' }}>← Back</Link>
          <h1 className="text-xl font-bold text-white">Quiz</h1>
          <p className="text-sm" style={{ color: '#6b6b80' }}>{current + 1} / {words.length}</p>
        </div>

        <div className="rounded-2xl p-8 mb-6" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
          {generating ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"/>
              <p className="text-sm" style={{ color: '#6b6b80' }}>AI is generating your question...</p>
              <p className="text-xs" style={{ color: '#3d3d50' }}>This may take a few seconds</p>
            </div>
          ) : question ? (
            <>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#6b6b80' }}>Question {current + 1}</p>
              <p className="text-xl font-semibold text-white mb-8">{question.question}</p>

              <div className="space-y-3">
                {(question.options || []).map((option, i) => {
                  let bg = '#0f0f13'
                  let border = '#2a2a38'
                  let color = '#9090a8'

                  if (selected) {
                    if (option === question.correct) {
                      bg = '#0f2a1a'; border = '#14532d'; color = '#4ade80'
                    } else if (option === selected) {
                      bg = '#2a0f0f'; border = '#7f1d1d'; color = '#f87171'
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(option)}
                      className="w-full text-left px-5 py-4 rounded-xl transition font-medium"
                      style={{ background: bg, border: `1px solid ${border}`, color }}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>

        {selected && (
          <button
            onClick={handleNext}
            disabled={generating}
            className="w-full py-3 rounded-xl font-semibold text-white hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#4f46e5' }}
          >
            {generating ? 'Loading next question...' : current + 1 >= words.length ? 'See Results' : 'Next Question →'}
          </button>
        )}

      </div>
    </div>
  )
}
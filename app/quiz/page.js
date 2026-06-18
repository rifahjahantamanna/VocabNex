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
             generateQuestion(data, 0)
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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading quiz...</p>
    </div>
  )

  if (words.length < 4) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-2">You need at least 4 words to take a quiz!</p>
        <Link href="/" className="text-blue-600 hover:underline">Add more words</Link>
      </div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-10 text-center max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
        <p className="text-gray-400 mb-8">You answered {words.length} questions</p>

        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <p className="text-5xl font-bold text-blue-600">{score}/{words.length}</p>
          <p className="text-blue-400 mt-2">
            {Math.round((score / words.length) * 100)}% correct
          </p>
          <p className="text-blue-400 mt-1">
            {score === words.length ? 'Perfect score! 🎉' :
             score >= words.length / 2 ? 'Good job! Keep studying 💪' :
             'Keep practicing! You\'ll get there 📚'}
          </p>
        </div>

        <Link
          href="/"
          className="block w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition text-center"
        >
          Back to words
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 text-sm hover:underline">← Back</Link>
          <h1 className="text-xl font-bold text-gray-800">Quiz</h1>
          <p className="text-sm text-gray-400">{current + 1} / {words.length}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          {generating ? (
           <div className="flex flex-col items-center justify-center h-40 gap-3">
           <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"/>
           <p className="text-gray-400 text-sm">AI is generating your question...</p>
           <p className="text-gray-300 text-xs">This may take a few seconds</p>
          </div>
          ) : question ? (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Question {current + 1}</p>
              <p className="text-xl font-semibold text-gray-800 mb-8">{question.question}</p>

              <div className="space-y-3">
                {(question.options || []).map((option, i) => {
                  let style = 'border-2 border-gray-100 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  if (selected) {
                    if (option === question.correct) {
                      style = 'border-2 border-green-400 bg-green-50 text-green-700'
                    } else if (option === selected) {
                      style = 'border-2 border-red-300 bg-red-50 text-red-600'
                    } else {
                      style = 'border-2 border-gray-100 text-gray-400'
                    }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(option)}
                      className={`w-full text-left px-5 py-4 rounded-xl transition font-medium ${style}`}
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
           className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
          {generating ? 'Loading next question...' : current + 1 >= words.length ? 'See Results' : 'Next Question →'}
        </button>
)}

      </div>
    </div>
  )
}
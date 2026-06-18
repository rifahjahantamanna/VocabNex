'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f13' }}>
      <div className="w-full max-w-md px-4">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">VocabNex</h1>
          <p style={{ color: '#6b6b80' }}>Build your vocabulary with AI</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
          <h2 className="text-xl font-bold text-white mb-6">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
            style={{ background: '#0f0f13', border: '1px solid #2a2a38' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            style={{ background: '#0f0f13', border: '1px solid #2a2a38' }}
          />

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
            style={{ background: '#4f46e5' }}
          >
            {isSignUp ? 'Sign Up' : 'Log In'}
          </button>

          {message && (
            <p className="mt-4 text-center text-sm" style={{ color: '#818cf8' }}>{message}</p>
          )}

          <p className="mt-6 text-center text-sm" style={{ color: '#6b6b80' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium hover:text-white transition"
              style={{ color: '#818cf8' }}
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
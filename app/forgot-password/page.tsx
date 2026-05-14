'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'iconsax-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ text: '', type: '' })

    try {
      const response = await fetch('/api/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          text: 'If an account exists with this email, a password reset link has been sent.', 
          type: 'success' 
        })
        setEmail('')
      } else {
        setMessage({ text: data.error || 'Failed to send reset link', type: 'error' })
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setMessage({ text: 'An unexpected error occurred', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="w-full flex h-screen">
      {/* Left side - Illustration */}
      <div className="illustration bg-pes-gradient w-1/2 h-screen relative flex">
        <Image
          src="/pes.svg"
          alt="PES logo"
          width={130}
          height={130}
          className="z-10 mx-auto my-auto"
        />
      </div>

      {/* Right side - Form */}
      <div className="form w-1/2 h-screen flex flex-col p-28 justify-center">
        <div className="mb-6">
          <Link href="/login" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft size={20} className="mr-1" />
            Back to Login
          </Link>
          <h1 className="text-4xl font-semibold mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-400'
                : 'bg-red-100 text-red-700 border border-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input flex flex-col justify-center mb-6">
            <label htmlFor="email" className="mb-2 font-medium">
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border border-gray-200 text-gray-700 focus:outline-blue-600 px-4 py-3 rounded-lg"
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
              tabIndex={1}
            />
          </div>

          <button
            type="submit"
            className="btn bg-blue-600 text-white px-4 py-3 w-full rounded-lg mb-4 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            tabIndex={2}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="text-center text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

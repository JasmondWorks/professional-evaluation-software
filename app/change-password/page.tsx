'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { ArrowLeft } from 'iconsax-react'
import LoadingButton from '../components/ui/LoadingButton'

type JWTPayload = {
  email: string
  name: string
}

export default function ChangePassword() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setMessage({ text: '', type: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ text: '', type: '' })

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' })
      setIsSubmitting(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long', type: 'error' })
      setIsSubmitting(false)
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage({ text: 'New password must be different from current password', type: 'error' })
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setMessage({ text: 'Please log in again', type: 'error' })
        setIsSubmitting(false)
        return
      }

      const decoded: JWTPayload = jwtDecode(token)

      const response = await fetch('/api/changePassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: decoded.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ text: 'Password changed successfully!', type: 'success' })
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setMessage({ text: data.error || 'Failed to change password', type: 'error' })
      }
    } catch (error) {
      console.error('Change password error:', error)
      setMessage({ text: 'An unexpected error occurred', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={20} className="mr-1" />
              Back
            </button>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
                tabIndex={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    document.getElementById('newPassword')?.focus()
                  }
                }}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
                tabIndex={2}
                minLength={6}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    document.getElementById('confirmPassword')?.focus()
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
                tabIndex={3}
                minLength={6}
              />
            </div>

            <LoadingButton
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              tabIndex={4}
            >
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </LoadingButton>
          </form>
        </div>
      </div>
    </div>
  )
}

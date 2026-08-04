'use client'
import { getAccessToken } from '@/app/utils/auth';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { ArrowLeft } from 'iconsax-react'
import LoadingButton from '@/app/components/ui/LoadingButton'
import { notify } from '@/lib/toast'
import { apiFetch } from '@/app/utils/apiFetch';

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
  // Inline error state for validation and network/server error messages.
  const [errorMessage, setErrorMessage] = useState('')

  function fail(text: string) {
    setErrorMessage(text)
    notify.error(text)
    setIsSubmitting(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrorMessage('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      return fail('New passwords do not match')
    }

    if (formData.newPassword.length < 6) {
      return fail('Password must be at least 6 characters long')
    }

    if (formData.currentPassword === formData.newPassword) {
      return fail('New password must be different from current password')
    }

    const toastId = notify.loading('Changing password…')

    try {
      const token = getAccessToken()
      if (!token) {
        notify.dismiss(toastId)
        return fail('Please log in again')
      }

      const decoded: JWTPayload = jwtDecode(token)

      const response = await apiFetch('/api/changePassword', {
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
        notify.dismiss(toastId)
        notify.success('Password changed successfully!')
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        notify.dismiss(toastId)
        fail(data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Change password error:', error)
      notify.dismiss(toastId)
      fail('Unable to reach the server. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form w-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-semibold text-strong">
          Change Password
        </h1>
        <button
          onClick={() => router.back()}
          className="flex items-center text-pes hover:text-[#141444]"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </button>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded bg-danger-100 text-danger-700 border border-danger-600"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-body mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-pes"
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
              <label htmlFor="newPassword" className="block text-sm font-medium text-body mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-pes"
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
              <p className="text-xs text-muted mt-1">Must be at least 6 characters long</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-body mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-pes"
                required
                disabled={isSubmitting}
                tabIndex={3}
                minLength={6}
              />
            </div>

            <LoadingButton
              type="submit"
              className="w-full bg-pes text-white py-3 rounded-md hover:bg-pes-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              tabIndex={4}
            >
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </LoadingButton>
      </form>
    </div>
  )
}

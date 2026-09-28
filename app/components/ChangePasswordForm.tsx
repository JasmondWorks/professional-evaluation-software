'use client'
import { getAccessToken, setAccessToken } from '@/app/utils/auth';

import { useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import LoadingButton from '@/app/components/ui/LoadingButton'
import Input from '@/app/components/ui/Input'
import { notify } from '@/lib/toast'
import { apiFetch } from '@/app/utils/apiFetch';

type JWTPayload = {
  email: string
  name: string
}

/** The password-change form itself, shared by the profile page (everyday use)
 *  and the forced first-login screen (PasswordGate redirects here until the
 *  claim clears — see app/components/PasswordGate.tsx). */
export default function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
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
        // The old token still carries mustChangePassword: true, so without
        // swapping it in immediately, a forced-change redirect would land
        // back on this same gated screen until some unrelated token refresh
        // happened to clear the stale claim.
        if (data.token) setAccessToken(data.token)

        notify.dismiss(toastId)
        notify.success('Password changed successfully!')
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        onSuccess?.()
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
    <div>
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded bg-danger-100 text-danger-700 border border-danger-600"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Current Password"
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
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

        <Input
          label="New Password"
          type="password"
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          tabIndex={2}
          minLength={6}
          hint="Must be at least 6 characters long"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              document.getElementById('confirmPassword')?.focus()
            }
          }}
        />

        <Input
          label="Confirm New Password"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          tabIndex={3}
          minLength={6}
        />

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

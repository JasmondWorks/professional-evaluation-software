'use client'

import { useRouter } from "next/navigation";
import Link from 'next/link'
import { jwtDecode } from "jwt-decode";import { getAccessToken } from '@/app/utils/auth';

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/app/utils/apiFetch';

type user = {
  id: number
  name: string
  email: string 
  gsm: string
  role: string
  org: string
}

const init = {
  id: 0,
  name: '',
  email: '',
  gsm: '',
  role: '',
  org: '',
}

export default function Page({ params }: { params: { user: string } }) {
  const [user, setUser] = useState<user>(init)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const access_token = getAccessToken() as string
      jwtDecode(access_token)

      const res = await apiFetch(`/api/admin/users/${params.user}`)
      const data = await res.json()
      setUser(data)
    }
    fetchUser()
  }, [params.user])

  function logout() {
    localStorage.removeItem('access_token')
    router.push('/admin')
  }

  // 💀 DELETE FEATURE
  async function deleteUser() {
    const confirmed = confirm(
      `Delete ${user.name}? This cannot be undone.`
    )

    if (!confirmed) return

    setDeleting(true)

    await apiFetch(`/api/admin/users/${user.id}`, {
      method: "DELETE"
    })

    // redirect back to org page after deletion
    router.push(`/admin/${user.org}`)
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-canvas">

      {/* Header */}
      <div className='flex justify-between items-center p-6 bg-white shadow-sm'>
        <h1 className='text-2xl font-semibold'>{user.name}</h1>

        <div className="flex gap-4">
          <button
            onClick={logout}
            className="text-muted hover:text-pes"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-6 space-y-4 m-6">

        <h2 className="text-xl font-semibold text-pes border-b pb-2">
          User Profile
        </h2>

        <div className="space-y-2 text-sm">

          <div className="flex justify-between">
            <span className="font-medium text-muted">Name</span>
            <span className='font-bold'>{user.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-muted">Email</span>
            <span className='font-bold'>{user.email}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-muted">Role</span>
            <span className="capitalize font-bold">{user.role}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-muted">Phone</span>
            <span className='font-bold'>{user.gsm}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-muted">Organisation</span>
            <span className='font-bold'>{user.org}</span>
          </div>

        </div>

        {/* 🔴 Danger Zone */}
        <div className="pt-4 border-t">
          <button
            onClick={deleteUser}
            disabled={deleting}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete User"}
          </button>
        </div>

      </div>

    </div>
  )
}
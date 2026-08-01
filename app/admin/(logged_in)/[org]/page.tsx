'use client'

import { ArrowRight2 } from 'iconsax-react'
import { useRouter } from "next/navigation";
import Link from 'next/link'
import { jwtDecode } from "jwt-decode";import { getAccessToken } from '@/app/utils/auth';

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/app/utils/apiFetch';

type User = {
  id: number
  name: string
  email: string 
  gsm: string
  role: string
  org: string
}

export default function Page({ params }: { params: { org: string } }) {
  const [users, setUsers] = useState<User[]>([])
  const router = useRouter()

  useEffect(() => {
    async function fetchUsers() {
      const access_token = getAccessToken() as string
      jwtDecode(access_token) // assuming you check auth elsewhere

      const res = await apiFetch(`/api/admin/orgs/${params.org}/users`)
      const data = await res.json()
      setUsers(data)
    }
    fetchUsers()
  }, [params.org])

  function logout() {
    localStorage.removeItem('access_token')
    router.push('/admin')
  }

  // 🧠 Group users by role
  const groupedUsers = users.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = []
    acc[user.role].push(user)
    return acc
  }, {} as Record<string, User[]>)

  const roleOrder = ["super-admin", "admin", "auditor", "user"]

  const sortedGroups = Object.entries(groupedUsers).sort(
    ([a], [b]) =>
      (roleOrder.indexOf(a) === -1 ? 999 : roleOrder.indexOf(a)) -
      (roleOrder.indexOf(b) === -1 ? 999 : roleOrder.indexOf(b))
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold">
          Users — {params.org}
        </h1>

        <button
          onClick={logout}
          className="text-gray-500 hover:text-red-500"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">

        {sortedGroups.map(([role, roleUsers]) => (
          <div key={role}>

            {/* Role Section Title */}
            <h2 className="text-lg font-semibold text-pes mb-3 capitalize">
              {role}
            </h2>

            {/* Users */}
            <div className="flex flex-col gap-3">
              {roleUsers.map((user) => (
                <Link
                  href={`/admin/${user.org}/${user.id}`}
                  key={user.id}
                  className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm hover:bg-gray-100 transition"
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                  </div>

                  <ArrowRight2 />
                </Link>
              ))}
            </div>

          </div>
        ))}

      </div>
    </div>
  )
}
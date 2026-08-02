'use client'

import { ArrowRight2 } from 'iconsax-react'
import { useRouter } from "next/navigation";
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/app/utils/apiFetch';

type User = {
  id: number
  name: string
  email: string
  role: string
  org: string
}

export default function Page({ params }: { params: { org: string } }) {
  const [auditors, setAuditors] = useState<User[]>([])
  const router = useRouter()

  useEffect(() => {
    async function fetchAuditors() {
      const res = await apiFetch(`/api/admin/orgs/${params.org}/auditors`)
      const data = await res.json()
      setAuditors(data)
    }
    fetchAuditors()
  }, [params.org])

  return (
    <div className="flex flex-col min-h-screen bg-canvas">

      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold">
          Auditors — {params.org}
        </h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">

        {auditors.length === 0 && (
          <div className="text-muted">
            No auditors found in this organisation.
          </div>
        )}

        {auditors.map((user) => (
          <Link
            href={`/admin/${user.org}/${user.id}`}
            key={user.id}
            className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm hover:bg-line/50 transition"
          >
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted">
                {user.email}
              </div>
            </div>

            <ArrowRight2 />
          </Link>
        ))}

      </div>
    </div>
  )
}
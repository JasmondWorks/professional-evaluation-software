'use client'

import { ArrowRight2 } from 'iconsax-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/app/utils/apiFetch';

type Auditor = {
  id: number
  name: string
  email: string
  org: string
  audit_count: number
}

export default function Page() {
  const [auditors, setAuditors] = useState<Auditor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAuditors() {
      const res = await apiFetch(`/api/admin/all-auditors`)
      const data = await res.json()
      setAuditors(data)
      setLoading(false)
    }
    fetchAuditors()
  }, [])

  if (loading) {
    return <div className="p-6">Loading auditors...</div>
  }

  // Group auditors by org
  const grouped = auditors.reduce((acc, user) => {
    if (!acc[user.org]) acc[user.org] = []
    acc[user.org].push(user)
    return acc
  }, {} as Record<string, Auditor[]>)

  // Sort orgs alphabetically
  const sortedOrgs = Object.keys(grouped).sort((a, b) => a.localeCompare(b))

  return (
    <div className="flex flex-col min-h-screen bg-canvas">

      {/* Header */}
      <div className="p-6 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold">
          All Auditors (Grouped by Organisation)
        </h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {sortedOrgs.map((org) => {
          const orgAuditors = grouped[org]
          return (
            <div key={org}>
              {/* Org Header with total count */}
              <h2 className="text-lg font-semibold text-body mb-3">
                {org} ({orgAuditors.length})
              </h2>

              {/* Auditors in Org */}
              {orgAuditors.length === 0 ? (
                <div className="text-muted italic">
                  No auditors in this organisation
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orgAuditors.map((user) => {
                    const eligible = Number(user.audit_count) < 4
                    return (
                      <Link
                        href={`/admin/${user.org}/${user.id}`}
                        key={user.id}
                        className={`flex justify-between items-center p-4 rounded-xl shadow-sm transition
                          ${eligible ? 'bg-white hover:bg-green-50' : 'bg-gray-200 opacity-70'}
                        `}
                      >
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted">{user.email}</div>
                          <div className="text-sm mt-1">
                            Audit count: <span className="font-semibold">{user.audit_count}</span>
                            {eligible ? (
                              <span className="ml-2 text-green-600 font-bold text-xs">Eligible for Audit</span>
                            ) : (
                              <span className="ml-2 text-red-600 font-bold text-xs">Max number of audits reached</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight2 />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

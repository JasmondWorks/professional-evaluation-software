'use client'

import { ArrowRight2 } from 'iconsax-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/app/utils/apiFetch';

type AuditorDocument = {
  key: string
  label: string
  url: string
}

type Auditor = {
  id: number
  name: string
  email: string
  org: string
  audit_count: number
  /** Whether the auditor agreed to be recognized by PES across organizations. */
  recognitionConsent: boolean
  /** Their uploaded credential documents. Null means this account may not see
   *  them (the auditor withheld recognition consent); an empty array means the
   *  auditor uploaded none. */
  documents: AuditorDocument[] | null
}

/** Every organization's approved external auditors, for the platform operator.
 *
 *  Lives in components rather than under a route because it is rendered from
 *  the main app shell (/external-auditors), where the platform operator
 *  actually works. The legacy /admin console redirects there. */
export default function PlatformAuditorRoster() {
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
    <div className="flex flex-col">
      <div className="space-y-8">
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
                      <div
                        key={user.id}
                        className={`p-4 rounded-xl shadow-sm transition
                          ${eligible ? 'bg-white' : 'bg-gray-200 opacity-70'}
                        `}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            {/* The operator asked to reach auditors' emails; this
                                is a mailto rather than plain text so it is usable
                                rather than something to copy by hand. */}
                            <a
                              href={`mailto:${user.email}`}
                              className="text-sm text-pes underline"
                            >
                              {user.email}
                            </a>
                            <div className="text-sm mt-1">
                              Audit count: <span className="font-semibold">{user.audit_count}</span>
                              {eligible ? (
                                <span className="ml-2 text-green-600 font-bold text-xs">Eligible for Audit</span>
                              ) : (
                                <span className="ml-2 text-danger-600 font-bold text-xs">Max number of audits reached</span>
                              )}
                            </div>
                            <div className="text-xs mt-1">
                              {user.recognitionConsent ? (
                                <span className="text-green-700 font-semibold">
                                  Recognised by PES
                                </span>
                              ) : (
                                <span className="text-muted">
                                  Recognition not granted
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            href={`/admin/${user.org}/${user.id}`}
                            aria-label={`Open ${user.name}`}
                            className="shrink-0 rounded-lg p-2 hover:bg-canvas"
                          >
                            <ArrowRight2 />
                          </Link>
                        </div>

                        {/* Uploaded credential documents. These were stored at
                            submission and never surfaced anywhere until now. */}
                        <div className="mt-3 border-t border-line pt-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                            Uploaded documents
                          </div>
                          {user.documents === null ? (
                            <p className="mt-1 text-sm text-muted">
                              Withheld — this auditor did not consent to recognition by PES.
                            </p>
                          ) : user.documents.length === 0 ? (
                            <p className="mt-1 text-sm text-muted">
                              None uploaded.
                            </p>
                          ) : (
                            <ul className="mt-1 flex flex-wrap gap-2">
                              {user.documents.map((doc) => (
                                <li key={doc.key}>
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center rounded-lg border border-line px-2.5 py-1 text-sm text-pes hover:bg-canvas"
                                  >
                                    {doc.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
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

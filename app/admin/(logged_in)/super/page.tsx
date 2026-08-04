import prisma from "../../../../app/api/prisma.dev"
import Link from "next/link"
import React from "react"

// Fetches super-admins from the DB at request time — must not be prerendered at build.
export const dynamic = "force-dynamic"

type SuperAdmin = {
  id: number
  name: string
  email: string
  org: string
}

// Server Action to fetch super-admins
async function getSuperAdmins(): Promise<SuperAdmin[]> {
  return await prisma.$queryRawUnsafe(
    `SELECT id, name, email, org FROM pesuser WHERE role = 'super-admin' ORDER BY name`
  )
}

export default async function SuperAdminsPage() {
  const admins = await getSuperAdmins()

  return (
    <div className="min-h-screen bg-canvas p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Super Admins</h1>
        <Link
          href="/admin/super/add"
          className="bg-pes text-white px-4 py-2 rounded-md hover:bg-pes-dark"
        >
          Add New
        </Link>
      </div>

      {admins.length === 0 ? (
        <div className="text-muted italic">No super-admins found.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="p-4 bg-white rounded-xl shadow-sm flex justify-between items-center"
            >
              <div>
                <div className="font-medium capitalize text-pes font-semibold">{admin.name}</div>
                <div className="text-sm text-muted">{admin.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

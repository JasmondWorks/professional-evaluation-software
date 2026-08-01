'use client'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/app/utils/apiFetch';

export default function AddSuperAdminPage() {
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    await apiFetch('/api/admin/add-super-admin', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        org: formData.get('org'),
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    router.push('/admin/super-admins') // go back after adding
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Add New Super Admin</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white p-6 rounded-xl shadow-sm">
        <input name="name" type="text" placeholder="Name" required className="p-2 border rounded-md" />
        <input name="email" type="email" placeholder="Email" required className="p-2 border rounded-md" />
        <input name="org" type="text" placeholder="Organisation" required className="p-2 border rounded-md" />
        <button type="submit" className="bg-pes text-white px-4 py-2 rounded-md hover:bg-pes-dark">
          Add Super Admin
        </button>
      </form>
    </div>
  )
}

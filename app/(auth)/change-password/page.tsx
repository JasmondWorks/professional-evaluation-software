'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'iconsax-react'
import ChangePasswordForm from '@/app/components/ChangePasswordForm'
import Button from '@/app/components/ui/Button'

/** Reached two ways: from PasswordGate, forced on first login until the
 *  password is changed (?first=1, no back button — that's the only place
 *  they're allowed to be), or directly, e.g. an old bookmark or a shared
 *  link (back button shown). The everyday path is now the form embedded in
 *  /profile. */
export default function ChangePassword() {
  const router = useRouter()
  const forced = useSearchParams().get('first') === '1'

  return (
    <div className="form w-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-semibold text-strong">
          Change Password
        </h1>
        {!forced && (
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-pes hover:text-[#141444] hover:bg-transparent"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back
          </Button>
        )}
      </div>

      <ChangePasswordForm onSuccess={() => setTimeout(() => router.push('/dashboard'), 2000)} />
    </div>
  )
}

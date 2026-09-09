import '.././globals.css'
import type { Metadata } from 'next'

// No font is loaded here on purpose. Signup inherits the platform's one
// typeface from the root layout — it used to apply Lato to this page alone
// (and download Inter and Montserrat without using either), so the first
// screen a customer saw was set in a face that appeared nowhere else.

export const metadata: Metadata = {
  title: 'PES | Sign Up',
  description: 'Sign up for this programme',
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='bg-gray-10 flex flex-row relative justify-center w-full max-w-screen min-h-screen'>
        {children}          
    </div>
  )
}

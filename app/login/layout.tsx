import '../globals.css'
import type { Metadata } from 'next'
import { Lato } from 'next/font/google'

const lato = Lato({
  weight: ['100', '300', '400', '700', '900'],
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'PES | Sign In',
  description: 'Performance Appraisal Software',
}

// Renamed to LoginLayout for clarity, though not strictly required
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${lato.className} bg-gray-10 flex flex-row relative justify-center w-full max-w-screen h-screen`}>
      {children}
    </div>
  )
}
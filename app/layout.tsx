//import './globals.css'
//import type { Metadata } from 'next'
// import { Lato } from 'next/font/google'
//import { AuthProvider } from './components/useAuth'

// const lato = Lato( 
//  {
//    weight: ['100', '300', '400', '700', '900'],
//    subsets: ['latin'],
//   }
//  )

// export const metadata: Metadata = {
//  title: 'PES',
//  description: 'Performance Appraisal Software',
//}

//export default function RootLayout({ children }: { children: //React.ReactNode }) {
//  return (
//    <html lang="en">
//      <body className={ lato.className + ' bg-gray-10 flex flex-row relative //justify-center max-w-screen h-screen' }>
//        <AuthProvider>
//          {children}          
//        </AuthProvider>
//      </body>        
//    </html>      
//  )
//}

import './globals.css'
import type { Metadata } from 'next'
// import { Lato } from 'next/font/google'  // Commented out
import { AuthProvider } from './components/useAuth'

// const lato = Lato(   // Commented out
//   {
//     weight: ['100', '300', '400', '700', '900'],
//     subsets: ['latin'],
//    }
//   )

export const metadata: Metadata = {
  title: 'PES',
  description: 'Performance Appraisal Software',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Remove lato.className from here */}
      <body className={'bg-gray-10 flex flex-row relative justify-center max-w-screen h-screen'}>
        <AuthProvider>
          {children}          
        </AuthProvider>
      </body>        
    </html>      
  )
}
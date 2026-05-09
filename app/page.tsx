"use client"
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from 'react';


export default function Home() {
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, []) 

  return(
    <main className="w-full flex justify-center overflow-hidden relative bg-pes text-white">
      <div className='flex- flex-col absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse'>
        <Image src={ '/pes.svg' } alt='pes hero image' width={ 250 } height={ 250 } className='z-10 mx-auto my-auto'/>
        <p className='text-3xl my-6 text-center'>Loading, Please wait...</p>        
      </div>
    </main>     
  )
}

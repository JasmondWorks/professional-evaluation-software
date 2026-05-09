'use client'

import { InfoCircle, Logout } from "iconsax-react"
import Link from "next/link"
import { RootState } from '@/app/state/store'
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from 'react-redux';
import { actionView } from "@/app/state/action/actionSlice";

export default function Action(){
  const isVisible = useSelector((state: RootState)=> state.action.visible )
  const router = useRouter()
  const dispatch = useDispatch()

  function handleLogout(){
    dispatch( actionView() )
    localStorage.removeItem('access_token')
    router.push('/')
  }

  return (
    <div className = {`${ isVisible? 'visible' : 'invisible' } logout rounded-sm shadow-lg bg-white py-8 z-10 flex flex-col absolute top-24 right-8`}>
      <Link href={`/`} className='flex py-2 px-2 justify-start ps-8 pe-20 hover:bg-gray-100'>
        <InfoCircle className='me-2'/>
        Get help
      </Link>

      <div onClick={ handleLogout } className='text-red-500 flex py-2 px-2 justify-start ps-8 pe-20 hover:bg-gray-100'>
        <Logout className='me-2'/>
        logout
      </div>
    </div>
  )
}
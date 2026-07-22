'use client'
import React, { useEffect, useState } from 'react'
import { getAccessToken } from '@/app/utils/auth'
import DataField from './ui/DataField'
import { titleCase, formatDate, getInitials } from '@/lib/utils'

type user = {
   id:number
   name: string
   email: string 
   password: string
   gsm: string
   role: string
   display_role?: string
   address: string
   faculty_college: string
   dob: string
   doa: string
   poa : string
   doc : string
   post : string
   dopp: string
   level: string
   image : string
   org : string
 }

export default function ProfileChunk(){
   const [ expanded, setExpanded ] = useState(false)
   const [user, setUser] = useState<user | null>(null)
   const ImageFallback = () => <div className='w-40 h-40 rounded-md animate-pulse bg-gray-200'></div>
   const TextFallback = () => <><div className='w-60 h-3 my-1 rounded-full animate-pulse bg-gray-200'></div><div className='w-40 h-3 my-1 rounded-full animate-pulse bg-gray-200'></div></>

   useEffect( () => {
      const access_token = getAccessToken() as string
      console.log('access toknei s TokenExpiredError', access_token)

      async function fetchUser(){
         const data = await fetch('/api/getUser', 
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json"
               },
               body: JSON.stringify({ token: access_token }) // Converting the data object to a JSON string
            }
         )
         let res = data.json()
         setUser(await res)
      }
      fetchUser()
   }, [])


   return(
      <div className="details my-2">
         <div className='(initial) flex justify-between'>
            <div className='flex justify-between max-sm:gap-4 max-sm:flex-col py-2'>
               <div className='w-40 h-40 me-8 max-sm:w-full'>
                  {
                     user?.image ?
                        <img src={ user.image } alt="profile-img" className='w-full h-full object-cover rounded-md'/>
                     :
                        <div className='w-full h-full rounded-md bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-4xl'>
                           {user?.name ? getInitials(user.name) : '?'}
                        </div>
                  }
               </div>

               <div className='flex flex-col'>
                  {user ? <DataField label="Name" value={titleCase(user.name)} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
                  {user ? <DataField label="Functional GSM" value={user.gsm} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
                  {user ? <DataField label="Current home address" value={titleCase(user.address)} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
               </div>
            </div>

            <div className='flex flex-col min-w-[30rem] py-2 px-4'>
               {user ? <DataField label="Email" value={user.email.toLowerCase()} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
               {user ? <DataField label="Present role" value={titleCase(user.display_role || user.role)} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
               {user ? <DataField label="Faculty/college" value={titleCase(user.faculty_college)} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}

               {/* <div className='my-2 flex flex-col'>
                  <p className='text-gray-400'>Faculty/college:</p>
                  <p className='font-semibold text-lg'>{}</p>
               </div> */}
            </div>
         </div>

         <div style={{ display: `${ expanded? '' : 'none' }` }}  className='(see more) flex flex-col justify-between'>
            <div className='flex justify-between w-9/12'>
               {user ? <DataField label="Date of Birth" value={formatDate(user.dob)} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
               {user ? <DataField label="Date of first Appointment" value={formatDate(user.doa)} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
               {user ? <DataField label="Post/grade of first appointment" value={titleCase(user.poa)} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
               {user ? <DataField label="Date of confirmation" value={formatDate(user.doc)} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
            </div>

            <div className='flex justify-between w-9/12'>
               {user ? <DataField label="Present Post" value={titleCase(user.post)} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
               {user ? <DataField label="Date appointed to present post" value={formatDate(user.dopp)} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
               {user ? <DataField label="Current Level/Step" value={user.level} /> : <div className="my-2 flex flex-col"><TextFallback/></div>}
            </div>
            
            <div className='flex justify-between w-9/12'>
               <div className='my-2 flex flex-col'>
                  <p className='text-gray-400'>Academic certification:</p>
                  <div>
                     {
                        // TODO - render certification here
                     }
                  </div>
               </div>

            </div>
         </div>

         <div className='flex justify-end'>
            <p style={{ display: `${ expanded? 'none' : '' }` }} className={` text-blue-900 cursor-pointer hover:text-blue-950 underline text-md font-medium`} onClick={ () => setExpanded( prevState => !prevState ) }>See more</p>
            <p style={{ display: `${ expanded? '' : 'none' }` }} className={`${ expanded? '' : 'none' } text-blue-900 cursor-pointer hover:text-blue-950 underline text-md font-medium`} onClick={ () => setExpanded( prevState => !prevState ) }>See less</p>
         </div>
      </div>
   )
}
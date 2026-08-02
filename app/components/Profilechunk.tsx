'use client'
import React, { useEffect, useState } from 'react'
import { getAccessToken } from '@/app/utils/auth'
import DataField from './ui/DataField'
import { titleCase, formatDate, getInitials } from '@/lib/utils'
import { apiFetch } from '@/app/utils/apiFetch';
import Skeleton from './ui/Skeleton';

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
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(false)
   
   const TextFallback = () => (
      <>
         <Skeleton className="w-60 h-3 my-1 rounded-full" />
         <Skeleton className="w-40 h-3 my-1 rounded-full" />
      </>
   );

   useEffect( () => {
      const access_token = getAccessToken() as string

      async function fetchUser(){
         try {
            const data = await apiFetch('/api/getUser', 
               {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ token: access_token }) // Converting the data object to a JSON string
               }
            )
            if (!data.ok) throw new Error("Failed");
            const res = await data.json()
            setUser(res)
         } catch {
            setError(true)
         } finally {
            setLoading(false)
         }
      }
      fetchUser()
   }, [])


   return(
      <div className="details my-2">
         <div className='(initial) flex justify-between'>
            <div className='flex justify-between max-sm:gap-4 max-sm:flex-col py-2'>
               <div className='w-40 h-40 me-8 max-sm:w-full shrink-0'>
                  {
                     loading ? <Skeleton className="w-full h-full rounded-md" /> :
                     user?.image ?
                        <img src={ user.image } alt="profile-img" className='w-full h-full object-cover rounded-md'/>
                     :
                        <div className='w-full h-full rounded-md bg-gray-300 flex items-center justify-center text-body font-bold text-4xl'>
                           {user?.name ? getInitials(user.name) : '?'}
                        </div>
                  }
               </div>

               <div className='flex flex-col gap-4 py-2'>
                  {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Name" value={titleCase(user?.name || '')} />}
                  {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Functional GSM" value={user?.gsm || ''} />}
                  {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Current home address" value={titleCase(user?.address || '')} />}
               </div>
            </div>

            <div className='flex flex-col gap-4 min-w-[30rem] py-2 px-4'>
               {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Email" value={user?.email?.toLowerCase() || ''} />}
               {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Present role" value={titleCase(user?.display_role || user?.role || '')} />}
               {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Faculty/college" value={titleCase(user?.faculty_college || '')} />}

               {/* <div className='my-2 flex flex-col'>
                  <p className='text-muted'>Faculty/college:</p>
                  <p className='font-semibold text-lg'>{}</p>
               </div> */}
            </div>
         </div>

         <div style={{ display: `${ expanded? '' : 'none' }` }}  className='(see more) flex flex-col justify-between mt-4 gap-6'>
            <div className='flex justify-between w-9/12'>
               {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Date of Birth" value={formatDate(user?.dob || '')} />}
               {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Date of first Appointment" value={formatDate(user?.doa || '')} />}
               {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Post/grade of first appointment" value={titleCase(user?.poa || '')} />}
               {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Date of confirmation" value={formatDate(user?.doc || '')} />}
            </div>

            <div className='flex justify-between w-9/12'>
               {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Present Post" value={titleCase(user?.post || '')} />}
               {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Date appointed to present post" value={formatDate(user?.dopp || '')} />}
               {loading ? <div className="my-2 flex flex-col"><TextFallback/></div> : <DataField label="Current Level/Step" value={user?.level || ''} />}
            </div>
            
            <div className='flex justify-between w-9/12'>
               <div className='my-2 flex flex-col'>
                  <p className='text-muted'>Academic certification:</p>
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
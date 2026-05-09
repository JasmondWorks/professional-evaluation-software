'use client'
import React, { useEffect, useState } from 'react'

type user = {
   id:number
   name: string
   email: string 
   password: string
   gsm: string
   role: string
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
      const access_token = localStorage.getItem('access_token') as string
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
                     user?.image == "" ?
                        <img src={ `/${user.image}` } alt="profile-img" className='w-full h-full'/>                   
                     :
                        <img src='/young oti.PNG' alt='profile' />                        

                  }
               </div>

               <div className='flex flex-col'>
                  <div className='my-2 flex flex-col'>
                     {
                        user?
                           <>
                              <p className='text-gray-400'>Name:</p>
                              <p className='font-semibold text-lg'>{user.name}</p>                         
                           </>
 
                        :
                           <TextFallback/>                        
                     }
                  </div>

                  <div className='my-2 flex flex-col'>
                     {
                        user?
                        <>
                           <p className='text-gray-400'>Functional GSM:</p>
                           <p className='font-semibold text-lg'>{user.gsm}</p>                      
                        </>
                        
                        :
                        <TextFallback/>
                     }
                  </div>

                  <div className='my-2 flex flex-col'>
                     {
                        user?
                           <>
                              <p className='text-gray-400'>Current home address:</p>
                              <p className='font-semibold text-lg'>{user.address}</p>                            
                           </>
                        :
                        <TextFallback />
                     }
                  </div>
               </div>
            </div>

            <div className='flex flex-col min-w-[30rem] py-2 px-4'>
               <div className='my-2 flex flex-col'>
                  {
                     user?
                        <>
                           <p className='text-gray-400'>Email:</p>
                           <p className='font-semibold text-lg'>{user.email}</p>                             
                        </>
                     :
                     <TextFallback />
                  } 
               </div>

               <div className='my-2 flex flex-col'>
                  {
                     user?
                        <>
                           <p className='text-gray-400'>Present role:</p>
                           <p className='font-semibold text-lg'>{user.role}</p>                           
                        </>
                     :
                     <TextFallback />
                  }
               </div>

               <div className='my-2 flex flex-col'>
                  {
                     user?
                        <>
                           <p className='text-gray-400'>Faculty/college:</p>
                           <p className='font-semibold text-lg'>{user.faculty_college}</p>                             
                        </>
                     :
                     <TextFallback />
                  }
                
               </div>

               {/* <div className='my-2 flex flex-col'>
                  <p className='text-gray-400'>Faculty/college:</p>
                  <p className='font-semibold text-lg'>{}</p>
               </div> */}
            </div>
         </div>

         <div style={{ display: `${ expanded? '' : 'none' }` }}  className='(see more) flex flex-col justify-between'>
            <div className='flex justify-between w-9/12'>
               <div className='my-2 flex flex-col'>
                  {
                     user?
                        <>
                           <p className='text-gray-400'>Date of Birth:</p>
                           <p className='font-semibold text-lg'>{user.dob?.toString().split('T')[0]}</p>                           
                        </>
                     :
                     <TextFallback />
                  }
               </div>

               <div className='my-2 flex flex-col'>
                  {
                     user?
                        <>
                           <p className='text-gray-400'>date of first Appointment:</p>
                           <p className='font-semibold text-lg'>{user.doa?.toString().split('T')[0]}</p>                           
                        </>
                     :
                     <TextFallback />
                  }
               </div>

               <div className='my-2 flex flex-col'>
                  {
                     user?
                        <>
                           <p className='text-gray-400'>Post/grade of first appointment:</p>
                           <p className='font-semibold text-lg'>{user.poa}</p>                           
                        </>
                     :
                     <TextFallback />
                  }

               </div>

               <div className='my-2 flex flex-col'>
                  {
                     user?
                        <>
                           <p className='text-gray-400'>Date of confirmation:</p>
                           <p className='font-semibold text-lg'>{user.doc?.toString().split('T')[0]}</p>                        
                        </>
                     :
                     <TextFallback />
                  }
               </div>
            </div>

            <div className='flex justify-between w-9/12'>
               <div className='my-2 flex flex-col'>
                  {
                     user?
                        <>
                           <p className='text-gray-400'>Present Post:</p>
                           <p className='font-semibold text-lg'>{user.post}</p>                        
                        </>
                     :
                     <TextFallback />
                  }
               </div>

               <div className='my-2 flex flex-col'>
                  {
                     user?
                        <>
                           <p className='text-gray-400'>Date appointed to present post:</p>
                           <p className='font-semibold text-lg'>{user.dopp?.toString().split('T')[0]}</p>                        
                        </>
                     :
                     <TextFallback />
                  }
               </div>

               <div className='my-2 flex flex-col'>
                  {
                     user?
                        <>
                           <p className='text-gray-400'>Current Level/Step:</p>
                           <p className='font-semibold text-lg'>{user.level}</p>                        
                        </>
                     :
                     <TextFallback />
                  }
               </div>
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
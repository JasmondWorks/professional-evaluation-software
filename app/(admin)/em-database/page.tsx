'use client'

import React, { useState } from 'react'
import Employee from '@/app/components/em-database routes/Employee';
import Roles from '@/app/components/em-database routes/Roles';


export default function Database(){
   const [ databaseView, setDatabaseView ] = useState('employee')

   return(
      <div className='flex flex-col h-full w-full'>
         <div className='nav flex justify-start bg-white h-[4rem] w-full text-gray-300 text-md border border-slate-50'>
            <ul className='flex mx-16 gap-2 my-auto w-[30%] justify-between'>
               <li className={`border-2 cursor-pointer rounded-sm border-transparent ${ (databaseView == 'employee') ? 'text-blue-800 border-b-blue-800' : '' }`} onClick={ () => { setDatabaseView('employee') } }>Employees</li>
               <li className={`border-2 cursor-pointer rounded-sm border-transparent ${ (databaseView == 'roles') ? 'text-blue-800 border-b-blue-800' : '' }`} onClick={ () => { setDatabaseView('roles') } }>Roles and Permissions</li>
            </ul>
         </div>
         {
            databaseView == 'employee' ?
               <Employee/>
            :
               <Roles />
         }
      </div>
   )
}
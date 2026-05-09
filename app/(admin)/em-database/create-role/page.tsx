'use client'

import { ArrowLeft } from "iconsax-react"
import { useDispatch } from 'react-redux';
import { roleCreatedView } from '@/app/state/rolecreated/roleCreatedSlice';
import { useState } from "react";
import jwt from 'jsonwebtoken'
import { useRouter } from "next/navigation";


export default function CreateRole(){
   const [ formData, setFormData ] = useState({})
   const dispatch = useDispatch()
   const router = useRouter()

   function handleChange(event: { target: { name: any; value: any; }; }) {
      setFormData( { ...formData, [event.target.name] : event.target.value } )
   }

   async function handleSubmit(event: { preventDefault: () => void; }) {
      event.preventDefault()
      const access_token = localStorage.getItem('access_token') as string
      const user = jwt.decode(access_token)
      console.log( 'data is: ', formData)

      // Safely extract 'name' from user if possible
      const orgName = typeof user === 'object' && user !== null && 'name' in user ? (user as { name: string }).name : '';

      try {
         const req = fetch( '/api/addRoles', {
            method: "POST",
            headers: {
               "Content-Type" : "application/json"
            },
            body: JSON.stringify({ ...formData, org: orgName })
         })         

         const res = await (await req).json()
         if (res.status == 200) console.log('success');
         dispatch( roleCreatedView() )
         router.push('/em-database')
         
      } catch (error) {
         console.error(error)  
      }
   }

   return(
      <div className='bg-white m-4'>
         <div className='(crt-nav) w-full h-[4rem] flex justify-between'>
            <h1 className="my-auto mx-6 font-semibold text-xl text-gray-600">Create a role</h1>
            <a href="/em-database" className="my-auto mx-6 text-blue-800 text-sm flex">
               <ArrowLeft size={20} className="my-auto mx-1"/>
               Back to Roles & Permissions
            </a>
         </div>

         <form onSubmit={ handleSubmit }>
            <div className="flex border">
               <div className="border-r w-1/2">
                  <div className="bg-gray-50 border-b h-[3rem] flex">
                     <h1 className="my-auto mx-4 font-semibold">Role Details</h1>
                  </div>
                  <div className=" placeholder-slate-200 m-4">
                     <label htmlFor="role_name" className="flex flex-col mb-4">
                        Role Name:
                        <input onChange={ handleChange } name="role_name" type="text" className='border outline-1 outline-gray-200 rounded-[0.25rem] mt-1 font-thin px-4 py-2 pb-4' id="name" placeholder="Enter a name that represents the role's responsibilities and purpose." />
                     </label>
                     <label htmlFor="description" className="flex flex-col mb-4">
                        Role Description:
                        <input onChange={ handleChange } name="description" type="text" className='border outline-1 outline-gray-200 rounded-[0.25rem] mt-1 font-thin px-4 py-2 pb-16' id="description" placeholder="Provide a brief description outlining the role's key responsibilities and purpose." />
                     </label>
                  </div>
               </div>
               <div className="w-1/2">
                  <div className="bg-gray-50 border-b h-[3rem] flex">
                     <h1 className="my-auto mx-4 font-semibold">Permissions</h1>
                  </div>
                  <div className=" placeholder-slate-300">
                     <div className='border-b p-4'>
                        <p>Here, you can set permissions for the selected role. Define what access and actions this role can perform within the platform.</p>
                     </div>

                     <div className="border-b p-4">
                        <label className="flex">
                           <input onChange={ handleChange } name="manage_user" type="checkbox" className="h-6 w-6 mt-1 me-3" />
                           <span className="w-10/12">
                              <h1 className="text-lg">Manage User Roles</h1>
                              <p>Create, edit, and delete user roles, defining their specific permissions and responsibilities.</p>
                           </span>
                        </label>
                     </div>

                     <div className="border-b p-4 flex flex-col">
                        <label className="flex">
                           <input onChange={ handleChange } name="access_em" type="checkbox" className="h-6 w-6 mt-1 me-3" />
                           <span className="w-10/12">
                              <h1 className="text-lg">Access Employee Data</h1>
                              <p>View and edit the details of employees.</p>
                           </span>
                        </label>
                        <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                           <label className="flex me-4">
                              <input onChange={ handleChange } name="ae_all" type="checkbox" className="me-1" />
                              <span>All Employees</span>
                           </label>     
                           <label className="flex me-4">
                              <input onChange={ handleChange } name="ae_sub" type="checkbox" className="me-1" />
                              <span>Subordinates</span>
                           </label>     
                           <label className="flex me-4">
                              <input onChange={ handleChange } name="ae_sel" type="checkbox" className="me-1" />
                              <span>Selected Employees</span>
                           </label>     
                        </div>
                     </div>

                     <div className="border-b p-4 flex flex-col">
                        <label className="flex">
                           <input onChange={ handleChange } name="define_performance" type="checkbox" className="h-6 w-6 mt-1 me-3" />
                           <span className="w-10/12">
                              <h1 className="text-lg">Define Performance Metrics</h1>
                              <p>View and edit the performance metrics of employees.</p>
                           </span>
                        </label>
                        <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                           <label className="flex me-4">
                              <input onChange={ handleChange } name="dp_all" type="checkbox" className="me-1" />
                              <span>All Employees</span>
                           </label>     
                           <label className="flex me-4">
                              <input onChange={ handleChange } name="dp_sub" type="checkbox" className="me-1" />
                              <span>Subordinates</span>
                           </label>     
                           <label className="flex me-4">
                              <input onChange={ handleChange } name="dp_sel" type="checkbox" className="me-1" />
                              <span>Selected Employees</span>
                           </label>     
                        </div>
                     </div>

                     <div className="border-b p-4 flex flex-col">
                        <label className="flex">
                           <input onChange={ handleChange } name="access_hierachy" type="checkbox" className="h-6 w-6 mt-1 me-3" />
                           <span className="w-10/12">
                              <h1 className="text-lg">Access Reporting Hierachy</h1>
                              <p>Define and modify the organizational reporting structure, assigning managers to employees and creating teams.</p>
                           </span>
                        </label>
                     </div>

                     <div className="border-b p-4 flex flex-col">
                        <label className="flex">
                           <input onChange={ handleChange } name="manage_review" type="checkbox" className="h-6 w-6 mt-1 me-3" />
                           <span className="w-10/12">
                              <h1 className="text-lg">Manage Performance Reviews</h1>
                              <p>Schedule, modify, or cancel performance review meetings for any employee.</p>
                           </span>
                        </label>
                        <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                           <label className="flex me-4">
                              <input onChange={ handleChange } name="mr_all" type="checkbox" className="me-1" />
                              <span>All Employees</span>
                           </label>     
                           <label className="flex me-4">
                              <input onChange={ handleChange } name="mr_sub" type="checkbox" className="me-1" />
                              <span>Subordinates</span>
                           </label>     
                           <label className="flex me-4">
                              <input onChange={ handleChange } name="mr_sel" type="checkbox" className="me-1" />
                              <span>Selected Employees</span>
                           </label>     
                        </div>
                     </div>

                  </div>
               </div>
            </div>

            <div className="flex flex-col">
               <div className="border-r w-1/2 me-auto">
                  <div className="bg-gray-50 border-b h-[3rem] flex">
                     <h1 className="my-auto mx-4 font-semibold">Reporting Hierachy</h1>
                  </div>
                  <div className='m-4'>
                     <p>{`Here, you can define who a specific role reports to within the organization. Choose the supervisory role that oversees the position you're creating or editing.`}</p>
                     <label htmlFor="" className="flex my-8">
                        <span className="my-auto">Reporting to:</span>
                        <select name="" id="" className='p-4 mx-2 border rounded-sm'>
                           <option value="super-admin">Super Admin</option>
                           <option value="admin">Admin</option>
                        </select>
                     </label>                  
                  </div>

               </div>
               <div className='flex justify-center my-6 w-full'>
                  <input type="submit" className='bg-pes text-white px-32 py-3 rounded-sm' value={ 'Create role' }/>
               </div>
            </div>            
         </form>

      </div>
   )
}
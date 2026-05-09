'use client'
import ProfileChunk from './Profilechunk'


export default function Profile(){

   return(
      <div className='flex flex-col m-8 p-8 bg-white'>
         <div className="goals flex justify-between py-2">
            <h1 className="text-2xl font-bold my-auto">Employee profile</h1>
         </div>
         
         <div className="bg-gray-50 h-[3rem] flex justify-between">
            <h1 className="my-auto mx-6 font-semibold">Employee details</h1>
         </div>  

         <ProfileChunk />                      

         <div className="flex border">
            <div className="border-r w-1/2">
               <div className="bg-gray-50 border-b h-[3rem] flex">
                  <h1 className="my-auto mx-4 font-semibold">Reporting Hierachy</h1>
               </div>
               
               <p className='p-4'>The 'Reporting Hierarchy' section shows the existing reporting structure for this employee. This hierarchy has been set according to their role and reporting relationships within the organization.</p>

               <form className=" placeholder-slate-200 m-4">
                  <label htmlFor="description" className="flex">
                     Reporting to:
                     <input disabled type="text" className='border outline-1 outline-gray-200 rounded-[0.25rem] mt-1 font-thin px-4 py-2 pb-16' id="description" placeholder="Provide a brief description outlining the role's key responsibilities and purpose." />
                  </label>
               </form>
            </div>

            <div className="w-1/2">
               <div className="bg-gray-50 border-b h-[3rem] flex">
                  <h1 className="my-auto mx-4 font-semibold">Permission Settings</h1>
               </div>

               <form className=" placeholder-slate-300">
                  <div className='border-b p-4'>
                     <p>The 'Permission Settings' section displays the current access and responsibilities assigned to this employee. These settings have been configured based on their role and responsibilities within the organization.</p>
                  </div>

                  <div className="border-b p-4">
                     <label className="flex">
                        <input disabled type="checkbox" checked className="h-6 w-6 mt-1 me-3" />
                        <span className="w-10/12">
                           <h1 className="text-lg">Manage User Roles</h1>
                           <p>Create, edit, and delete user roles, defining their specific permissions and responsibilities.</p>
                        </span>
                     </label>
                  </div>

                  <div className="border-b p-4 flex flex-col">
                     <label className="flex">
                        <input disabled type="checkbox" checked className="h-6 w-6 mt-1 me-3" />
                        <span className="w-10/12">
                           <h1 className="text-lg">Access Employee Data</h1>
                           <p>View and edit the details of employees.</p>
                        </span>
                     </label>
                     <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                        <label className="flex me-4">
                           <input disabled type="checkbox" className="me-1" />
                           <span>All Employees</span>
                        </label>     
                        <label className="flex me-4">
                           <input disabled type="checkbox" checked className="me-1" />
                           <span>Subordinates</span>
                        </label>     
                        <label className="flex me-4">
                           <input disabled type="checkbox" className="me-1" />
                           <span>Selected Employees</span>
                        </label>     
                     </div>
                  </div>

                  <div className="border-b p-4 flex flex-col">
                     <label className="flex">
                        <input type="checkbox" checked className="h-6 w-6 mt-1 me-3" />
                        <span className="w-10/12">
                           <h1 className="text-lg">Define Performance Metrics</h1>
                           <p>View and edit the performance metrics of employees.</p>
                        </span>
                     </label>
                     <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                        <label className="flex me-4">
                           <input type="checkbox" className="me-1" />
                           <span>All Employees</span>
                        </label>     
                        <label className="flex me-4">
                           <input type="checkbox" checked className="me-1" />
                           <span>Subordinates</span>
                        </label>     
                        <label className="flex me-4">
                           <input type="checkbox" className="me-1" />
                           <span>Selected Employees</span>
                        </label>     
                     </div>
                  </div>

                  <div className="border-b p-4 flex flex-col">
                     <label className="flex">
                        <input type="checkbox" checked className="h-6 w-6 mt-1 me-3" />
                        <span className="w-10/12">
                           <h1 className="text-lg">Access Reporting Hierachy</h1>
                           <p>Define and modify the organizational reporting structure, assigning managers to employees and creating teams.</p>
                        </span>
                     </label>
                  </div>

                  <div className="border-b p-4 flex flex-col">
                     <label className="flex">
                        <input type="checkbox" checked className="h-6 w-6 mt-1 me-3" />
                        <span className="w-10/12">
                           <h1 className="text-lg">Manage Performance Reviews</h1>
                           <p>Schedule, modify, or cancel performance review meetings for any employee.</p>
                        </span>
                     </label>
                     <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                        <label className="flex me-4">
                           <input type="checkbox" className="me-1" />
                           <span>All Employees</span>
                        </label>     
                        <label className="flex me-4">
                           <input type="checkbox" checked className="me-1" />
                           <span>Subordinates</span>
                        </label>     
                        <label className="flex me-4">
                           <input type="checkbox" className="me-1" />
                           <span>Selected Employees</span>
                        </label>     
                     </div>
                  </div>

               </form>
            </div>
         </div>
      </div>
   )
}
'use client'
import { useEffect } from "react";
import { Dispatch, SetStateAction } from "react";

interface FormProps {
  formdata: any;
  updateFields: (fields: Record<string, any>) => void;
  setStepValid: Dispatch<SetStateAction<boolean>>;
}

export default function Formtwo({ formdata, updateFields, setStepValid }: FormProps){
   const required = ["name", "email"];

   useEffect(() => {
      const allFilled = required.every(field => formdata[field]?.trim());
      setStepValid(allFilled);
   }, [formdata]);

   return(
      <>
         <div className="w-full">
            <p className="my-2 mx-8">{ `You are currently viewing the pre-set Reporting Hierarchy for the employee’s role. Click 'Edit Reporting Hierarchy' to customize the structure according to your organization's needs.` }</p>
         </div>

         <div className="grid grid-cols-2 m-4">
            <div className="border-b border-e p-4 flex flex-col">
               <label className="flex">
                  <input name="manage_user" checked={formdata.manage_user === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="h-6 w-6 mt-1 me-3" />
                  <span className="w-10/12">
                     <h1 className="text-lg">Manage User Roles</h1>
                     <p>Create, Edit, and Delete User roles.</p>
                  </span>
               </label>
            </div>

            <div className="border-b border-e p-4 flex flex-col">
               <label className="flex">
                  <input name="access_em" checked={formdata.access_em === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="h-6 w-6 mt-1 me-3" />
                  <span className="w-10/12">
                     <h1 className="text-lg">Access Employee Data</h1>
                     <p>View and edit the details of employees.</p>
                  </span>
               </label>
               <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                  <label className="flex me-4">
                     <input name="ae_all" checked={formdata.ae_all === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="me-1" />
                     <span>All Employees</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="ae_sub" checked={formdata.ae_sub === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="me-1" />
                     <span>Subordinates</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="ae_sel" checked={formdata.ae_sel === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="me-1" />
                     <span>Selected Employees</span>
                  </label>     
               </div>
            </div>

            <div className="border-b border-e p-4 flex flex-col">
               <label className="flex">
                  <input name="define_performance" checked={formdata.define_performance === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="h-6 w-6 mt-1 me-3" />
                  <span className="w-10/12">
                     <h1 className="text-lg">Define Performance Metrics</h1>
                     <p>View and edit the Performance Metrics of employees.</p>
                  </span>
               </label>
               <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                  <label className="flex me-4">
                     <input name="dp_all" checked={formdata.dp_all === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="me-1" />
                     <span>All Employees</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="dp_sub" checked={formdata.dp_sub === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="me-1" />
                     <span>Subordinates</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="dp_sel" checked={formdata.dp_sel === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="me-1" />
                     <span>Selected Employees</span>
                  </label>     
               </div>
            </div>

            <div className="border-b border-e p-4 flex flex-col">
               <label className="flex">
                  <input name="access_hierachy" checked={formdata.access_hierachy === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="h-6 w-6 mt-1 me-3" />
                  <span className="w-10/12">
                     <h1 className="text-lg">Access Reporting Hierarchy</h1>
                     <p>Define and modify the organizational reporting structure. Assigning managers to employees and creating teams</p>
                  </span>
               </label>
            </div>

            <div className="border-b border-e p-4 flex flex-col">
               <label className="flex">
                  <input name="manage_review" checked={formdata.manage_review === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="h-6 w-6 mt-1 me-3" />
                  <span className="w-10/12">
                     <h1 className="text-lg">Manage Performance Reviews</h1>
                     <p>Schedule, modify or cancel performance review meetings for any employee</p>
                  </span>
               </label>
               <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                  <label className="flex me-4">
                     <input name="mr_all" checked={formdata.mr_all === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="me-1" />
                     <span>All Employees</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="mr_sub" checked={formdata.mr_sub === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="me-1" />
                     <span>Subordinates</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="mr_sel" checked={formdata.mr_sel === 'on'} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked ? 'on' : '' }) } type="checkbox" className="me-1" />
                     <span>Selected Employees</span>
                  </label>     
               </div>
            </div>
         </div>
      </>
   )
}
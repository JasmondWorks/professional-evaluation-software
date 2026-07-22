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
                  <input name="can_manage_user_roles" checked={formdata.can_manage_user_roles === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="h-6 w-6 mt-1 me-3" />
                  <span className="w-10/12">
                     <h1 className="text-lg">Manage User Roles</h1>
                     <p>Create, Edit, and Delete User roles.</p>
                  </span>
               </label>
            </div>

            <div className="border-b border-e p-4 flex flex-col">
               <label className="flex">
                  <input name="can_access_employee_data" checked={formdata.can_access_employee_data === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="h-6 w-6 mt-1 me-3" />
                  <span className="w-10/12">
                     <h1 className="text-lg">Access Employee Data</h1>
                     <p>View and edit the details of employees.</p>
                  </span>
               </label>
               <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                  <label className="flex me-4">
                     <input name="access_employee_all" checked={formdata.access_employee_all === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="me-1" />
                     <span>All Employees</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="access_employee_subordinates" checked={formdata.access_employee_subordinates === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="me-1" />
                     <span>Subordinates</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="access_employee_selected" checked={formdata.access_employee_selected === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="me-1" />
                     <span>Selected Employees</span>
                  </label>     
               </div>
            </div>

            <div className="border-b border-e p-4 flex flex-col">
               <label className="flex">
                  <input name="can_define_performance_metrics" checked={formdata.can_define_performance_metrics === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="h-6 w-6 mt-1 me-3" />
                  <span className="w-10/12">
                     <h1 className="text-lg">Define Performance Metrics</h1>
                     <p>View and edit the Performance Metrics of employees.</p>
                  </span>
               </label>
               <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                  <label className="flex me-4">
                     <input name="define_performance_all" checked={formdata.define_performance_all === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="me-1" />
                     <span>All Employees</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="define_performance_subordinates" checked={formdata.define_performance_subordinates === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="me-1" />
                     <span>Subordinates</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="define_performance_selected" checked={formdata.define_performance_selected === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="me-1" />
                     <span>Selected Employees</span>
                  </label>     
               </div>
            </div>

            <div className="border-b border-e p-4 flex flex-col">
               <label className="flex">
                  <input name="can_access_reporting_hierarchy" checked={formdata.can_access_reporting_hierarchy === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="h-6 w-6 mt-1 me-3" />
                  <span className="w-10/12">
                     <h1 className="text-lg">Access Reporting Hierarchy</h1>
                     <p>Define and modify the organizational reporting structure. Assigning managers to employees and creating teams</p>
                  </span>
               </label>
            </div>

            <div className="border-b border-e p-4 flex flex-col">
               <label className="flex">
                  <input name="can_manage_performance_reviews" checked={formdata.can_manage_performance_reviews === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="h-6 w-6 mt-1 me-3" />
                  <span className="w-10/12">
                     <h1 className="text-lg">Manage Performance Reviews</h1>
                     <p>Schedule, modify or cancel performance review meetings for any employee</p>
                  </span>
               </label>
               <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                  <label className="flex me-4">
                     <input name="manage_reviews_all" checked={formdata.manage_reviews_all === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="me-1" />
                     <span>All Employees</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="manage_reviews_subordinates" checked={formdata.manage_reviews_subordinates === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="me-1" />
                     <span>Subordinates</span>
                  </label>     
                  <label className="flex me-4">
                     <input name="manage_reviews_selected" checked={formdata.manage_reviews_selected === true} onChange={ (event) => updateFields({...formdata, [event?.target.name]: event.target.checked }) } type="checkbox" className="me-1" />
                     <span>Selected Employees</span>
                  </label>     
               </div>
            </div>
         </div>
      </>
   )
}
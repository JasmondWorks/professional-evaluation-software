'use client'
import { useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import PermissionSelector from "@/app/components/ui/PermissionSelector";

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

         <div className="m-4 border rounded-md">
            <PermissionSelector
               value={formdata}
               onChange={(patch) => updateFields(patch)}
            />
         </div>
      </>
   )
}
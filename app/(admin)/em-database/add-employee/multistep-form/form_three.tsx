'use client'

import { ArrowLeft } from "iconsax-react"
import { useDispatch } from 'react-redux';
import { roleCreatedView } from '@/app/state/rolecreated/roleCreatedSlice';

type FormProps = {
   formdata: Record<string, any>;
   setFormdata: (data: Record<string, any>) => void;
};

export default function Formthree({ formdata, setFormdata }: FormProps){
   const dispatch = useDispatch()

   return(
      <>
         <div className="w-full">
            <p className="my-2 mx-8">{ `You are currently viewing the pre-set Reporting Hierarchy for the`} employee’s role. {`Click 'Edit Reporting Hierarchy' to customize the structure according to your organization's needs.` }</p>
         </div>
         
      </>
   )
}
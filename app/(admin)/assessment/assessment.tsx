'use client'

import { useDispatch } from 'react-redux';
import { setNotificationView } from '@/app/state/setnotification/setNotificationSlice';
import { Warning2, ArrowRight } from 'iconsax-react'
import Dept from '@/app/components/assessment/Dept';
import { useEffect, useState } from 'react';


   type Stats = {
      pesuser_nameCount?: number;
      organizationCount?: number;
      [key: string]: any;
   };

const isLoading = true;

export default function Assesment(){
   const dispatch = useDispatch()
   const [data, setData] = useState(false)
   const [loading, setLoading] = useState(isLoading)
   const [assessmentData, setAssessmentData] = useState<any[]>([])
   const [stats, setStats] = useState<Stats | null>(null)


   useEffect(() => {
      fetch('/api/getStats')
         .then(response => response.json())
         .then(data => {
            setStats(data)
         })
         .catch(error => {
            // handle error if needed
            console.error('Error fetching stats:', error);
         });
   }, [])

   useEffect(() => { 
      fetch('/api/getDataEntry')
      .then(response => response.json())
      .then(data => {
         setAssessmentData(data)
         setData(true)
         setLoading(false)
         console.log('data', data)
      })
      .catch(error => console.log('noooo'))
   }, [])

   return(
      <main className="m-6 h-full">
         <div className="assessment bg-white flex justify-between p-4 border-b border-gray-100">
            <h1 className="text-2xl font-bold my-auto">Assessment</h1>
            <h1 className="text-pes my-auto">View Past Appraisal Results</h1>
         </div>
         
         <div className={`flex flex-col bg-white min-h-full mb-2`}>

         {
            data ? 
            <>
               <div className='bg-white flex justify-between max-md:gap-2 max-sm:flex-col p-4 mb-2 border-b border-gray-100'>
                  <div className='bg-[#9E740011] border text-[#9E7400] border-[#9E7400] flex justify-center rounded-lg p-4 w-3/5 max-sm:w-full'>
                     <Warning2 />
                     <p className='text-gray-500 w-11/12 ms-3'>
                        {
                           `
                              We have received data entries from ${ stats?.pesuser_nameCount || 0} employees across ${stats?.organizationCount || 0} departments, 
                              and they are now ready for assessment. 
                              You can proceed to assess their performance departmentally or assess all employees at once.                           
                           `
                        }
                     </p>

                  </div>

                  <div className='flex flex-col justify-center max-sm:self-end'>
                     <a role='button' className='flex text-white h-fit w-fit bg-pes border border-pes rounded-md py-3 px-8'>
                        Assess All Employees
                        <ArrowRight />
                     </a>                     
                  </div>

               </div>
               {
                  assessmentData?.map((i, key) => {
                     return(
                        <Dept key={key} data={i} />                 
                     )
                  })
               }
            </>
            :
            <>
               {
                  loading?
                     <div className="flex flex-col w-3/5 m-auto">
                        <div className='flex justify-center w-[180px] py-10 my-2 mx-auto'>
                           <img src={`/loading.svg`} className='animate-spin' width={40}/>                              
                        </div>

                        <p className="mx-auto text-center text-sm text-gray-500 font-light">
                           Loading assessment data, please wait...
                        </p>  
                     </div>  
                  :
                     <div className="flex flex-col w-3/5 m-auto">
                        <p className="mx-auto text-center text-sm text-gray-500 font-light">
                           No data available for assessment at the moment. 
                           You can kickstart the assessment process by notifying your employees to input their data. 
                           Set a deadline to ensure everyone contributes to the assessment.
                        </p>  
                        <a role="button" className="bg-pes py-3 my-4 px-20 rounded-md text-white new mx-auto" onClick={ () => dispatch( setNotificationView() ) }>
                           Send Notifications
                        </a>              
                     </div>               
               }            
            </>


         }
         </div>
      </main>
   )
}
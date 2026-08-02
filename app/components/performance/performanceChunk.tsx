import { useEffect, useState } from "react"
import { ArrowUp, ArrowDown } from 'iconsax-react';
import { getAccessToken } from "@/app/utils/auth"
import { apiFetch } from '@/app/utils/apiFetch';
import Skeleton from '../ui/Skeleton';

type userData = {
   id: number
   dept: string
   type: string
   yield: string
   user_id:string
}

export default function Performance({ view = "employee" }: { view?: string }) {
   const [performance, setPerformance] = useState<{ goodPerformance: userData[] | null, badPerformance: userData[] | null }>({ goodPerformance: null, badPerformance: null })
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState('')

   async function getPerformance(){
      try {
         setLoading(true);
         const access_token = getAccessToken();
         
         if (!access_token) {
            setError('Please log in to view performance data');
            setLoading(false);
            return;
         }

         const res = await apiFetch(`/api/getUserData`, {
            method: 'POST',
            headers:{
               'Content-Type': 'application/json'
            },
            body:JSON.stringify({
               token: access_token,
               view: view
            })
         });

         if (!res.ok) {
            throw new Error('Failed to fetch performance data');
         }

         const data = await res.json();
         setPerformance(data);
      } catch (err) {
         console.error('Error fetching performance:', err);
         setError('Failed to load performance data');
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      getPerformance()
   }, [view])

   const LoadingState = () => (
      <div className="flex flex-col p-4 gap-4">
         {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col gap-4">
               <div className='w-full flex justify-between'>
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-12" />
               </div>
               <hr />
            </div>
         ))}
      </div>
   );

   const ErrorState = () => (
      <div className="p-4 m-2 bg-red-50 text-red-600 rounded-sm">
         {error}
      </div>
   );

   return(
      <>
         <p className='text-xl text-black  my-auto px-4 py-1'>Overperforming {view === "team" ? "Teams" : "Employees"}</p>
         {loading ? (
            <LoadingState />
         ) : error ? (
            <ErrorState />
         ) : !performance.goodPerformance || performance.goodPerformance.length === 0 ? (
            <div className="p-4 m-2 bg-canvas rounded-sm">No data available</div>
         ) : (
            <div className='flex flex-col p-4'>
               {performance.goodPerformance.map((i, key) => (
                  <div key={key}>
                     <div className='goal-metrics w-full flex justify-between my-4 text-sm'>
                        <p>{ view === "team" ? i.dept : i.user_id }</p>
                        <p> { view === "team" ? "" : i.dept } </p>
                        <p className={ ` text-green-500 flex` }>
                           <ArrowUp className='mt-auto font-thin'/>
                           { `${ i.yield }%` }
                        </p>        
                     </div>
                     <hr />                          
                  </div>
               ))}
            </div>                     
         )}

         <p className='text-xl text-black  my-auto px-4 py-1'>Underperforming {view === "team" ? "Teams" : "Employees"}</p>

         {loading ? (
            <LoadingState />
         ) : error ? (
            <ErrorState />
         ) : !performance.badPerformance || performance.badPerformance.length === 0 ? (
            <div className="p-4 m-2 bg-canvas rounded-sm">No data available</div>
         ) : (
            <div className="flex flex-col p-4">
               {performance.badPerformance.map((i, key) => (
                  <div key={key}>
                     <div className='goal-metrics w-full flex justify-between my-4 text-sm'>
                        <p>{ view === "team" ? i.dept : i.user_id }</p>
                        <p> { view === "team" ? "" : i.dept } </p>
                        <p className={ ` text-red-500 flex` }>
                           <ArrowDown className='mt-auto mx-1 font-thin' />
                           { `${ i.yield }%` }
                        </p>        
                     </div>
                     <hr />                          
                  </div>
               ))}
            </div>
         )}                     
      </>
   )
}
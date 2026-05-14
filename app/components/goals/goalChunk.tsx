"use client"
import { useEffect, useState } from "react"
import { getAccessToken } from "@/app/utils/auth"

export default function Goals(){
   const [goals, setGoals] = useState<any[]>([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState('')

   async function getGoals() {
      try {
         const access_token = getAccessToken();
         
         if (!access_token) {
            setError('Please log in to view goals');
            setLoading(false);
            return;
         }

         const res = await fetch(`/api/getGoals`, {
            method: 'POST',
            headers:{
               'Content-Type': 'application/json'
            },
            body:JSON.stringify({
               token: access_token
            })
         });

         if (!res.ok) {
            throw new Error('Failed to fetch goals');
         }

         const data = await res.json();
         setGoals(data);
      } catch (err) {
         console.error('Error fetching goals:', err);
         setError('Failed to load goals');
      } finally {
         setLoading(false);
      }
   }

   function colorGrade( num: any ): string{
      if( typeof(num) == 'number' ){
        return (num < 50)? 'red' : 'green';       
      }
      else if ( typeof(num) == 'string' ) return 'yellow'
      return ''
   }

   useEffect(() => {
      getGoals()
   }, [])
   
   return(
      <>
         {loading ? (
            <div className="p-4 m-2 bg-gray-50 rounded-sm flex justify-between">
               <p>Loading info....</p>
               <img src="loading.svg" alt="loading" className="h-6 w-6 animate-spin my-auto"/>
            </div>
         ) : error ? (
            <div className="p-4 m-2 bg-red-50 text-red-600 rounded-sm">
               {error}
            </div>
         ) : goals.length === 0 ? (
            <div className="p-4 m-2 bg-gray-50 rounded-sm">
               No goals found
            </div>
         ) : (
            <div className='metrics flex flex-col justify-normal p-4 py-1'>
               {goals.map((i, key) => (
                  <div key={key}>
                     <div className='goal-metrics w-full flex justify-between my-4 text-sm'>
                        <p>{ i.name }</p>
                        <p className={ ` text-${ colorGrade(i.status) }-500 ` }> 
                           { typeof( i.status ) == 'string'? `${ i.status }` : `${ i.status }% Completed` } 
                        </p>
                        <p className={ ` text-${ colorGrade(i.daysleft) }-500 ` }>
                           { `${ i.daysleft } days left` }
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
"use client"
import { useEffect, useState } from "react"
import { getAccessToken } from "@/app/utils/auth"

export default function Goals({
   onGoalsLoaded,
}: {
   onGoalsLoaded?: (goals: any[]) => void
} = {}){
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
         const list = Array.isArray(data) ? data : [];
         setGoals(list);
         onGoalsLoaded?.(list);
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

   // Whole days between now and the goal's due_date (null when no/invalid date).
   function daysLeft( due: any ): number | null {
      if ( !due ) return null
      const d = new Date(due)
      if ( isNaN(d.getTime()) ) return null
      return Math.ceil(( d.getTime() - Date.now() ) / ( 1000 * 60 * 60 * 24 ))
   }

   function daysLeftLabel( due: any ): string {
      const dl = daysLeft(due)
      if ( dl === null ) return 'No due date'
      if ( dl < 0 ) return `Overdue by ${Math.abs(dl)} day${Math.abs(dl) === 1 ? '' : 's'}`
      if ( dl === 0 ) return 'Due today'
      return `${dl} day${dl === 1 ? '' : 's'} left`
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
                        <p className={ ` text-${ (daysLeft(i.due_date) ?? 0) < 3 ? 'red' : 'green' }-500 ` }>
                           { daysLeftLabel(i.due_date) }
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
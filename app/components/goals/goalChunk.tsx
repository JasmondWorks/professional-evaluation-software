"use client"
import { useEffect, useState } from "react"
import { getAccessToken } from "@/app/utils/auth"
import { apiFetch } from '@/app/utils/apiFetch';
import Skeleton from '../ui/Skeleton';

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

         const res = await apiFetch(`/api/getGoals`, {
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

   // Returns a full static Tailwind class (dynamic `text-${x}-500` doesn't render
   // under Tailwind v4's on-demand generation).
   function colorGrade( num: any ): string{
      if( typeof(num) == 'number' ){
        return (num < 50)? 'text-danger-600' : 'text-success-600';
      }
      else if ( typeof(num) == 'string' ) return 'text-warning-600'
      return 'text-muted'
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
            <div className='metrics flex flex-col justify-normal p-4 py-1 gap-4 mt-2'>
               {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-4">
                     <div className='w-full grid grid-cols-3 gap-4'>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                     </div>
                     <hr />
                  </div>
               ))}
            </div>
         ) : error ? (
            <div className="p-4 m-2 bg-danger-50 text-danger-600 rounded-sm">
               {error}
            </div>
         ) : goals.length === 0 ? (
            <div className="p-4 m-2 bg-canvas rounded-sm">
               No goals found
            </div>
         ) : (
            <div className='metrics flex flex-col justify-normal p-4 py-1'>
               {goals.map((i, key) => (
                  <div key={key}>
                     <div className='goal-metrics w-full grid grid-cols-3 gap-4 items-center my-4 text-sm text-left'>
                        <p>{ i.name }</p>
                        <p className={ colorGrade(i.status) }>
                           { typeof( i.status ) == 'string'? `${ i.status }` : `${ i.status }% Completed` }
                        </p>
                        <p className={ (daysLeft(i.due_date) ?? 0) < 3 ? 'text-danger-600' : 'text-success-600' }>
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
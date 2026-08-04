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
      <div className="p-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-sm" role="alert">
         {error}
      </div>
   );

   const NoData = () => (
      <div className="px-3 py-6 text-center text-sm text-muted">No data available</div>
   );

   const Rows = ({ rows, positive }: { rows: userData[]; positive: boolean }) => (
      <div className="flex flex-col divide-y divide-line">
         {rows.map((i, key) => (
            <div key={key} className="flex items-center justify-between gap-3 py-2.5 text-sm">
               <span className="font-medium text-strong truncate">{view === "team" ? i.dept : i.user_id}</span>
               <span className="text-muted truncate flex-1 text-center">{view === "team" ? "" : i.dept}</span>
               <span className={`flex items-center gap-0.5 font-semibold tabular-nums shrink-0 ${positive ? "text-success-700" : "text-danger-600"}`}>
                  {positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {`${i.yield}%`}
               </span>
            </div>
         ))}
      </div>
   );

   return (
      <div className="flex flex-col gap-5">
         <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
               Overperforming {view === "team" ? "teams" : "employees"}
            </h3>
            {loading ? <LoadingState /> : error ? <ErrorState /> :
               !performance.goodPerformance?.length ? <NoData /> :
               <Rows rows={performance.goodPerformance} positive />}
         </section>

         <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
               Underperforming {view === "team" ? "teams" : "employees"}
            </h3>
            {loading ? <LoadingState /> : error ? <ErrorState /> :
               !performance.badPerformance?.length ? <NoData /> :
               <Rows rows={performance.badPerformance} positive={false} />}
         </section>
      </div>
   )
}
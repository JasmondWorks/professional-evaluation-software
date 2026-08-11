'use client'
import React, { useState } from 'react'
import DataField from './ui/DataField'
import { titleCase, formatDate } from '@/lib/utils'
import Skeleton from './ui/Skeleton';
import { Alert } from './ui';
import UserAvatar from './ui/UserAvatar';
import AvatarUploader from './AvatarUploader';
import { useCurrentUser } from './useCurrentUser';

/** `editable` adds the photo controls. The profile page passes it; the dashboard
 *  shows the same details read-only. */
export default function ProfileChunk({ editable = false }: { editable?: boolean } = {}){
   const [ expanded, setExpanded ] = useState(false)
   // One shared record across the topbar, sidebar, dashboard and this block, so
   // a new photo appears everywhere at once.
   const { user, loading, error } = useCurrentUser()

   const TextFallback = () => (
      <div className="my-2 flex flex-col">
         <Skeleton className="w-24 h-3 my-1 rounded-full" />
         <Skeleton className="w-40 h-4 my-1 rounded-full" />
      </div>
   );


   // The error state existed but was never rendered, so a failed load looked
   // identical to a record with every field empty.
   if (!loading && error) {
      return (
         <Alert tone="danger">
            Your details could not be loaded. Refresh the page, and if it keeps happening
            sign out and back in.
         </Alert>
      );
   }

   const field = (label: string, value: string) =>
      loading ? <TextFallback /> : <DataField label={label} value={value} />;

   return(
      <div className="details">
         <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0">
               {loading ? (
                  <Skeleton className="h-32 w-32 rounded-xl sm:h-40 sm:w-40" />
               ) : editable ? (
                  <AvatarUploader name={user?.name} image={user?.image} />
               ) : (
                  <UserAvatar name={user?.name} image={user?.image} size="xl" rounded="xl" />
               )}
            </div>

            {/* Two columns on wide screens, one on narrow. The right column
                previously carried a 30rem minimum, which forced the row wider
                than the phone viewport. */}
            <div className="grid min-w-0 flex-1 gap-x-8 gap-y-1 sm:grid-cols-2">
               {field('Name', titleCase(user?.name || ''))}
               {field('Email', user?.email?.toLowerCase() || '')}
               {field('Functional GSM', user?.gsm || '')}
               {field('Present role', titleCase(user?.display_role || user?.role || ''))}
               {field('Current home address', titleCase(user?.address || ''))}
               {field('Faculty/college', titleCase(user?.faculty_college || ''))}
            </div>
         </div>

         {expanded ? (
            <div className='mt-6 border-t border-line pt-6'>
               <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
                  {field('Date of birth', formatDate(user?.dob || ''))}
                  {field('Date of first appointment', formatDate(user?.doa || ''))}
                  {field('Post/grade of first appointment', titleCase(user?.poa || ''))}
                  {field('Date of confirmation', formatDate(user?.doc || ''))}
                  {field('Present post', titleCase(user?.post || ''))}
                  {field('Date appointed to present post', formatDate(user?.dopp || ''))}
                  {field('Current level/step', user?.level || '')}
               </div>

               <div className="mt-4">
                  <p className="text-muted">Academic certification:</p>
                  <p className="font-semibold text-lg text-muted">Not recorded</p>
               </div>
            </div>
         ) : null}

         <div className='mt-4 flex justify-end'>
            <button
               type="button"
               onClick={() => setExpanded(prev => !prev)}
               aria-expanded={expanded}
               className="rounded-lg px-2 py-1 text-sm font-medium text-pes underline underline-offset-2 transition-colors hover:text-pes-800 focus:outline-none focus-visible:shadow-focus"
            >
               {expanded ? 'See less' : 'See more'}
            </button>
         </div>
      </div>
   )
}

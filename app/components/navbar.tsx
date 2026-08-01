"use client"

import { SearchNormal, Notification, HambergerMenu } from 'iconsax-react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationView } from '@/app/state/notification/notificationSlice';
import { actionView } from "@/app/state/action/actionSlice";
import jwt from 'jsonwebtoken'
import { RootState } from '@/app/state/store'
import { useEffect, useState } from 'react';
import LoadingButton from './ui/LoadingButton';
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';

export default function Navbar({ is_sidebar_active, handleSideBar }: 
   { is_sidebar_active: any, handleSideBar: any }): JSX.Element {
   const dispatch = useDispatch()
   const [user, setUser] = useState<jwt.JwtPayload | string | null>(null)
   const [unreadCount, setUnreadCount] = useState<number>(0)

   useEffect(() => {
      // SSR safety check
      if (typeof window !== 'undefined') {
         const access_token = getAccessToken();
         
         if (access_token && access_token !== 'undefined' && access_token !== 'null') {
            try {
               const decoded = jwt.decode(access_token);
               setUser(decoded);

               // Fetch unread notifications count
               if (decoded && typeof decoded === 'object' && 'org' in decoded) {
                  apiFetch(`/api/notifications`, {
                     method: 'GET',
                     headers: {
                        'Authorization': `Bearer ${access_token}`,
                     },
                  })
                     .then(res => {
                        if (!res.ok) throw new Error('Failed to fetch notifications');
                        return res.json();
                     })
                     .then(data => {
                        if (data.notifications) {
                           const unread = data.notifications.filter((n: any) => !n.is_read).length;
                           setUnreadCount(unread);
                        }
                     })
                     .catch(err => console.error("Failed to fetch notifications", err));
               }
            } catch (err) {
               console.error("Token decode error:", err);
            }
         }
      }
   }, [])

   return (
      <div className="nav w-full h-20 bg z-10 sticky">
         <div className="flex justify-between bg-white w-full h-full p-5 max-md:py-5">
            
            {/* Sidebar Toggle */}
            <div className={`hover:bg-gray-200 rounded-lg top-[20px] lg:hidden`} >
               <LoadingButton className={`block`} onClick={() => handleSideBar()}>
                  <HambergerMenu size={40} color={"black"} />
               </LoadingButton>
            </div>

            {/* Search */}
            {/* <div className="search relative h-fit max-lg:w-full">
               <SearchNormal className='text-gray-300 absolute top-1/2 left-8 -translate-y-1/2'/>
               <input type='text' name='search' className=' ms-2 py-3 px-16 text-sm border w-full focus:outline-blue-800 rounded-xl' placeholder='Search anything' />
            </div> */}

            {/* Profile + Notifications */}
            <div className="profile ms-auto flex my-auto mx-4 max-md:ml-2 max-md:mr-2">
               <div className="notification relative my-auto mx-2 text-gray-400 cursor-pointer">
                  <Notification size={28} onClick={() => dispatch(notificationView())} />
                  {unreadCount > 0 && (
                     <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                     </span>
                  )}
               </div>

               <div className="image flex justify-between text-gray-600 hover:underline" onClick={() => dispatch(actionView())}>
                  <div className='mx-2 rounded-full w-10 h-10 bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm overflow-hidden'>
                     {typeof user === 'object' && user !== null && 'name' in user
                        ? (user.name as string).charAt(0).toUpperCase()
                        : '?'}
                  </div>
                  <p className='mx-2 max-sm:hidden my-auto cursor-pointer'>
                     {typeof user === 'object' && user !== null && 'name' in user ? user.name as string : ''}
                  </p>
               </div>
            </div>            
         </div>
      </div>
   )
}

"use client"

import { Notification, HambergerMenu } from 'iconsax-react';
import { useDispatch } from 'react-redux';
import { notificationView } from '@/app/state/notification/notificationSlice';
import { actionView } from "@/app/state/action/actionSlice";
import jwt from 'jsonwebtoken'
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

   const name = typeof user === 'object' && user !== null && 'name' in user ? (user.name as string) : '';

   return (
      <header className="sticky top-0 z-10 h-16 bg-surface/85 backdrop-blur-md border-b border-line">
         <div className="flex items-center gap-3 h-full px-4 sm:px-6">

            {/* Mobile sidebar toggle */}
            <LoadingButton
               className="lg:hidden -ml-1 p-2 rounded-lg text-body hover:bg-line/60 transition-colors"
               onClick={() => handleSideBar()}
            >
               <HambergerMenu size={24} color="currentColor" />
            </LoadingButton>

            {/* Spacer pushes actions to the right */}
            <div className="flex-1" />

            {/* Notifications */}
            <button
               type="button"
               aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
               onClick={() => dispatch(notificationView())}
               className="relative p-2 rounded-lg text-body hover:bg-line/60 hover:text-strong transition-colors"
            >
               <Notification size={22} color="currentColor" />
               {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-danger-600 text-white text-[10px] font-semibold rounded-full grid place-items-center leading-none">
                     {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
               )}
            </button>

            {/* Profile */}
            <button
               type="button"
               onClick={() => dispatch(actionView())}
               className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg hover:bg-line/60 transition-colors"
            >
               <span className="w-8 h-8 rounded-full bg-pes-100 text-pes-700 grid place-items-center text-sm font-semibold overflow-hidden">
                  {name ? name.charAt(0).toUpperCase() : '?'}
               </span>
               <span className="hidden sm:block text-sm font-medium text-strong max-w-[12rem] truncate">
                  {name}
               </span>
            </button>
         </div>
      </header>
   )
}

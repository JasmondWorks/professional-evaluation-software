"use client"

import Image from 'next/image'
import { SearchNormal, Notification, HambergerMenu } from 'iconsax-react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationView } from '@/app/state/notification/notificationSlice';
import { actionView } from "@/app/state/action/actionSlice";
import jwt from 'jsonwebtoken'
import { RootState } from '@/app/state/store'
import { useEffect, useState } from 'react';
import LoadingButton from './ui/LoadingButton';

export default function Navbar({ is_sidebar_active, handleSideBar }: 
   { is_sidebar_active: any, handleSideBar: any }): JSX.Element {
   const dispatch = useDispatch()
   const [user, setUser] = useState<jwt.JwtPayload | string | null>(null)
   const [unreadCount, setUnreadCount] = useState<number>(0)

   useEffect(() => {
      const access_token = localStorage.getItem('access_token') as string
      if (access_token) {
         const decoded = jwt.decode(access_token);
         console.log(decoded);
         setUser(decoded);

         // 🔑 fetch unread notifications count
         fetch(`/api/notifications`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ org: (decoded as any)?.org }),
         })
            .then(res => res.json())
            .then(data => {
               if (data.notifications) {
                  const unread = data.notifications.filter((n: any) => !n.is_read).length;
                  setUnreadCount(unread);
               }
            })
            .catch(err => console.error("Failed to fetch notifications", err));
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
                  <Image src={'/young oti.PNG'} alt='profile image' width={40} height={0} className='mx-2 rounded-full'/>
                  <p className='mx-2 max-sm:hidden my-auto cursor-pointer'>
                     {typeof user === 'object' && user !== null && 'name' in user ? user.name as string : ''}
                  </p>
               </div>
            </div>            
         </div>
      </div>
   )
}

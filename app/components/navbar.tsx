"use client"

import { Notification, HambergerMenu, InfoCircle, Logout, ProfileCircle } from 'iconsax-react';
import jwt from 'jsonwebtoken'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingButton from './ui/LoadingButton';
import { getAccessToken, removeAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import { formatRelativeTime } from '@/lib/utils';
import {
   DropdownMenu,
   DropdownMenuTrigger,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
} from './ui/dropdown-menu';

type Notif = { id: number; title: string; message: string; is_read: boolean; created_at: string };

export default function Navbar({ is_sidebar_active, handleSideBar }:
   { is_sidebar_active: any, handleSideBar: any }): JSX.Element {
   const router = useRouter()
   const [user, setUser] = useState<jwt.JwtPayload | string | null>(null)
   const [notifications, setNotifications] = useState<Notif[]>([])

   useEffect(() => {
      if (typeof window === 'undefined') return;
      const access_token = getAccessToken();
      if (!access_token || access_token === 'undefined' || access_token === 'null') return;

      try {
         const decoded = jwt.decode(access_token);
         setUser(decoded);
         if (decoded && typeof decoded === 'object' && 'org' in decoded) {
            apiFetch(`/api/notifications`, {
               method: 'GET',
               headers: { 'Authorization': `Bearer ${access_token}` },
            })
               .then(res => { if (!res.ok) throw new Error('Failed to fetch notifications'); return res.json(); })
               .then(data => { if (Array.isArray(data.notifications)) setNotifications(data.notifications); })
               .catch(err => console.error("Failed to fetch notifications", err));
         }
      } catch (err) {
         console.error("Token decode error:", err);
      }
   }, [])

   async function handleLogout() {
      removeAccessToken();
      try {
         await apiFetch('/api/logout', { method: 'POST' });
      } catch (e) {
         console.error(e);
      }
      router.push('/');
   }

   const name = typeof user === 'object' && user !== null && 'name' in user ? (user.name as string) : '';
   const role = typeof user === 'object' && user !== null && 'role' in user ? String(user.role) : '';
   const unreadCount = notifications.filter(n => !n.is_read).length;
   const recent = notifications.slice(0, 6);

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

            <div className="flex-1" />

            {/* Notifications dropdown */}
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <button
                     type="button"
                     aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                     className="relative p-2 rounded-lg text-body hover:bg-line/60 hover:text-strong transition-colors focus-visible:outline-none focus-visible:shadow-focus data-[state=open]:bg-line/60 data-[state=open]:text-strong"
                  >
                     <Notification size={22} color="currentColor" />
                     {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-danger-600 text-white text-[10px] font-semibold rounded-full grid place-items-center leading-none">
                           {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                     )}
                  </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                     <p className="text-sm font-semibold text-strong">Notifications</p>
                     {unreadCount > 0 && (
                        <span className="text-xs font-medium text-pes-700 bg-pes-50 rounded-full px-2 py-0.5">
                           {unreadCount} new
                        </span>
                     )}
                  </div>

                  {recent.length === 0 ? (
                     <div className="px-4 py-10 text-center">
                        <Notification size={28} className="mx-auto text-muted mb-2" />
                        <p className="text-sm text-muted">You&apos;re all caught up.</p>
                     </div>
                  ) : (
                     <ul className="max-h-96 overflow-y-auto divide-y divide-line">
                        {recent.map((n) => (
                           <li key={n.id} className={`px-4 py-3 flex gap-3 ${n.is_read ? '' : 'bg-pes-50/50'}`}>
                              <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.is_read ? 'bg-transparent' : 'bg-pes'}`} />
                              <div className="min-w-0 flex-1">
                                 <p className="text-sm font-medium text-strong truncate">{n.title}</p>
                                 <p className="text-sm text-muted line-clamp-2">{n.message}</p>
                                 <p className="text-xs text-muted mt-0.5">{formatRelativeTime(n.created_at)}</p>
                              </div>
                           </li>
                        ))}
                     </ul>
                  )}
               </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile dropdown */}
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <button
                     type="button"
                     className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg hover:bg-line/60 transition-colors focus-visible:outline-none focus-visible:shadow-focus data-[state=open]:bg-line/60"
                  >
                     <span className="w-8 h-8 rounded-full bg-pes-100 text-pes-700 grid place-items-center text-sm font-semibold overflow-hidden">
                        {name ? name.charAt(0).toUpperCase() : '?'}
                     </span>
                     <span className="hidden sm:block text-sm font-medium text-strong max-w-48 truncate">
                        {name}
                     </span>
                  </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
                     <span className="text-sm font-semibold text-strong normal-case truncate">{name || 'Account'}</span>
                     {role && <span className="text-xs text-muted capitalize font-normal">{role.replace(/-/g, ' ')}</span>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                     <Link href="/profile"><ProfileCircle size={18} /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="/"><InfoCircle size={18} /> Get help</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                     onSelect={handleLogout}
                     className="text-danger-700 focus:bg-danger-50 focus:text-danger-700"
                  >
                     <Logout size={18} /> Log out
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </header>
   )
}

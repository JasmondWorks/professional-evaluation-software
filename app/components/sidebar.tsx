'use client'

import { usePathname } from 'next/navigation';
import Image from 'next/image'
import {
   Home3,
   Setting4,
   DollarCircle,
   ProfileCircle,
   People,
   Award,
   Teacher,
   Setting3,
   CloseSquare,
   Setting2,
   Data2
} from 'iconsax-react';
import jwt from 'jsonwebtoken'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { LucideDatabase } from 'lucide-react';
import LoadingButton from './ui/LoadingButton';
import { resolveEffectiveRole, PermissionKey } from './utils/roles';
import { usePermissions } from './usePermissions';
import { getAccessToken } from '@/app/utils/auth';

export default function Sidebar({is_sidebar_active, handleSideBar}:
   {is_sidebar_active: boolean, handleSideBar:any}): JSX.Element{

   const pathname = usePathname()
   // Initialize with default values to prevent undefined access
   const [user, setUser] = useState({ name: '', role: '', org: '', logo: '', maintenance_model: false})
   const { role } = useAuth(); // Optional, depending on if useAuth is faster
   const { can } = usePermissions();

   useEffect(() => {
      // SSR safety check
      if (typeof window !== 'undefined') {
         const access_token = getAccessToken();

         if (access_token && access_token !== 'undefined' && access_token !== 'null') {
            try {
               const decoded: any = jwt.decode(access_token);
               if (decoded) {
                  setUser({
                     name: decoded.name || '',
                     role: decoded.role || '',
                     org: decoded.org || '',
                     logo: decoded.logo || '',
                     maintenance_model: decoded.maintenance_model || false
                  });
               }
            } catch (e) {
               console.error("Token decode error:", e);
            }
         }
      }
   }, [role])

    // Definition of all tabs
   const tabs = [
      { key: 1, name: 'Dashboard', icon: Home3, href: '/dashboard', role_access: ['super-admin', 'admin', 'lecturer', 'industrial-engineer', 'hod', 'unit-head', 'employee-w', 'auditor'] },
      { key: 4, name: 'Employee Database', icon: People, href: '/em-database', role_access: [ 'admin', 'hod', 'unit-head'], requires: 'can_access_employee_data' as PermissionKey },
      { key: 41, name: 'All Organizations', icon: People, href: '/organizations', role_access: [ 'super-admin' ] },
      { key: 5, name: 'Goals', icon: Setting4, href: '/goals', role_access: ['super-admin', 'admin', 'lecturer', 'industrial-engineer', 'hod', 'unit-head', 'employee-w'] },
      { key: 3, name: 'Data Entry', icon: LucideDatabase, href: '/data-entry', role_access: ['lecturer', 'industrial-engineer', 'hod', 'unit-head', 'employee-w', 'auditor'] },
      { key: 6, name: 'Assessment', icon: Award, href: '/assessment', role_access: ['super-admin', 'admin'], requires: 'can_manage_performance_reviews' as PermissionKey },
      { key: 11, name: 'Staff Determination', icon: Data2, href: '/evaluation', role_access: ['super-admin', 'admin', 'industrial-engineer'], requires: 'can_define_performance_metrics' as PermissionKey },
      { key: 7, name: 'Performance Review', icon: Teacher, href: '/performance', role_access: ['lecturer', 'industrial-engineer', 'hod', 'unit-head', 'employee-w'] },
      { key: 2, name: 'Profile', icon: ProfileCircle, href: '/profile', role_access: ['lecturer', 'industrial-engineer', 'hod', 'unit-head', 'employee-w', 'auditor'] },
      { key: 8, name: 'Pricing', icon: DollarCircle, href: '/pricing', role_access: ['super-admin', 'admin'] },
      { key: 10, name: 'Other Models', icon: Setting2, href: '/models', role_access: ['industrial-engineer', 'super-admin', 'admin'] }
   ]

   // Filter tabs by capability first, then role. Unknown/custom roles fall back
   // to the baseline employee surface (resolveEffectiveRole), and any tab with a
   // `requires` capability is also shown to whoever was granted that permission.
   const effectiveRole = user.role ? resolveEffectiveRole(user.role) : null;
   const allowedTabs = effectiveRole
      ? tabs.filter(tab => {
           const requires = (tab as { requires?: PermissionKey }).requires;
           if (requires && can(requires)) return true;
           return tab.role_access.includes(effectiveRole);
        })
      : [];

   // Helper to determine active state
   const isActive = (href: string) => pathname === href || `/${pathname.split('/')[1]}` === href;

   const initial = (user.org || 'PES').charAt(0).toUpperCase();

   // One nav item, styled identically for desktop and mobile.
   const NavItem = ({ href, name, Icon, onNavigate }:
      { href: string; name: string; Icon: any; onNavigate?: () => void }) => {
      const active = isActive(href);
      return (
         <Link
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
               ${active ? 'bg-pes-50 text-pes-700' : 'text-body hover:bg-line/60 hover:text-strong'}`}
         >
            <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-pes-700 transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} />
            <Icon size={20} variant={active ? 'Bold' : 'Linear'} className="shrink-0" />
            <span className="truncate">{name}</span>
         </Link>
      );
   };

   // Shared nav body so desktop and mobile never drift apart.
   const NavBody = ({ onNavigate }: { onNavigate?: () => void }) => (
      <>
         {/* Brand / org header */}
         <div className="flex items-center gap-3 px-5 h-16 border-b border-line shrink-0">
            {user.logo ? (
               <Image src={user.logo} alt="" width={32} height={32} className="object-contain rounded-md" />
            ) : (
               <div className="w-8 h-8 rounded-md bg-pes text-white grid place-items-center text-sm font-semibold">
                  {initial}
               </div>
            )}
            <div className="min-w-0">
               <p className="text-sm font-semibold text-strong truncate leading-tight">{user.org || 'PES'}</p>
               <p className="text-[11px] text-muted truncate leading-tight">Evaluation platform</p>
            </div>
         </div>

         {/* Links */}
         <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
            {allowedTabs.map(i => (
               <NavItem key={i.key} href={i.href} name={i.name} Icon={i.icon} onNavigate={onNavigate} />
            ))}
            {user.maintenance_model && (
               <NavItem href="/maintenance" name="Maintenance Model" Icon={Setting3} onNavigate={onNavigate} />
            )}
         </nav>

         {/* User footer */}
         {user.name && (
            <div className="border-t border-line px-4 py-3 flex items-center gap-3 shrink-0">
               <div className="w-8 h-8 rounded-full bg-pes-100 text-pes-700 grid place-items-center text-xs font-semibold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
               </div>
               <div className="min-w-0">
                  <p className="text-sm font-medium text-strong truncate leading-tight">{user.name}</p>
                  <p className="text-[11px] text-muted truncate capitalize leading-tight">{user.role.replace(/-/g, ' ')}</p>
               </div>
            </div>
         )}
      </>
   );

   return (
      <>
         {/* --- DESKTOP SIDEBAR (fixed 16rem rail) --- */}
         <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-surface border-r border-line flex-col z-20">
            <NavBody />
         </aside>

         {/* --- MOBILE SIDEBAR (drawer) --- */}
         <div className="lg:hidden">
            {/* Scrim */}
            <div
               onClick={handleSideBar}
               className={`fixed inset-0 bg-[#161135]/40 backdrop-blur-[1px] z-30 transition-opacity duration-300
                  ${is_sidebar_active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />
            {/* Panel */}
            <aside
               className={`fixed inset-y-0 left-0 w-[min(18rem,82vw)] bg-surface border-r border-line flex flex-col z-40
                  transition-transform duration-300 ease-out ${is_sidebar_active ? 'translate-x-0' : '-translate-x-full'}`}
            >
               <NavBody onNavigate={handleSideBar} />
            </aside>
            {/* Close button */}
            <div className={`fixed top-3 right-4 z-50 ${is_sidebar_active ? 'block' : 'hidden'}`}>
               <LoadingButton className="p-1 bg-surface rounded-lg shadow-md border border-line" onClick={handleSideBar}>
                  <CloseSquare size={28} color="#3c3c52" />
               </LoadingButton>
            </div>
         </div>
      </>
   )
}

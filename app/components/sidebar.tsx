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
   Data2,
   Verify
} from 'iconsax-react';
import jwt from 'jsonwebtoken'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { LucideDatabase } from 'lucide-react';
import { resolveEffectiveRole, PermissionKey } from './utils/roles';
import { usePermissions } from './usePermissions';
import { getAccessToken } from '@/app/utils/auth';
import UserAvatar from '@/app/components/ui/UserAvatar';
import { useCurrentUser } from './useCurrentUser';
import { useModelAccess } from './useModelAccess';

export default function Sidebar({is_sidebar_active, handleSideBar}:
   {is_sidebar_active: boolean, handleSideBar:any}): JSX.Element{

   const pathname = usePathname()
   // Initialize with default values to prevent undefined access
   const [user, setUser] = useState({ name: '', role: '', org: '', logo: '', maintenance_model: false})
   const { role } = useAuth(); // Optional, depending on if useAuth is faster
   const { can } = usePermissions();
   // Sidebar header shows the ORGANIZATION (name + logo). This is the footer
   // chip, which is the signed-in person, so it carries their photo.
   const { user: currentUser } = useCurrentUser();
   // Which models this person may reach. The engineer's list is a per-org setting
   // the admin changes, so it has to come from the server rather than the token.
   const modelAccess = useModelAccess();

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
      { key: 1, name: 'Dashboard', icon: Home3, href: '/dashboard', group: '', role_access: ['super-admin', 'admin', 'lecturer', 'industrial-engineer', 'hod', 'dept-admin', 'unit-head', 'employee-w', 'auditor'] },
      { key: 4, name: 'Employee Database', icon: People, href: '/em-database', group: 'Organization', role_access: [ 'admin', 'hod', 'unit-head'], requires: 'can_access_employee_data' as PermissionKey },
      { key: 41, name: 'All Organizations', icon: People, href: '/organizations', group: 'Organization', role_access: [ 'super-admin' ] },
      { key: 5, name: 'Goals', icon: Setting4, href: '/goals', group: 'Organization', role_access: ['super-admin', 'admin', 'lecturer', 'industrial-engineer', 'hod', 'unit-head', 'employee-w'] },
      { key: 3, name: 'Data Entry', icon: LucideDatabase, href: '/data-entry', group: 'Evaluate', role_access: ['lecturer', 'industrial-engineer', 'hod', 'dept-admin', 'unit-head', 'employee-w', 'auditor'] },
      { key: 6, name: 'Assessment', icon: Award, href: '/assessment', group: 'Evaluate', role_access: ['super-admin', 'admin'], requires: 'can_manage_performance_reviews' as PermissionKey },
      { key: 11, name: 'Staff Determination', icon: Data2, href: '/evaluation', group: 'Evaluate', role_access: ['super-admin', 'admin', 'industrial-engineer'], requires: 'can_define_performance_metrics' as PermissionKey },
      { key: 7, name: 'Performance Review', icon: Teacher, href: '/performance', group: 'Evaluate', role_access: ['lecturer', 'industrial-engineer', 'hod', 'unit-head', 'employee-w'] },
      { key: 2, name: 'Profile', icon: ProfileCircle, href: '/profile', group: 'Account', role_access: ['lecturer', 'industrial-engineer', 'hod', 'dept-admin', 'unit-head', 'employee-w', 'auditor'] },
      { key: 8, name: 'Pricing', icon: DollarCircle, href: '/pricing', group: 'Account', role_access: ['super-admin', 'admin'] },
      { key: 10, name: 'Models', icon: Setting2, href: '/models', group: 'Evaluate', role_access: ['industrial-engineer', 'super-admin', 'admin'] },
      { key: 12, name: 'Model Access', icon: Verify, href: '/model-access', group: 'Organization', role_access: ['super-admin', 'admin'] }
   ]

   // Filter tabs by capability first, then role. Unknown/custom roles fall back
   // to the baseline employee surface (resolveEffectiveRole), and any tab with a
   // `requires` capability is also shown to whoever was granted that permission.
   const effectiveRole = user.role ? resolveEffectiveRole(user.role) : null;
   const allowedTabs = effectiveRole
      ? tabs.filter(tab => {
           // Models is the one tab a role alone does not earn. The admin always
           // has it; the engineer gets it only once the admin has switched at
           // least one model on, and nobody else gets it at all.
           if (tab.href === '/models') {
              if (modelAccess.loading) return false;
              return modelAccess.canRunModels || modelAccess.models.length > 0;
           }
           const requires = (tab as { requires?: PermissionKey }).requires;
           if (requires && can(requires)) return true;
           return tab.role_access.includes(effectiveRole);
        })
      : [];

   // Nav is grouped so a long list stays scannable. Order is deliberate: what a
   // user does daily first, what they administer second, their own account last.
   const GROUP_ORDER = ['', 'Evaluate', 'Organization', 'Account'];
   const grouped = GROUP_ORDER
      .map(group => ({ group, items: allowedTabs.filter(t => (t as any).group === group) }))
      .filter(g => g.items.length > 0);

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
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
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
         <div className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
            <div className="flex items-center gap-3 min-w-0">
               {user.logo ? (
                  <Image src={user.logo} alt="" width={32} height={32} className="object-contain rounded-md shrink-0" />
               ) : (
                  <div className="w-8 h-8 rounded-md bg-pes text-white grid place-items-center text-sm font-semibold shrink-0">
                     {initial}
                  </div>
               )}
               <div className="min-w-0">
                  <p className="text-sm font-semibold text-strong truncate leading-tight">{user.org || 'PES'}</p>
                  <p className="text-[11px] text-muted truncate leading-tight">Evaluation platform</p>
               </div>
            </div>
            {/* Close button for mobile drawer */}
            <button
               onClick={onNavigate}
               className="lg:hidden p-1.5 -mr-2 text-muted hover:text-strong hover:bg-line/50 rounded-lg transition-colors focus:outline-none focus-visible:shadow-focus shrink-0"
               aria-label="Close menu"
            >
               <CloseSquare size={24} />
            </button>
         </div>

         {/* Links */}
         <nav className="flex-1 overflow-y-auto px-3 py-5 flex flex-col gap-5">
            {grouped.map(({ group, items }) => (
               <div key={group || 'main'} className="flex flex-col gap-1">
                  {group && (
                     <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                        {group}
                     </p>
                  )}
                  {items.map(i => (
                     <NavItem key={i.key} href={i.href} name={i.name} Icon={i.icon} onNavigate={onNavigate} />
                  ))}
                  {group === 'Evaluate' && user.maintenance_model && (
                     <NavItem href="/maintenance" name="Maintenance Model" Icon={Setting3} onNavigate={onNavigate} />
                  )}
               </div>
            ))}
         </nav>

         {/* User footer */}
         {user.name && (
            <div className="border-t border-line px-4 py-3 flex items-center gap-3 shrink-0">
               <UserAvatar name={user.name} image={currentUser?.image} size="sm" />
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
               className={`fixed inset-0 bg-[#161135]/40 backdrop-blur-[1px] z-drawer-scrim transition-opacity duration-300
                  ${is_sidebar_active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />
            {/* Panel */}
            <aside
               className={`fixed inset-y-0 left-0 w-[min(18rem,82vw)] bg-surface border-r border-line flex flex-col z-drawer
                  transition-transform duration-300 ease-out ${is_sidebar_active ? 'translate-x-0' : '-translate-x-full'}`}
            >
               <NavBody onNavigate={handleSideBar} />
            </aside>
         </div>
      </>
   )
}

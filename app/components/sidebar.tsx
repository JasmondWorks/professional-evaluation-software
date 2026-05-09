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
   Data,
   Data2
} from 'iconsax-react';
import jwt from 'jsonwebtoken'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import RoleCreated from './modals/role_created';
import { LucideDatabase } from 'lucide-react';
import LoadingButton from './ui/LoadingButton';


export default function Sidebar({is_sidebar_active, handleSideBar}: 
   {is_sidebar_active: boolean, handleSideBar:any}): JSX.Element{
   
   const pathname = usePathname()
   // Initialize with default values to prevent undefined access
   const [user, setUser] = useState({ name: '', role: '', org: '', logo: '', maintenance_model: false})
   const { role } = useAuth(); // Optional, depending on if useAuth is faster

   useEffect(() => {
      const access_token = localStorage.getItem('access_token');
      
      if (access_token && access_token !== 'undefined') {
         try {
            const decoded: any = jwt.decode(access_token);
            if (decoded) {
               setUser({
                  name: decoded.name || '',
                  role: decoded.role || '',
                  org: decoded.org || '',
                  logo: decoded.logo || '', // Ensure this is empty string if null, not "null" string
                  maintenance_model: decoded.maintenance_model || false
               });
            }
         } catch (e) {
            console.error("Token decode error:", e);
         }
      }
   }, [role]) // Re-run if role changes, though token check is usually sufficient

   // Definition of all tabs
   const tabs = [
      { key: 1, name: 'Dashboard', icon: <Home3 />, href: '/dashboard', role_access: ['super-admin', 'admin', 'lecturer', 'industrial-engineer', 'hod', 'employee-w', 'auditor'] },
      { key: 4, name: 'Employee Database', icon: <People />, href: '/em-database', role_access: [ 'admin', 'hod'] }, 
      { key: 4, name: 'All Organizations', icon: <People />, href: '/organizations', role_access: [ 'super-admin' ] }, 
      { key: 5, name: 'Goals', icon: <Setting4 />, href: '/goals', role_access: ['super-admin', 'admin', 'lecturer', 'industrial-engineer', 'hod', 'employee-w'] }, 
      { key: 3, name: 'Data Entry', icon: <LucideDatabase />, href: '/data-entry', role_access: ['lecturer', 'industrial-engineer', 'hod', 'employee-w', 'auditor'] }, 
      { key: 3, name: 'Data Entry(Test)', icon: <LucideDatabase />, href: '/data-entry', role_access: ['admin',] }, 
      { key: 6, name: 'Assessment', icon: <Award />, href: '/assessment', role_access: ['super-admin', 'admin'] }, 
      { key: 7, name: 'Performance Review', icon: <Teacher />, href: '/performance', role_access: ['lecturer', 'industrial-engineer', 'hod', 'employee-w'] }, 
      { key: 2, name: 'Profile', icon: <ProfileCircle />, href: '/profile', role_access: ['lecturer', 'industrial-engineer', 'hod', 'employee-w', 'auditor'] },
      { key: 8, name: 'Pricing', icon: <DollarCircle />, href: '/pricing', role_access: ['super-admin', 'admin'] },
      // { key: 9, name: 'Maintenance Model', icon: <Setting3 />, href: '/maintenance', role_access: [ 'industrial-engineer', 'super-admin', (user.maintenance_model? 'admin': '')] },
      { key: 10, name: 'Other Models', icon: <Setting2 />, href: '/models', role_access: ['industrial-engineer', 'super-admin', 'admin'] }
   ]

   // Filter tabs based on the user's role
   // If role is empty (initial load), this returns empty array, which is safe
   const allowedTabs = tabs.filter(tab => tab.role_access.includes(user.role));

   // Helper to determine active state
   const isActive = (href: string) => pathname === href || `/${pathname.split('/')[1]}` === href;

   return (
      <>
         {/* --- DESKTOP SIDEBAR --- */}
         <div className="w-1/5 h-full shadow-sm shadow-gray-50 me-auto max-lg:hidden lg:block z-20">
            <div className="bg-white h-screen fixed w-1/5 py-3 flex flex-col justify-start">
               
               {/* Logo Section */}
               <div className='my-4 text-pes text-2xl font-extrabold flex justify-center w-2/4 ms-12 me-auto'>
                  <Image 
                     src={ user.logo || '/Vector.svg' } 
                     alt='PES' 
                     width={55} 
                     height={55} 
                     className="object-contain" // Adds safety for varying image sizes
                  />
                  <p className='ms-2 my-auto'> { user.org || 'PES'}</p>
               </div> 

               {/* Links Section */}
               <div className='tabs my-16 flex flex-col justify-between overflow-y-auto'>
                  {allowedTabs.map(i => (
                     <Link
                        href={ i.href }
                        key={ i.key }
                        className={`${ isActive(i.href) ? 'bg-gray-200 text-pes' : 'bg-transparent text-gray-400'} 
                                    hover:bg-gray-200 hover:text-pes p-3 ps-8 my-1 text-md flex transition-colors duration-200`}
                     >
                        {i.icon}
                        <p className="mx-3">{ i.name }</p>
                     </Link>
                  ))}
                  {
                     user.maintenance_model?
                        <Link
                           onClick={() => handleSideBar()} 
                           href={ "/maintenance" } 
                           className={`${ isActive("/maintenance") ? 'bg-gray-200 text-pes' : 'bg-transparent text-gray-400'} 
                           hover:bg-gray-200 hover:text-pes p-3 ps-8 my-1 text-md flex`}
                        >
                           <Setting3/>
                           <p className='mx-3'> Maintenance model</p>
                        </Link>
                     :  <></>
                  }
               </div>            
            </div>
         </div>

         {/* --- MOBILE SIDEBAR --- */}
         <div className="lg:hidden">
            <div className={`${is_sidebar_active ? 'w-screen' : 'w-0'} transition-all bg-[#ffffff20] h-full shadow-sm shadow-gray-50 me-auto fixed left-0 z-20 overflow-hidden`}>
               <div className={`bg-white h-screen fixed w-2/3 py-3 flex flex-col justify-start transition-transform duration-300 ${is_sidebar_active ? 'translate-x-0': '-translate-x-full'}`}>
                  
                  {/* Mobile Logo */}
                  <div className='my-4 text-pes text-2xl font-extrabold flex justify-center w-full px-4'>
                     {/* Used standard img tag for mobile as per your original code, but fixed src */}
                     <Image 
                        src={ user?.logo || '/Vector.svg' } 
                        alt='PES' 
                        width={55} 
                        height={55} 
                     />
                     <p className='ms-2 my-auto'>{ user.org || 'PES'}</p>
                  </div>

                  {/* Mobile Links - Now using the same allowedTabs filter */}
                  <div className='tabs my-10 flex flex-col justify-between overflow-y-auto'>
                     {allowedTabs.map((i) => (
                        <Link 
                           onClick={() => handleSideBar()} 
                           href={ i.href } 
                           key={ i.key } 
                           className={`${ isActive(i.href) ? 'bg-gray-200 text-pes' : 'bg-transparent text-gray-400'} 
                                       hover:bg-gray-200 hover:text-pes p-3 ps-8 my-1 text-md flex`}
                        >
                           { i.icon }
                           <p className='mx-3'> { i.name }</p>
                        </Link>
                     ))}
                     {
                        user.maintenance_model?
                           <Link
                              onClick={() => handleSideBar()} 
                              href={ "/maintenance" } 
                              className={`${ isActive("/maintenance") ? 'bg-gray-200 text-pes' : 'bg-transparent text-gray-400'} 
                              hover:bg-gray-200 hover:text-pes p-3 ps-8 my-1 text-md flex`}
                           >
                              <Setting3/>
                              <p className='mx-3'> Maintenance model</p>
                           </Link>
                        :  <></>
                     }
                  </div>            
               </div>
            </div>

            {/* Mobile Close Button */}
            <div className={`fixed rounded-lg top-[20px] z-30 right-6 ${is_sidebar_active ? 'block' : 'hidden'}`} >
               <LoadingButton className={`p-[2px] bg-white rounded-md shadow-md`} onClick={() => handleSideBar()} >
                  <CloseSquare size={40} color={"black"}/>
               </LoadingButton>
            </div>
         </div>
      </>
   )
}
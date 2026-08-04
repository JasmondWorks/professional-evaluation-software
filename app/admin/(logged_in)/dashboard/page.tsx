"use client";
import { useRouter } from "next/navigation";
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
   Data2,
   ArrowRight2
} from 'iconsax-react';
import jwt from 'jsonwebtoken'
import Link from 'next/link';
import { ArrowRight, LucideDatabase } from 'lucide-react';
import { useEffect, useState } from "react";
import LoadingButton from '../../../components/ui/LoadingButton';
import { apiFetch } from '@/app/utils/apiFetch';

export default function AdminPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [is_mobile, setMobile] = useState(false); 
  const router = useRouter();
  const [is_sidebar_active, setSideBarActive] = useState(false);
  const pathname = usePathname()


  const handleSideBar = () => {
    setSideBarActive(!is_sidebar_active);
  }

  const handleMobile = () => {~
    setMobile(!is_mobile)
  }

  const isActive = (href: string) => pathname === href || `/${pathname.split('/')[1]}` === href;

  const tabs = [
    { key: 1, name: 'Dashboard', href: '/admin/dashboard', role_access: ['super-admin', 'admin', 'lecturer', 'industrial-engineer', 'hod', 'employee-w', 'auditor'] },
    { key: 4, name: 'Admin users', href: '/admin/superusers', role_access: [ 'admin', 'hod'] }, 
    { key: 4, name: 'All Organizations', href: '/admin/organizations', role_access: [ 'super-admin' ] }, 
  ]

  function logout(){
    localStorage.removeItem('access_token')
    router.push('/admin')
  }

  useEffect(() => {
    apiFetch("/api/admin/users-by-org")
      .then((res) => res.json())
      .then(setOrgs);
  }, []);

  return (
    <div className="flex flex-col w-full bg-canvas justify-between">
      <div className='flex w-full justify-between'>
          <h1 className='text-pes text-3xl m-4'>Super Admin Dashboard</h1>
          <LoadingButton onClick={logout} className="hover:text-pes active:text-pes text-muted text-lg">Logout</LoadingButton>
      </div>

      <hr />

      <div className="flex flex-col w-full">
          {orgs.map((org) => (
          <Link href={`/admin/${org.org}`} key={org.org} className='flex bg-canvas p-5 rounded-lg w-full m-4 justify-between'>
              <p>{org.org}</p>
              <ArrowRight2/>
          </Link>
          ))} 
      </div>
    </div>
  );
}
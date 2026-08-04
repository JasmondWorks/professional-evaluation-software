'use client'
import '../../globals.css'
import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation';
import { Lato } from 'next/font/google'
// import { Provider } from 'react-redux'
// import { store } from '../state/store'
import { useEffect, useState } from 'react'
import { CloseSquare, DocumentSketch } from 'iconsax-react'
import Image from 'next/image'
import Link from 'next/link'
import LoadingButton from '../../components/ui/LoadingButton';

const lato = Lato( 
  {
    weight: ['100', '300', '400', '700', '900'],
    subsets: ['latin']
   }
  )

export default function RootLayout({ children, }: { children: React.ReactNode }) {

  const [is_mobile, setMobile] = useState(false);
  const [is_sidebar_active, setSideBarActive] = useState(false);

  const handleSideBar = () => {
    setSideBarActive(!is_sidebar_active);
  }
  const handleMobile = () => {~
    setMobile(!is_mobile)
  }

  const [orgs, setOrgs] = useState<any[]>([]);
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || `/${pathname.split('/')[1]}` === href;

  const tabs = [
    { key: 1, name: 'Dashboard', href: '/admin/dashboard', role_access: ['super-admin', 'admin', 'lecturer', 'industrial-engineer', 'hod', 'employee-w', 'auditor'] },
    { key: 4, name: 'Admin users', href: '/admin/super', role_access: [ 'admin', 'hod'] }, 
    { key: 4, name: 'Auditors', href: '/admin/auditor', role_access: [ 'super-admin' ] }, 
  ]

  useEffect(() => {
  }, [])
  
  return (
      <div className={ lato.className + 'bg-canvas flex flex-row relative justify-center w-screen' }
        onChange={handleMobile}>

          <div className="(sidebar) bg-white w-2/12 border-e">
            {/* --- DESKTOP SIDEBAR --- */}
            <div className="w-full h-full shadow-sm shadow-gray-50 max-lg:hidden lg:block z-20">
              <div className="bg-white h-screen fixed py-3 flex flex-col justify-start">
                  
                  {/* Logo Section */}
                  <div className='my-2 text-pes text-2xl font-extrabold flex justify-center w-2/4 ms-10 me-auto'>
                    <Image
                        src={ '/Vector.svg' } 
                        alt='PES' 
                        width={55} 
                        height={55} 
                        className="object-contain" // Adds safety for varying image sizes
                    />
                    <p className='ms-2 my-auto flex'> {'PES'} <span className='text-white bg-pes py-0.5 px-2 rounded-full text-xs h-fit w-fit mt-auto mb-1 mx-2'>admin</span> </p>
                  </div> 

                  {/* Links Section */}
                  <div className='tabs my-16 flex flex-col justify-between overflow-y-auto'>
                    {tabs.map(i => (
                        <Link
                          href={ i.href }
                          key={ i.key }
                          className={`${ isActive(i.href) ? 'bg-gray-200 text-pes' : 'bg-transparent text-muted'} 
                                      hover:bg-gray-200 hover:text-pes p-3 ps-8 my-1 text-md flex transition-colors duration-200`}
                        >
                          <p className="mx-3">{ i.name }</p>
                        </Link>
                    ))}
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
                          src={ '/Vector.svg' } 
                          alt='PES' 
                          width={55} 
                          height={55} 
                        />
                        <p className='ms-2 my-auto'>{'PES'}</p>
                    </div>

                    {/* Mobile Links - Now using the same tabs filter */}
                    <div className='tabs my-10 flex flex-col justify-between overflow-y-auto'>
                        {tabs.map((i) => (
                          <Link
                              onClick={() => handleSideBar()} 
                              href={ i.href } 
                              key={ i.key } 
                              className={`${ isActive(i.href) ? 'bg-gray-200 text-pes' : 'bg-transparent text-muted'} 
                                          hover:bg-gray-200 hover:text-pes p-3 ps-8 my-1 text-md flex`}
                          >
                              <p className='mx-3'> { i.name }</p>
                          </Link>
                        ))}
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
          </div>

          <div className="flex flex-col w-9/12 max-lg:w-full">
            {children}          
          </div>
      </div>
  )
}




'use client'
import { notify } from "@/lib/toast";
import { ArrowLeft } from 'iconsax-react'
import Link from 'next/link'
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from '@/app/utils/auth';

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/app/utils/apiFetch';

type user = {
    id:number
    name: string
    email: string 
    password: string
    gsm: string
    role: string
    address: string
    faculty_college: string
    dob: string
    doa: string
    poa : string
    doc : string
    post : string
    dopp: string
    level: string
    image : string
    org : string
    view_department_stress?: boolean
    view_faculty_stress?: boolean
}
const init = {
    id: 0,
    name: '',
    email: '', 
    password: '',
    gsm: '',
    role: '',
    address: '',
    faculty_college: '',
    dob: '',
    doa: '',
    poa : '',
    doc : '',
    post : '',
    dopp: '',
    level: '',
    image : '',
    org : '',
}


export default function Page({ params }: { params: { user: string } }){
    const [ expanded, setExpanded ] = useState(false)
    const [ databaseView, setDatabaseView ] = useState('profile')
    const [user, setUser] = useState<user>(init)
    const ImageFallback = () => <div className='w-40 h-40 rounded-md animate-pulse bg-gray-200'></div>
    const TextFallback = () => <><div className='w-60 h-3 my-1 rounded-full animate-pulse bg-gray-200'></div><div className='w-40 h-3 my-1 rounded-full animate-pulse bg-gray-200'></div></>
 
    useEffect( () => {
        async function fetchUser(){
            const access_token = getAccessToken() as string
            
           
            const data = await apiFetch('/api/getUserProfile', 
              {
                 method: "POST",
                 headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access_token}`
                 },
                 body: JSON.stringify({ user: params.user }) // Converting the data object to a JSON string
              }
           )
           let res = await data.json()
        //    console.log(await res.data)
           setUser(res.data)
        }
        fetchUser()
    }, [])

    async function deleteUser() {
        if (!confirm(`Are you sure you want to delete ${user.email} from ${user.org}?`)) {
            return; // user cancelled
        }

        try {
            const access_token = getAccessToken() as string;
            const res = await apiFetch("/api/users/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json",
                    "Authorization": `Bearer ${access_token}` },
            body: JSON.stringify({ id: user.id || Number(params.user), email: user.email }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
            notify.success(`User ${user.email} deleted successfully!`);
            window.location.href = '/em-database'
            // Optional: update UI or refresh page
            // window.location.reload();
            } else {
            notify.error(`Failed to delete user: ${data.message}`);
            console.error("Delete error:", data);
            }
        } catch (err) {
            console.error("Request failed:", err);
            notify.error("An unexpected error occurred while deleting the user.");
        }
    }

    // Grant/revoke this staff member's access to their own dept/faculty stress results.
    async function toggleStressAccess(field: 'view_department_stress' | 'view_faculty_stress', value: boolean) {
        // Optimistic update.
        setUser((u: any) => ({ ...u, [field]: value }))
        try {
            const res = await apiFetch('/api/staff-stress-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, email: user.email, [field]: value }),
            })
            if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                throw new Error(d.error || `Request failed (${res.status})`)
            }
        } catch (e) {
            // Revert on failure.
            setUser((u: any) => ({ ...u, [field]: !value }))
            notify.error(`Could not update stress-results access: ${e instanceof Error ? e.message :'unknown error'}`)
        }
    }


    return(
        <main className="w-full flex flex-col bg-canvas min-h-screen">
            <div className='nav flex items-center justify-between bg-surface h-16 w-full border-b border-line px-4 sm:px-6'>
                <div className='flex items-center gap-1'>
                    <Link href={ `/em-database` } className='p-2 rounded-lg text-muted hover:text-pes hover:bg-line/60 transition-colors'><ArrowLeft size={20}/></Link>
                    {([
                        { key: 'profile', label: 'Employee profile' },
                        { key: 'performance', label: 'Performance analysis' },
                    ] as const).map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setDatabaseView(t.key)}
                            aria-current={databaseView === t.key ? 'page' : undefined}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${databaseView === t.key ? 'bg-pes-50 text-pes-700' : 'text-body hover:bg-line/60 hover:text-strong'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <button onClick={deleteUser} className='bg-danger-50 cursor-pointer hover:bg-danger-100 text-danger-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors'>
                    Delete
                </button>
            </div>

            {
                databaseView == 'profile' ?
                    <div className='flex flex-col m-8 p-8 bg-white'>
                        <div className="bg-canvas h-[3rem] flex justify-between">
                            <h1 className="my-auto mx-6 font-semibold">Employee details</h1>
                        </div>

                        {/* Stress results read-access the admin grants this staff member */}
                        <div className="my-4 border border-line rounded-lg p-5">
                            <h2 className="font-semibold text-strong mb-1">Stress results access</h2>
                            <p className="text-sm text-muted mb-4">Allow this staff member to view their own department / faculty stress results.</p>
                            <div className="flex flex-col gap-3">
                                {([
                                    { field: 'view_department_stress', label: 'View their department stress results' },
                                    { field: 'view_faculty_stress', label: 'View their faculty / division stress results' },
                                ] as const).map((row) => (
                                    <label key={row.field} className="flex items-center justify-between gap-4 cursor-pointer">
                                        <span className="text-sm text-body">{row.label}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleStressAccess(row.field, !user[row.field])}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user[row.field] ? 'bg-pes' : 'bg-gray-300'}`}
                                            aria-pressed={!!user[row.field]}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user[row.field] ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        <div className="details my-2">
                            <div className='(initial) flex justify-between'>
                                <div className='flex justify-between py-2'>
                                <div className='w-40 h-40 me-8'>
                                    {
                                        user?
                                            <img src={ `/${user.image}` } alt="profile-img" className='w-40 h-40'/>                   
                                        :
                                            <ImageFallback />
                                    }
                                </div>

                                <div className='flex flex-col'>
                                    <div className='my-2 flex flex-col'>
                                        {
                                            user?
                                            <>
                                                <p className='text-muted'>Name:</p>
                                                <p className='font-semibold text-lg'>{user.name}</p>                         
                                            </>
                    
                                            :
                                            <TextFallback/>                        
                                        }
                                    </div>

                                    <div className='my-2 flex flex-col'>
                                        {
                                            user?
                                            <>
                                            <p className='text-muted'>Functional GSM:</p>
                                            <p className='font-semibold text-lg'>{user.gsm}</p>                      
                                            </>
                                            
                                            :
                                            <TextFallback/>
                                        }
                                    </div>

                                    <div className='my-2 flex flex-col'>
                                        {
                                            user?
                                            <>
                                                <p className='text-muted'>Current home address:</p>
                                                <p className='font-semibold text-lg'>{user.address}</p>                            
                                            </>
                                            :
                                            <TextFallback />
                                        }
                                    </div>
                                </div>
                                </div>

                                <div className='flex flex-col min-w-[30rem] py-2 px-4'>
                                <div className='my-2 flex flex-col'>
                                    {
                                        user?
                                            <>
                                            <p className='text-muted'>Email:</p>
                                            <p className='font-semibold text-lg'>{user.email}</p>                             
                                            </>
                                        :
                                        <TextFallback />
                                    } 
                                </div>

                                <div className='my-2 flex flex-col'>
                                    {
                                        user?
                                            <>
                                            <p className='text-muted'>Present role:</p>
                                            <p className='font-semibold text-lg'>{user.role}</p>                           
                                            </>
                                        :
                                        <TextFallback />
                                    }
                                </div>

                                <div className='my-2 flex flex-col'>
                                    {
                                        user?
                                            <>
                                            <p className='text-muted'>Faculty/college:</p>
                                            <p className='font-semibold text-lg'>{user.faculty_college}</p>                             
                                            </>
                                        :
                                        <TextFallback />
                                    }
                                    
                                </div>

                                {/* <div className='my-2 flex flex-col'>
                                    <p className='text-muted'>Faculty/college:</p>
                                    <p className='font-semibold text-lg'>{}</p>
                                </div> */}
                                </div>
                            </div>

                            <div style={{ display: `${ expanded? '' : 'none' }` }}  className='(see more) flex flex-col justify-between'>
                                <div className='flex justify-between w-9/12'>
                                <div className='my-2 flex flex-col'>
                                    {
                                        user?
                                            <>
                                            <p className='text-muted'>Date of Birth:</p>
                                            <p className='font-semibold text-lg'>{user.dob?.toString().split('T')[0]}</p>                           
                                            </>
                                        :
                                        <TextFallback />
                                    }
                                </div>

                                <div className='my-2 flex flex-col'>
                                    {
                                        user?
                                            <>
                                            <p className='text-muted'>date of first Appointment:</p>
                                            <p className='font-semibold text-lg'>{user.doa?.toString().split('T')[0]}</p>                           
                                            </>
                                        :
                                        <TextFallback />
                                    }
                                </div>

                                <div className='my-2 flex flex-col'>
                                    {
                                        user?
                                            <>
                                            <p className='text-muted'>Post/grade of first appointment:</p>
                                            <p className='font-semibold text-lg'>{user.poa}</p>                           
                                            </>
                                        :
                                        <TextFallback />
                                    }

                                </div>

                                <div className='my-2 flex flex-col'>
                                    {
                                        user?
                                            <>
                                            <p className='text-muted'>Date of confirmation:</p>
                                            <p className='font-semibold text-lg'>{user.doc?.toString().split('T')[0]}</p>                        
                                            </>
                                        :
                                        <TextFallback />
                                    }
                                </div>
                                </div>

                                <div className='flex justify-between w-9/12'>
                                <div className='my-2 flex flex-col'>
                                    {
                                        user?
                                            <>
                                            <p className='text-muted'>Present Post:</p>
                                            <p className='font-semibold text-lg'>{user.post}</p>                        
                                            </>
                                        :
                                        <TextFallback />
                                    }
                                </div>

                                <div className='my-2 flex flex-col'>
                                    {
                                        user?
                                            <>
                                            <p className='text-muted'>Date appointed to present post:</p>
                                            <p className='font-semibold text-lg'>{user.dopp?.toString().split('T')[0]}</p>                        
                                            </>
                                        :
                                        <TextFallback />
                                    }
                                </div>

                                <div className='my-2 flex flex-col'>
                                    {
                                        user?
                                            <>
                                            <p className='text-muted'>Current Level/Step:</p>
                                            <p className='font-semibold text-lg'>{user.level}</p>                        
                                            </>
                                        :
                                        <TextFallback />
                                    }
                                </div>
                                </div>
                                
                                <div className='flex justify-between w-9/12'>
                                <div className='my-2 flex flex-col'>
                                    <p className='text-muted'>Academic certification:</p>
                                    <div>
                                        {
                                            // TODO - render certification here
                                        }
                                    </div>
                                </div>

                                </div>
                            </div>

                            <div className='flex justify-end'>
                                <p style={{ display: `${ expanded? 'none' : '' }` }} className={`text-pes-700 cursor-pointer hover:text-pes-800 underline text-sm font-medium`} onClick={ () => setExpanded( prevState => !prevState ) }>See more</p>
                                <p style={{ display: `${ expanded? '' : 'none' }` }} className={`text-pes-700 cursor-pointer hover:text-pes-800 underline text-sm font-medium`} onClick={ () => setExpanded( prevState => !prevState ) }>See less</p>
                            </div>
                        </div>

                        <div className="flex border">
                            <div className="border-r w-1/2">
                            <div className="bg-canvas border-b h-[3rem] flex">
                                <h1 className="my-auto mx-4 font-semibold">Reporting Hierachy</h1>
                            </div>
                            
                            <p className='p-4'>The 'Reporting Hierarchy' section shows the existing reporting structure for this employee. This hierarchy has been set according to their role and reporting relationships within the organization.</p>

                            <form className=" placeholder-slate-200 m-4">
                                <label htmlFor="description" className="flex">
                                    Reporting to:
                                    <input disabled type="text" className='border outline-1 outline-gray-200 rounded-[0.25rem] mt-1 font-thin px-4 py-2 pb-16' id="description" placeholder="Provide a brief description outlining the role's key responsibilities and purpose." />
                                </label>
                            </form>
                            </div>

                            <div className="w-1/2">
                            <div className="bg-canvas border-b h-[3rem] flex">
                                <h1 className="my-auto mx-4 font-semibold">Permission Settings</h1>
                            </div>

                            <form className=" placeholder-slate-300">
                                <div className='border-b p-4'>
                                    <p>The 'Permission Settings' section displays the current access and responsibilities assigned to this employee. These settings have been configured based on their role and responsibilities within the organization.</p>
                                </div>

                                <div className="border-b p-4">
                                    <label className="flex">
                                        <input disabled type="checkbox" onChange={()=>{}} checked className="h-6 w-6 mt-1 me-3" />
                                        <span className="w-10/12">
                                        <h1 className="text-lg">Manage User Roles</h1>
                                        <p>Create, edit, and delete user roles, defining their specific permissions and responsibilities.</p>
                                        </span>
                                    </label>
                                </div>

                                <div className="border-b p-4 flex flex-col">
                                    <label className="flex">
                                        <input disabled type="checkbox" onChange={()=>{}} checked className="h-6 w-6 mt-1 me-3" />
                                        <span className="w-10/12">
                                        <h1 className="text-lg">Access Employee Data</h1>
                                        <p>View and edit the details of employees.</p>
                                        </span>
                                    </label>
                                    <div className="flex ms-8 my-2 text-muted text-sm font-extralight">
                                        <label className="flex me-4">
                                        <input disabled type="checkbox" onChange={()=>{}} className="me-1" />
                                        <span>All Employees</span>
                                        </label>     
                                        <label className="flex me-4">
                                        <input disabled type="checkbox" onChange={()=>{}} checked className="me-1" />
                                        <span>Subordinates</span>
                                        </label>     
                                        <label className="flex me-4">
                                        <input disabled type="checkbox" onChange={()=>{}} className="me-1" />
                                        <span>Selected Employees</span>
                                        </label>     
                                    </div>
                                </div>

                                <div className="border-b p-4 flex flex-col">
                                    <label className="flex">
                                        <input type="checkbox" onChange={()=>{}} checked className="h-6 w-6 mt-1 me-3" />
                                        <span className="w-10/12">
                                        <h1 className="text-lg">Define Performance Metrics</h1>
                                        <p>View and edit the performance metrics of employees.</p>
                                        </span>
                                    </label>
                                    <div className="flex ms-8 my-2 text-muted text-sm font-extralight">
                                        <label className="flex me-4">
                                        <input type="checkbox" onChange={()=>{}} className="me-1" />
                                        <span>All Employees</span>
                                        </label>     
                                        <label className="flex me-4">
                                        <input type="checkbox" onChange={()=>{}} checked className="me-1" />
                                        <span>Subordinates</span>
                                        </label>     
                                        <label className="flex me-4">
                                        <input type="checkbox" onChange={()=>{}} className="me-1" />
                                        <span>Selected Employees</span>
                                        </label>     
                                    </div>
                                </div>

                                <div className="border-b p-4 flex flex-col">
                                    <label className="flex">
                                        <input type="checkbox" onChange={()=>{}} checked className="h-6 w-6 mt-1 me-3" />
                                        <span className="w-10/12">
                                        <h1 className="text-lg">Access Reporting Hierachy</h1>
                                        <p>Define and modify the organizational reporting structure, assigning managers to employees and creating teams.</p>
                                        </span>
                                    </label>
                                </div>

                                <div className="border-b p-4 flex flex-col">
                                    <label className="flex">
                                        <input type="checkbox" onChange={()=>{}} checked className="h-6 w-6 mt-1 me-3" />
                                        <span className="w-10/12">
                                        <h1 className="text-lg">Manage Performance Reviews</h1>
                                        <p>Schedule, modify, or cancel performance review meetings for any employee.</p>
                                        </span>
                                    </label>
                                    <div className="flex ms-8 my-2 text-muted text-sm font-extralight">
                                        <label className="flex me-4">
                                        <input type="checkbox" onChange={()=>{}} className="me-1" />
                                        <span>All Employees</span>
                                        </label>     
                                        <label className="flex me-4">
                                        <input type="checkbox" onChange={()=>{}} checked className="me-1" />
                                        <span>Subordinates</span>
                                        </label>     
                                        <label className="flex me-4">
                                        <input type="checkbox" onChange={()=>{}} className="me-1" />
                                        <span>Selected Employees</span>
                                        </label>     
                                    </div>
                                </div>

                            </form>
                            </div>
                        </div>            
                    </div>            
                :
                    <div className='flex flex-col mx-8 bg-white'>
                        <div className="bg-canvas h-[3rem] flex justify-between">
                            <h1 className="my-auto mx-6 font-semibold">Last Assessment Result</h1>
                        </div>  

                        <div className='bg-white p-4'>
                            <div className='flex justify-between my-3'>
                                <p className='w-6/12 font-semibold text-lg'>Appraisal</p>
                                <p className='w-3/12 text-danger-600'>210</p>
                                <p className='w-3/12 text-danger-600'>fair</p>
                            </div>
                            <div className='flex flex-col'>
                                <p className='font-semibold my-3 text-lg'>Performance</p>
                                <div className='flex justify-between py-3 border-b border-[#cfcfcf1a]'>
                                    <p className='w-6/12'>Competence</p>
                                    <p className='w-3/12 text-yellow-500'>65%</p>
                                    <p className='w-3/12 text-yellow-500'>4th class(Good)</p>
                                </div>
                                <div className='flex justify-between py-3 border-b border-[#cfcfcf1a]'>
                                    <p className='w-6/12'>Integrity</p>
                                    <p className='w-3/12 text-green-500'>89%</p>
                                    <p className='w-3/12 text-green-500'>2nd class(Excellent)</p>
                                </div>
                                <div className='flex justify-between py-3 border-b border-[#cfcfcf1a]'>
                                    <p className='w-6/12'>Compatibility</p>
                                    <p className='w-3/12 text-danger-600'>24%</p>
                                    <p className='w-3/12 text-danger-600'>6th class(Poor)</p>
                                </div>
                                <div className='flex justify-between py-3 border-b border-[#cfcfcf1a]'>
                                    <p className='w-6/12'>Use of resources</p>
                                    <p className='w-3/12 text-danger-600'>24%</p>
                                    <p className='w-3/12 text-danger-600'>6th class(Poor)</p>
                                </div>
                            </div>

                            <div>
                                <p className='font-semibold my-3 text-lg'>Stress Factor</p>

                                <div className='flex justify-between py-3 border-b border-[#cfcfcf1a]'>
                                    <p className='w-6/12'>Stress level</p>
                                    <p className='w-3/12 text-yellow-500'>65%</p>
                                    <p className='w-3/12 text-yellow-500'>4th class(Good)</p>
                                </div>
                                <div className='flex justify-between py-3 border-b border-[#cfcfcf1a]'>
                                    <p className='w-6/12'>Time Pressure Stress level</p>
                                    <p className='w-3/12 text-green-500'>89%</p>
                                    <p className='w-3/12 text-green-500'>2nd class(Excellent)</p>
                                </div>
                                <div className='flex justify-between py-3 border-b border-[#cfcfcf1a]'>
                                    <p className='w-6/12'>Conflict Stress Level</p>
                                    <p className='w-3/12 text-danger-600'>24%</p>
                                    <p className='w-3/12 text-danger-600'>6th class(Poor)</p>
                                </div>
                                <div className='flex justify-between py-3 border-b border-[#cfcfcf1a]'>
                                    <p className='w-6/12'>Total stress frequency</p>
                                    <p className='w-3/12 text-danger-600'>24%</p>
                                    <p className='w-3/12 text-danger-600'>6th class(Poor)</p>
                                </div>
                                <div className='flex justify-between py-3 border-b border-[#cfcfcf1a]'>
                                    <p className='w-6/12'>Major feelings based on stress category</p>
                                    <p className='w-3/12 text-danger-600'>24%</p>
                                    <p className='w-3/12 text-danger-600'>6th class(Poor)</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-canvas h-[3rem] flex justify-between">
                            <h1 className="my-auto mx-6 font-semibold">Acheivements</h1>
                        </div>  


                        <div className='bg-white p-4 min-h-[10rem]'>
                        </div>
                    </div> 
            }
        </main>     
     )
}
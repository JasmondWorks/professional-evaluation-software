import { useSelector } from 'react-redux';
import { RootState } from '@/app/state/store'
import { Verify } from 'iconsax-react'


export default function RoleCreated(){
    const isVisible = useSelector( (state: RootState) => state.roleCreated.visible )

    return (
        <div className={`notification ${ isVisible? 'visible': 'invisible' } rounded-sm shadow-lg p-12 z-30 flex flex-col w-4/12 bg-white absolute top-1/2 -translate-y-1/2`}>
            <div className='flex flex-col'>
               <Verify className='text-pes text-2xl mx-auto' size={100} variant='Bold'/>
               <h1 className='font-bold mx-auto'>Role Created Successfully</h1>
               <a href='/em-database' className='flex bg-pes rounded-md text-white w-fit px-8 py-3 mx-auto mt-4'>Back to Roles and Permissions</a>
            </div>
        </div>
    )
}
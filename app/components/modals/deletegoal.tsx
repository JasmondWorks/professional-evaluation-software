import { useDispatch, useSelector } from 'react-redux';
import { cancelDelete } from '@/app/state/goals/goalSlice';
import { RootState } from '@/app/state/store'
import { CloseCircle } from 'iconsax-react'
import LoadingButton from '../ui/LoadingButton';

type goal = {
    name: string;
    status: any;
    description: string;
    daysLeft: any
}

async function changeGoal() {
    
}

export default function Deletegoal(){
    const isVisible = useSelector( (state: RootState) => state.goal.delete )
    const dispatch = useDispatch()

    return (
        <div className={`notification ${ isVisible? 'visible': 'invisible' } rounded-sm shadow-lg p-12 z-30 flex flex-col w-4/12 bg-white absolute top-1/2 -translate-y-1/2`}>
            <div>
               <h1 className ='text-red-500 font-bold text-xl mb-3'>
                  Are you sure you want to delete this goal?
               </h1>
               <p>
               {`                  
                  This action is irreversible and will remove all associated data. 
                  Please note that deleted goals cannot be recovered. 
                  If you're certain, click 'Delete' below. 
                  Otherwise, click 'Cancel' to keep the goal.
               `}
               </p>
               <div className="actions flex">
                  <LoadingButton className='bg-pes rounded-md text-white w-7/12 py-4 mt-6 me-2' onClick={ () => dispatch( cancelDelete()) } >Cancel</LoadingButton>
                  <button className='bg-red-500 rounded-md text-white w-4/12 py-4 mt-6'>Delete</button>
               </div>

            </div>
        </div>
    )
}
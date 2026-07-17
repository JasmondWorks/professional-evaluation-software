import { useDispatch, useSelector } from 'react-redux';
import { cancelDelete } from '@/app/state/goals/goalSlice';
import { RootState } from '@/app/state/store'
import { CloseCircle } from 'iconsax-react'
import LoadingButton from '../ui/LoadingButton';
import { getAccessToken } from '@/app/utils/auth';

type goal = {
    name: string;
    status: any;
    description: string;
    daysLeft: any
}

export default function Deletegoal(){
    const isVisible = useSelector( (state: RootState) => state.goal.delete )
    const goalData = useSelector( (state: RootState) => state.goal.data )
    const dispatch = useDispatch()

    async function handleDelete() {
        try {
            const token = getAccessToken()
            const res = await fetch('/api/removeGoal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, goalId: goalData.id })
            })

            if (!res.ok) {
                throw new Error('Failed to delete goal')
            }

            dispatch(cancelDelete())
            // Reload the page to reflect the deleted goal
            window.location.reload()
        } catch (err) {
            console.error('Error deleting goal:', err)
        }
    }

    return (
        <div className={`notification ${ isVisible? 'visible': 'invisible' } rounded-lg shadow-lg p-6 z-30 flex flex-col w-11/12 max-w-md max-h-[90vh] overflow-y-auto bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
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
                  <LoadingButton className='bg-red-500 rounded-md text-white w-4/12 py-4 mt-6' onClick={ handleDelete }>Delete</LoadingButton>
               </div>

            </div>
        </div>
    )
}
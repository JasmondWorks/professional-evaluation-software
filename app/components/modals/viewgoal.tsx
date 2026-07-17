'use client'

import { useDispatch, useSelector } from 'react-redux';
import { unviewGoal, editGoal, uneditGoal, deleteGoal } from '@/app/state/goals/goalSlice';
import { RootState } from '@/app/state/store'
import { CloseCircle } from 'iconsax-react'
import { useEffect, useRef } from 'react';
import LoadingButton from '../ui/LoadingButton';

type goal = {
    name: string
    day_started: string
    description:string
    due_date: string
    id: number
    status: number
    user_id:string
}

export default function Viewgoal(){
    const isVisible = useSelector( (state: RootState) => state.goal.view )
    const data: goal = useSelector( (state: RootState) => state.goal.data )
    const goalData = useRef({})
    const dispatch = useDispatch()

    function handleEdit(){
        dispatch( unviewGoal() )
        dispatch( uneditGoal() )
    }

    async function handleDelete(){
        dispatch( deleteGoal())
        // const req = await fetch('/api/removeGoal')
        console.log('goal removed');
    }
    useEffect(() => {
        goalData.current = data
    }, [data])
    
    return (
        <div className={`(viewGoal) ${ isVisible? 'visible': 'invisible' } rounded-lg shadow-lg p-6 z-30 flex flex-col w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
            <CloseCircle onClick={ () => dispatch(unviewGoal()) } className='ms-auto hover:text-red-500'/>
            <div>
                <div className="formgroup flex flex-col w-full">
                    <label htmlFor=""className='font-bold my-2 text-sm'>Goal:</label>
                    <p className='font-light text-sm text-gray-500 py-4 px-4' >{ data?.name }</p>
                </div>

                <div className="formgroup flex flex-col w-full">
                    <label htmlFor=""className='font-bold my-2 text-sm'>Description:</label>
                    <p className='font-light text-sm text-gray-500 py-4 px-4' >{ data?.description } </p>
                </div>

                <div className="formgroup flex flex-col w-1/2">
                    <label htmlFor=""className='font-bold my-2 text-sm'>Due Date:</label>
                    <p className='font-light text-sm text-gray-500 py-4 px-4' >{ (data?.due_date).toString().split('T')[0] }</p>
                </div>

                <div className="actions flex">
                    <LoadingButton className='bg-pes rounded-md text-white w-7/12 py-4 mt-6 me-2' onClick={ handleEdit }>Edit</LoadingButton>
                    <LoadingButton className='bg-red-500 rounded-md text-white w-4/12 py-4 mt-6' onClick={ handleDelete } >Delete</LoadingButton>
                </div>

            </div>
        </div>
    )
}
'use client'

import { useDispatch, useSelector } from 'react-redux';
import { editGoal, uneditGoal, deleteGoal } from '@/app/state/goals/goalSlice';
import { RootState } from '@/app/state/store'
import { CloseCircle } from 'iconsax-react'
import { useState } from 'react';
import jwt from 'jsonwebtoken'
import { successView } from '@/app/state/success/successSlice';
import { useRouter } from 'next/navigation';
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

export default function Editgoal(){
    const isVisible = useSelector( (state: RootState) => state.goal.edit )
    const data: goal = useSelector( (state: RootState) => state.goal.data )
    const dispatch = useDispatch()
    const router = useRouter()
    console.log('do this first')

    interface HandleChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

    interface EditGoalAction {
        payload: goal;
        type: string;
    }

    function handleChange(event: HandleChangeEvent) {
        dispatch(
            editGoal({
                payload: { ...data, [event.target.name]: event.target.value },
                type: 'edit'
            } as EditGoalAction)
        );
    }

    async function handleSubmit() {
        const token = localStorage.getItem('access_token')
        if (!token) {
            throw new Error('No access token found');
        }
        const user = jwt.decode(token)

        try {
            const response = await fetch('/api/updateGoals', {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({ ...data, user_id: user && typeof user === 'object' && 'name' in user ? (user as any).name : ''})
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${errorData}`);
                // dispatch( failureView())

            }
        
            const responseData = await response.json();
            dispatch( uneditGoal())
            dispatch( successView())
            console.log('Success:', responseData); 
            router.push('/goals')

        } catch (error) {
            console.error('Error:', error); 
        }
    }
    
    return (
        <div className={`notification ${ isVisible? 'visible': 'invisible' } rounded-sm shadow-lg p-12 z-30 flex flex-col w-4/12 bg-white absolute top-1/2 -translate-y-1/2`}>
            <CloseCircle onClick={ () => { dispatch( uneditGoal()) }} className='ms-auto hover:text-red-500'/>
            <div>
                <div className="formgroup flex flex-col w-full">
                    <label htmlFor=""className='font-bold my-2 text-sm'>Goal:</label>
                    <input type='text' name='name' className='font-light text-sm text-gray-500 py-4 px-4 border rounded-md placeholder:text-gray-700' value={ data?.name } onChange={ handleChange }/>
                </div>

                <div className="formgroup flex flex-col w-full">
                    <label htmlFor=""className='font-bold my-2 text-sm'>Description:</label>
                    <input type='text' name='description' className='font-light text-sm text-gray-500 py-4 px-4 border rounded-md placeholder:text-gray-700' value={ data?.description } onChange={ handleChange }/>
                </div>

                <div className="formgroup flex flex-col w-1/2">
                    <label htmlFor=""className='font-bold my-2 text-sm'>Due Date:</label>
                    <input type='date' name='status' className='font-light text-sm text-gray-500 py-4 px-4 border rounded-md placeholder:text-gray-700' onChange={ handleChange }/>
                </div>

                <div className="actions flex">
                    <LoadingButton className='bg-pes rounded-md text-white w-full py-4 mt-6 me-2' onClick={ handleSubmit }>Done</LoadingButton>
                </div>

            </div>
        </div>
    )
}
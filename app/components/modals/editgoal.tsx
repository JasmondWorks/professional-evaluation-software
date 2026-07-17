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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    interface HandleChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

    interface EditGoalAction {
        payload: goal;
        type: string;
    }

    function handleChange(event: HandleChangeEvent) {
        setError(''); // Clear error on change
        dispatch(
            editGoal({
                payload: { ...data, [event.target.name]: event.target.value },
                type: 'edit'
            } as EditGoalAction)
        );
    }

    async function handleSubmit() {
        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                setError('No access token found. Please log in again.');
                setIsSubmitting(false);
                return;
            }
            
            const user = jwt.decode(token)
            if (!user || typeof user !== 'object' || !('userID' in user)) {
                setError('Invalid user token. Please log in again.');
                setIsSubmitting(false);
                return;
            }

            // Validate data
            if (!data.name || !data.description || !data.due_date) {
                setError('Please fill in all required fields.');
                setIsSubmitting(false);
                return;
            }

            const response = await fetch('/api/updateGoals', {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({
                    ...data,
                    id: String(data.id), // schema expects a string id
                    user_id: String((user as any).userID),
                    token
                })
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Failed to update goal');
            }
        
            const responseData = await response.json();
            
            if (responseData.status === 200) {
                dispatch( uneditGoal())
                dispatch( successView())
                router.push('/goals')
            } else {
                setError('Failed to update goal. Please try again.');
            }

        } catch (error) {
            console.error('Goal update error:', error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    }
    
    // When hidden, pull all fields out of tab order
    const tabIdx = isVisible ? undefined : -1;

    return (
        <div className={`notification ${ isVisible? 'visible': 'invisible' } rounded-lg shadow-lg p-6 z-30 flex flex-col w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
            <CloseCircle 
                onClick={ () => { !isSubmitting && dispatch( uneditGoal()) }} 
                className={`ms-auto ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:text-red-500 cursor-pointer'}`}
                tabIndex={tabIdx}
            />
            {/* form wrapper so Enter key can submit and keyboard flow works */}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="formgroup flex flex-col w-full">
                    <label htmlFor="edit-name" className='font-bold my-2 text-sm'>Goal:</label>
                    <input 
                        type='text' 
                        name='name' 
                        id='edit-name'
                        className='font-light text-sm text-gray-500 py-4 px-4 border rounded-md placeholder:text-gray-700' 
                        value={ data?.name || '' } 
                        onChange={ handleChange }
                        disabled={isSubmitting}
                        tabIndex={isVisible ? 1 : -1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                document.getElementById('edit-description')?.focus();
                            }
                        }}
                    />
                </div>

                <div className="formgroup flex flex-col w-full">
                    <label htmlFor="edit-description" className='font-bold my-2 text-sm'>Description:</label>
                    <input 
                        type='text' 
                        name='description' 
                        id='edit-description'
                        className='font-light text-sm text-gray-500 py-4 px-4 border rounded-md placeholder:text-gray-700' 
                        value={ data?.description || '' } 
                        onChange={ handleChange }
                        disabled={isSubmitting}
                        tabIndex={isVisible ? 2 : -1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                document.getElementById('edit-due_date')?.focus();
                            }
                        }}
                    />
                </div>

                <div className="formgroup flex flex-col w-1/2">
                    <label htmlFor="edit-due_date" className='font-bold my-2 text-sm'>Due Date:</label>
                    <input 
                        type='date' 
                        name='due_date' 
                        id='edit-due_date'
                        className='font-light text-sm text-gray-500 py-4 px-4 border rounded-md placeholder:text-gray-700' 
                        value={data?.due_date ? new Date(data.due_date).toISOString().split('T')[0] : ''}
                        onChange={ handleChange }
                        min={new Date().toISOString().split('T')[0]}
                        disabled={isSubmitting}
                        tabIndex={isVisible ? 3 : -1}
                    />
                </div>

                <div className="actions flex">
                    <LoadingButton 
                        type='submit'
                        className='bg-pes rounded-md text-white w-full py-4 mt-6 me-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-900 transition-colors' 
                        disabled={isSubmitting}
                        tabIndex={isVisible ? 4 : -1}
                    >
                        {isSubmitting ? 'Updating...' : 'Done'}
                    </LoadingButton>
                </div>

            </form>
        </div>
    )
}
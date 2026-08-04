'use client'

import { useDispatch, useSelector } from 'react-redux';
import { editGoal, uneditGoal } from '@/app/state/goals/goalSlice';
import { RootState } from '@/app/state/store'
import { useState } from 'react';
import jwt from 'jsonwebtoken'
import { notify } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import { Modal } from '../ui/modal';
import { Field } from '../ui/field';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Alert } from '../ui/alert';
import { DateTimeInput } from '../ui/datetime-input';

type goal = {
    name: string
    day_started: string
    description: string
    due_date: string
    id: number
    status: number
    user_id: string
}

export default function Editgoal(){
    const isVisible = useSelector((state: RootState) => state.goal.edit)
    const data: goal = useSelector((state: RootState) => state.goal.data)
    const dispatch = useDispatch()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const close = () => dispatch(uneditGoal())

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setError('')
        dispatch(editGoal({ payload: { ...data, [event.target.name]: event.target.value }, type: 'edit' } as any))
    }

    async function handleSubmit() {
        setIsSubmitting(true);
        setError('');
        try {
            const token = getAccessToken()
            if (!token) { setError('No access token found. Please log in again.'); setIsSubmitting(false); return; }
            const user = jwt.decode(token)
            if (!user || typeof user !== 'object' || !('userID' in user)) { setError('Invalid user token. Please log in again.'); setIsSubmitting(false); return; }
            if (!data.name || !data.description || !data.due_date) { setError('Please fill in all required fields.'); setIsSubmitting(false); return; }

            const response = await apiFetch('/api/updateGoals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, id: String(data.id), user_id: String((user as any).userID), token })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Failed to update goal');
            }
            const responseData = await response.json();
            if (responseData.status === 200) {
                dispatch(uneditGoal())
                notify.success('Goal updated successfully')
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

    return (
        <Modal
            isOpen={isVisible}
            setIsOpen={(open) => { if (!open && !isSubmitting) close(); }}
            title="Edit goal"
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4">
                {error && <Alert tone="danger">{error}</Alert>}

                <Field label="Goal" required>
                    <Input name="name" value={data?.name || ''} onChange={handleChange} disabled={isSubmitting} required />
                </Field>
                <Field label="Description" required>
                    <Input name="description" value={data?.description || ''} onChange={handleChange} disabled={isSubmitting} required />
                </Field>
                <Field label="Due date" required>
                    <DateTimeInput
                        type="date"
                        name="due_date"
                        value={data?.due_date ? new Date(data.due_date).toISOString().split('T')[0] : ''}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        disabled={isSubmitting}
                        required
                    />
                </Field>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                        {isSubmitting ? 'Updating' : 'Save changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

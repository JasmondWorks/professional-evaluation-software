'use client'

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cancelDelete } from '@/app/state/goals/goalSlice';
import { RootState } from '@/app/state/store'
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import { Modal } from '../ui/modal';
import Button from '../ui/Button';

export default function Deletegoal(){
    const isVisible = useSelector((state: RootState) => state.goal.delete)
    const goalData = useSelector((state: RootState) => state.goal.data)
    const dispatch = useDispatch()
    const [deleting, setDeleting] = useState(false)
    const close = () => dispatch(cancelDelete())

    async function handleDelete() {
        setDeleting(true)
        try {
            const token = getAccessToken()
            const res = await apiFetch('/api/removeGoal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, goalId: goalData.id })
            })
            if (!res.ok) throw new Error('Failed to delete goal')
            dispatch(cancelDelete())
            window.location.reload()
        } catch (err) {
            console.error('Error deleting goal:', err)
            setDeleting(false)
        }
    }

    return (
        <Modal
            isOpen={isVisible}
            setIsOpen={(open) => { if (!open) close() }}
            title="Delete this goal?"
            footer={
                <>
                    <Button variant="secondary" onClick={close} disabled={deleting}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} loading={deleting} disabled={deleting}>
                        Delete goal
                    </Button>
                </>
            }
        >
            <p className="text-sm text-muted">
                This action is irreversible and removes all associated data — deleted goals
                cannot be recovered. If you&apos;re certain, click <strong className="text-body">Delete goal</strong>.
                Otherwise, click Cancel to keep it.
            </p>
        </Modal>
    )
}

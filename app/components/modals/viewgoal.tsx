'use client'

import { useDispatch, useSelector } from 'react-redux';
import { unviewGoal, uneditGoal, deleteGoal } from '@/app/state/goals/goalSlice';
import { RootState } from '@/app/state/store'
import { Modal } from '../ui/modal';
import Button from '../ui/Button';

type goal = {
    name: string
    day_started: string
    description: string
    due_date: string
    id: number
    status: number
    user_id: string
}

export default function Viewgoal(){
    const isVisible = useSelector((state: RootState) => state.goal.view)
    const data: goal = useSelector((state: RootState) => state.goal.data)
    const dispatch = useDispatch()

    function handleEdit(){
        dispatch(unviewGoal())
        dispatch(uneditGoal())
    }

    function handleDelete(){
        dispatch(deleteGoal())
    }

    const Row = ({ label, value }: { label: string; value?: string }) => (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
            <span className="text-sm text-strong">{value || '—'}</span>
        </div>
    )

    return (
        <Modal
            isOpen={isVisible}
            setIsOpen={(open) => { if (!open) dispatch(unviewGoal()); }}
            title="Goal details"
            footer={
                <>
                    <Button variant="secondary" onClick={handleEdit}>Edit</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <Row label="Goal" value={data?.name} />
                <Row label="Description" value={data?.description} />
                <Row label="Due date" value={data?.due_date ? String(data.due_date).split('T')[0] : undefined} />
            </div>
        </Modal>
    )
}

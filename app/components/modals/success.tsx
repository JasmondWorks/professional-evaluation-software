'use client'

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/state/store'
import { TickCircle } from 'iconsax-react'
import { successView } from '@/app/state/success/successSlice';
import { Modal } from '../ui/modal';
import Button from '../ui/Button';

export default function Success(){
    const isVisible = useSelector((state: RootState) => state.success.visible)
    const dispatch = useDispatch()
    const close = () => dispatch(successView())

    return (
        <Modal
            isOpen={isVisible}
            setIsOpen={(open) => { if (!open) close() }}
            title="Success"
            footer={<Button onClick={close}>Done</Button>}
        >
            <div className="flex flex-col items-center gap-3 py-2 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-success-50 text-success-600">
                    <TickCircle size={28} variant="Bold" />
                </span>
                <p className="text-sm text-muted">Your changes were saved successfully.</p>
            </div>
        </Modal>
    )
}

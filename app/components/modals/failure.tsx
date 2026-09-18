'use client'

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/state/store'
import { CloseCircle } from 'iconsax-react'
import { failureView } from '@/app/state/failure/failureSlice';
import { Modal } from '../ui/modal';
import Button from '../ui/Button';

export default function Failure(){
    const isVisible = useSelector((state: RootState) => state.failure.visible)
    const dispatch = useDispatch()
    const close = () => dispatch(failureView())

    return (
        <Modal
            isOpen={isVisible}
            setIsOpen={(open) => { if (!open) close() }}
            title="Something went wrong"
            footer={<Button onClick={close}>Done</Button>}
        >
            <div className="flex flex-col items-center gap-3 py-2 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-danger-50 text-danger-600">
                    <CloseCircle size={28} />
                </span>
                <p className="text-sm text-muted">
                    The action could not be completed. Please try again.
                </p>
            </div>
        </Modal>
    )
}

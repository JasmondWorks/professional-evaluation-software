'use client'

import { useDispatch, useSelector } from 'react-redux';
import { setNotificationView } from '@/app/state/setnotification/setNotificationSlice';
import { RootState } from '@/app/state/store'
import { notificationSentView } from '@/app/state/notificationsent/notificationSentSlice';
import { Send } from 'iconsax-react'
import { Modal } from '../ui/modal';
import { Field } from '../ui/field';
import Button from '../ui/Button';
import { DateTimeInput } from '../ui/datetime-input';

export default function SetNotification(){
    const isVisible = useSelector((state: RootState) => state.setNotification.visible)
    const dispatch = useDispatch()
    const close = () => dispatch(setNotificationView())

    function sendNotification(){
        dispatch(notificationSentView())
        dispatch(setNotificationView())
    }

    return (
        <Modal
            isOpen={isVisible}
            setIsOpen={(open) => { if (!open) close(); }}
            title="Set a deadline for entry"
            description="Pick the date and time the entry window should close."
            footer={
                <Button onClick={sendNotification}><Send size={18} /> Save changes</Button>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Date">
                    <DateTimeInput type="date" name="date" />
                </Field>
                <Field label="Time">
                    <DateTimeInput type="time" name="time" />
                </Field>
            </div>
        </Modal>
    )
}

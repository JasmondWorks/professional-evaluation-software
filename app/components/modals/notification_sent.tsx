'use client'

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/state/store";
import { Verify } from "iconsax-react";
import { notificationSentView } from "@/app/state/notificationsent/notificationSentSlice";
import { Modal } from '../ui/modal';
import Button from '../ui/Button';

export default function NotificationSent() {
  const isVisible = useSelector((state: RootState) => state.notificationSent.visible);
  const dispatch = useDispatch();
  const close = () => dispatch(notificationSentView());

  return (
    <Modal
      isOpen={isVisible}
      setIsOpen={(open) => { if (!open) close() }}
      title="Notification sent"
      footer={<Button href="/dashboard" onClick={close}>Back to dashboard</Button>}
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-pes-50 text-pes-700">
          <Verify size={32} variant="Bold" />
        </span>
        <p className="text-sm text-muted">Your notification was delivered to the recipients.</p>
      </div>
    </Modal>
  );
}

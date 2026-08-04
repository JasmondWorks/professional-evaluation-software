'use client'

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/state/store";
import { Verify } from "iconsax-react";
import { roleCreatedView } from "@/app/state/rolecreated/roleCreatedSlice";
import { Modal } from '../ui/modal';
import Button from '../ui/Button';

export default function RoleCreated() {
  const isVisible = useSelector((state: RootState) => state.roleCreated.visible);
  const dispatch = useDispatch();
  const close = () => dispatch(roleCreatedView());

  return (
    <Modal
      isOpen={isVisible}
      setIsOpen={(open) => { if (!open) close() }}
      title="Role created successfully"
      footer={<Button href="/em-database" onClick={close}>Back to roles &amp; permissions</Button>}
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-pes-50 text-pes-700">
          <Verify size={32} variant="Bold" />
        </span>
        <p className="text-sm text-muted">The new role and its permissions are ready to assign.</p>
      </div>
    </Modal>
  );
}

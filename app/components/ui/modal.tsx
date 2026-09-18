"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { cn } from "@/lib/utils";

/**
 * Easy-to-use Modal abstraction over the Dialog primitive.
 *
 * <Modal isOpen={open} setIsOpen={setOpen} title="Manage stress settings"
 *        description="Choose how to set the limits." footer={<Button…/>}>
 *   …body…
 * </Modal>
 */
export function Modal({
  isOpen,
  setIsOpen,
  title,
  description,
  children,
  footer,
  className,
  showClose = true,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showClose?: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={cn(className)} showClose={showClose}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

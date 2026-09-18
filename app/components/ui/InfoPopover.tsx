"use client";

import { useState, useRef, useEffect } from "react";
import { InfoCircle } from "iconsax-react";

export default function InfoPopover({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center ml-1.5 align-middle" ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="text-muted hover:text-pes transition-colors rounded-full focus:outline-none focus:text-pes"
        aria-label="More information"
      >
        <InfoCircle size={16} variant="Bulk" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 p-3 bg-gray-800 border border-gray-700 text-gray-50 text-xs rounded-xl shadow-2xl z-50 font-normal leading-relaxed">
          <div className="relative">
            {text}
            <div className="absolute -top-[17px] left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
}

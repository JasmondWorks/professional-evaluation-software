import { useSelector } from "react-redux";
import { RootState } from "@/app/state/store";
import { Verify } from "iconsax-react";
import Link from "next/link";

export default function NotificationSent() {
  const isVisible = useSelector(
    (state: RootState) => state.notificationSent.visible,
  );

  return (
    <div
      className={`notification ${isVisible ? "visible" : "invisible"} rounded-lg shadow-lg p-6 z-30 flex flex-col w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
    >
      <div className="flex flex-col">
        <Verify
          className="text-pes text-2xl mx-auto"
          size={100}
          variant="Bold"
        />
        <h1 className="font-bold mx-auto">Notification Sent Successfully</h1>
        <Link
          href="/dashboard"
          className="flex bg-pes rounded-md text-white w-fit px-8 py-3 mx-auto mt-4"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

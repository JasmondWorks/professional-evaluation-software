"use client"

import { CloseCircle } from "iconsax-react"
import { useDispatch, useSelector } from "react-redux"
import { notificationView } from "@/app/state/notification/notificationSlice"
import { RootState } from "@/app/state/store"
import { useEffect, useState } from "react"
import jwt from "jsonwebtoken"

type NotificationType = {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export default function Notification() {
  const isVisible = useSelector((state: RootState) => state.notification.visible)
  const dispatch = useDispatch()
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("access_token")
        if (!token) return
        const decoded = jwt.decode(token) as { name?: string; id?: number; org?: string }
        const org = decoded?.org
        console.log("what is the org?:", org, decoded)

        const res = await fetch(`/api/notifications?org=${org}`)
        const data = await res.json()
        if (data.notifications) {
          setNotifications(data.notifications)
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err)
      } finally {
        setLoading(false)
      }
    }

    if (isVisible) {
      fetchNotifications()
    }
  }, [isVisible])

  return (
    <div
      className={`${
        isVisible ? "visible" : "invisible"
      } logout rounded-sm shadow-lg bg-white w-96 max-h-[30rem] overflow-y-auto p-2 pt-1 z-20 flex flex-col absolute top-24 right-8`}
    >
      {/* Header */}
      <div className="flex justify-between m-2 mx-4">
        <p className="font-semibold">Notifications</p>
        <CloseCircle
          className="hover:text-red-400 cursor-pointer"
          onClick={() => dispatch(notificationView())}
        />
      </div>

      {/* Loading state */}
      {loading ? (
        <p className="text-center text-gray-400 p-4 animate-pulse">Loading notifications...</p>
      ) : notifications.length > 0 ? (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`content rounded-md p-3 mx-4 mb-3 flex flex-col text-sm ${
              n.is_read ? "bg-gray-100" : "bg-slate-50 border-l-4 border-blue-500"
            }`}
          >
            <h1 className="mb-1 font-bold">{n.title}</h1>
            <p>{n.message}</p>
            <span className="text-xs text-gray-400 mt-2">
              {new Date(n.created_at).toLocaleString()}
            </span>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400 p-4">No notifications yet</p>
      )}
    </div>
  )
}

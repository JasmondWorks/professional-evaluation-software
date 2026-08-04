"use client";

import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import Dimmer from "../components/dimmer";
import Newgoal from "../components/modals/newgoal";
import Editgoal from "../components/modals/editgoal";
import { Provider } from "react-redux";
import { store } from "../state/store";
import Deletegoal from "../components/modals/deletegoal";
import SetNotification from "../components/modals/setnotification";
import NotificationSent from "../components/modals/notification_sent";
import RoleCreated from "../components/modals/role_created";
import Viewgoal from "../components/modals/viewgoal";
import Failure from "../components/modals/failure";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [is_sidebar_active, setSideBarActive] = useState(false);

  const handleSideBar = () => {
    setSideBarActive(!is_sidebar_active);
  };

  return (
    <Provider store={store}>
      <div className="bg-canvas flex flex-row relative justify-center w-screen min-h-screen">
        <Dimmer />
        <SetNotification />
        <Failure />
        <Newgoal />
        <Editgoal />
        <Viewgoal />
        <Deletegoal />
        <NotificationSent />
        <RoleCreated />

        <Sidebar
          is_sidebar_active={is_sidebar_active}
          handleSideBar={handleSideBar}
        />
        <div className="flex flex-col flex-1 min-w-0 lg:pl-64">
          <Navbar
            is_sidebar_active={is_sidebar_active}
            handleSideBar={handleSideBar}
          />
          {children}
        </div>
      </div>
    </Provider>
  );
}

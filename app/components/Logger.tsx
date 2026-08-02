"use client";

import { useEffect } from "react";
import { getCurrentUser } from "../utils/auth";

export default function Logger(props: any) {
  useEffect(() => {
    const tokenData = getCurrentUser();
    
    if (Object.keys(props).length > 0) {
    }
  }, [props]);

  return null;
}

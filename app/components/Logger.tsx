"use client";

import { useEffect } from "react";
import { getCurrentUser } from "../utils/auth";

export default function Logger(props: any) {
  useEffect(() => {
    const tokenData = getCurrentUser();
    console.log("=== Logger Output ===");
    console.log("tokenData:", tokenData);
    
    if (Object.keys(props).length > 0) {
      console.log("passed values:", props);
    }
    console.log("=====================");
  }, [props]);

  return null;
}

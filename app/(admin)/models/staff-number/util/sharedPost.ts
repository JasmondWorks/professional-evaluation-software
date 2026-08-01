import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
export const saveResult = async (payload: any) => {
  const token = getAccessToken();

  const res = await apiFetch("/api/staffEstimation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("Saved:", data);
};

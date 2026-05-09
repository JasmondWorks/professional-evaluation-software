export const saveResult = async (payload: any) => {
  const token = localStorage.getItem("access_token");

  const res = await fetch("/api/staffEstimation", {
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

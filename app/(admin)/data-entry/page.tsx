"use client";

import { useEffect, useState } from "react";
import { EntrySection } from "../../components/EntrySection";
import { jwtDecode } from "jwt-decode";

export const dynamic = "force-dynamic";

const stress = [
  {
    label: "Staff Stress Category form",
    templateUrl: "/templates/stress_category.xlsx",
    formId: "/stress/stress-category",
  },
  {
    label: "Stress Theme/Feeling/Frequency form",
    templateUrl: "/templates/stress_theme.xlsx",
    formId: "/stress/stress-feeling",
  },
];

type EvaluationType = "appraisal" | "performance" | "stress";

export default function DataEntryPage() {
  const [open, setOpen] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationType[]>([]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const user = token ? jwtDecode<any>(token) : null;

  useEffect(() => {
    if (!user?.org) return;

    fetch(`/api/org/${encodeURIComponent(user.org)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res?.data?.evaluation) {
          alert(res.data.evaluation);
          console.log(alert(res.data.evaluation));
          setEvaluation(res.data.evaluation);
        }
      })
      .catch(console.error);
  }, [user?.org]);

  const go = (formId: string) => {
    window.location.href = `/data-entry/${formId}`;
  };

  const has = (key: EvaluationType) => evaluation.includes(key);

  return (
    <div className="w-full p-12">
      {/* AUDITOR */}
      {user?.role === "auditor" ? (
        <EntrySection
          to={"/data-entry/auditor"}
          title={"Staff data entries (Auditor)"}
        />
      ) : (
        <>
          {/* APPRAISAL */}
          <EntrySection
            to={"/data-entry/appraisal"}
            title={"Appraisal"}
            disabled={!has("appraisal")}
          />

          {/* PERFORMANCE */}
          <EntrySection
            to={"/data-entry/performance"}
            title={"Performance"}
            disabled={!has("performance")}
          />

          {/* STRESS */}
          <div className="bg-white rounded-md shadow mb-4">
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex justify-between items-center p-4"
            >
              <span className="text-lg font-semibold">Stress</span>
              <span className="text-sm">{open ? "v" : ">"}</span>
            </button>

            {open && (
              <div className="px-4 pb-3">
                {stress.map((it, i) => {
                  const active = true //has("stress");
                  return (
                    <div
                      key={`${it.formId}-${i}`}
                      className={`flex justify-between items-center py-2 border-t ${
                        !active ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <span className="text-sm">{it.label}</span>
                      <div className="flex gap-4">
                        <a
                          href={it.templateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`underline text-blue-600 ${
                            !active ? "pointer-events-none text-gray-400" : ""
                          }`}
                        >
                          Download Template
                        </a>
                        <button
                          className={`px-4 py-1 rounded text-white ${
                            active ? "bg-pes" : "bg-gray-400 cursor-not-allowed"
                          }`}
                          onClick={() => active && go(it.formId)}
                          disabled={!active}
                        >
                          Start Data Entry
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* HOD */}
      {user?.role === "hod" && (
        <>
          <EntrySection
            to={"/data-entry/employee"}
            title={"Staff data entries"}
          />
          <EntrySection
            to={"/data-entry/students"}
            title={"Student data entries"}
          />
        </>
      )}
    </div>
  );
}

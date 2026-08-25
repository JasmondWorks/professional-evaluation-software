"use client";

import { useEffect, useState } from "react";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import { SearchNormal1, Add, DocumentText, Setting2, CloseCircle, Buildings2, ClipboardText } from 'iconsax-react';
import { apiFetch } from '@/app/utils/apiFetch';
import { BackLink } from '@/app/components/ui';

export default function MaintenancePage() {
  const [toolView, setToolView] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(true);
  const [tools, setTools] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [facility, setFacility] = useState({
    description: "",
    symbol: "",
    location: "",
    id: "",
    type: "",
    rating: 0,
    remark: "",
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    event.preventDefault();
    setFacility((prev) => {
      return { ...prev, [event.target.name]: event.target.value };
    });
  }

  async function addFacility(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const access_token = getAccessToken();
    const decoded: any = jwt.decode(access_token as string);

    try {
      const req = await apiFetch("/api/addFacility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`
        },
        body: JSON.stringify({ data: facility }),
      });
      const res = await req.json();
      setMessage(res.message);
      
      if (res.status === 200) {
        setStatus(true);
        // Refresh the list after successful addition
        fetchTools();
      } else {
        setStatus(false);
      }
      
      setToolView(false);
      setDialog(true);
      setTimeout(() => setDialog(false), 4000);
      
    } catch (error) {
      console.error(error);
      setMessage("Network error occurred.");
      setStatus(false);
      setDialog(true);
      setTimeout(() => setDialog(false), 4000);
    } finally {
      setLoading(false);
    }
  }

  const fetchTools = async () => {
    const access_token = getAccessToken() as string;
    if (!access_token) return;
    const tokenData = jwt.decode(access_token) as JwtPayload;

    try {
      const req = await apiFetch("/api/getFacility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`
        }
      });
      const res = await req.json();
      if (Array.isArray(res)) {
        setTools(res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const filteredTools = tools.filter(tool => tool.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 w-full max-w-7xl mx-auto min-h-screen">
      
      {/* SUCCESS / ERROR TOAST */}
      {dialog && (
        <div className={`fixed top-8 right-8 z-50 p-4 rounded-lg shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-5 ${
          status ? "bg-green-50 border-green-200 text-green-800" : "bg-danger-50 border-danger-100 text-danger-700"
        }`}>
          {status ? <div className="w-2 h-2 rounded-full bg-green-500" /> : <div className="w-2 h-2 rounded-full bg-danger-600" />}
          <p className="font-medium text-sm">{message}</p>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="mb-4">
        <BackLink href="/dashboard">Back to Dashboard</BackLink>
      </div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-strong mb-2">Maintenance Management</h1>
        <p className="text-muted max-w-2xl text-sm">
          Track and manage your organization's tools and facilities. Add new assets to the inventory, set priority ratings, and monitor maintenance schedules.
        </p>
      </div>

      {/* CONTROL BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-line shadow-sm">
        <div className="relative grow w-full md:max-w-md">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted">
            <SearchNormal1 size="18" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any tool or facility..."
            className="pl-10 pr-4 py-2.5 bg-canvas border border-line rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-pes focus:bg-white transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setToolView(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-pes text-pes font-medium text-sm rounded-lg hover:bg-pes-50 transition-colors shadow-sm"
          >
            <Add size="18" />
            Add Facility
          </button>
          <Link
            href="/maintenance/inventory"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-pes text-white font-medium text-sm rounded-lg hover:bg-pes-800 transition-colors shadow-sm"
          >
            <DocumentText size="18" />
            View Inventory
          </Link>
        </div>
      </div>

      {/* INVENTORY LIST */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-strong flex items-center gap-2 mb-4">
          <Buildings2 size="20" className="text-muted" />
          Registered Facilities & Tools
          <span className="bg-canvas text-body px-2 py-0.5 rounded-full text-xs font-semibold ml-2">
            {filteredTools.length}
          </span>
        </h2>
        
        {filteredTools.length === 0 ? (
          <div className="bg-white rounded-xl border border-line p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mx-auto mb-4 text-muted">
              <ClipboardText size="32" variant="Bulk" />
            </div>
            <h3 className="text-lg font-medium text-strong mb-1">No items found</h3>
            <p className="text-muted text-sm">We couldn't find any tools or facilities matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((toolName, key) => (
              <Link
                key={key}
                href={`/maintenance/${toolName}`}
                className="group bg-white border border-line rounded-xl p-5 hover:border-pes hover:shadow-md transition-all flex flex-col items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-pes-50 text-pes flex items-center justify-center group-hover:bg-pes group-hover:text-white transition-colors">
                  <Setting2 size="20" variant="Bulk" />
                </div>
                <div className="w-full">
                  <h3 className="font-semibold text-strong group-hover:text-pes transition-colors line-clamp-1" title={toolName}>
                    {toolName}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted">View details</span>
                    <span className="text-pes opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ADD FACILITY MODAL */}
      {toolView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-line flex justify-between items-center bg-canvas/50">
              <div>
                <h2 className="text-lg font-bold text-strong">Add Tool or Facility</h2>
                <p className="text-xs text-muted mt-1">Register a new asset to the maintenance inventory.</p>
              </div>
              <button
                onClick={() => setToolView(false)}
                className="text-muted hover:text-body transition-colors p-2"
              >
                <CloseCircle size="24" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="add-facility-form" className="space-y-5" onSubmit={addFacility}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-body">Description</label>
                    <input
                      onChange={handleChange}
                      name="description"
                      type="text"
                      required
                      placeholder="e.g. Backup Generator 500kVA"
                      className="w-full px-4 py-2.5 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pes focus:bg-white transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-body">Identification Symbol</label>
                    <input
                      onChange={handleChange}
                      name="symbol"
                      type="text"
                      required
                      placeholder="e.g. GEN-01"
                      className="w-full px-4 py-2.5 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pes focus:bg-white transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-body">Location</label>
                    <input
                      onChange={handleChange}
                      name="location"
                      type="text"
                      required
                      placeholder="e.g. Server Room B"
                      className="w-full px-4 py-2.5 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pes focus:bg-white transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-body">Facility Register ID</label>
                    <input
                      onChange={handleChange}
                      name="id"
                      type="text"
                      required
                      placeholder="e.g. RE-2023-892"
                      className="w-full px-4 py-2.5 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pes focus:bg-white transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-body">Type</label>
                    <input
                      onChange={handleChange}
                      name="type"
                      type="text"
                      required
                      placeholder="e.g. Electrical"
                      className="w-full px-4 py-2.5 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pes focus:bg-white transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-body flex justify-between">
                      Priority Rating
                    </label>
                    <select
                      onChange={handleChange}
                      name="rating"
                      required
                      className="w-full px-4 py-2.5 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pes focus:bg-white transition-all"
                    >
                      <option value="">Select priority rating</option>
                      {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-sm font-semibold text-body">Remarks</label>
                    <input
                      onChange={handleChange}
                      name="remark"
                      type="text"
                      placeholder="Any additional notes..."
                      className="w-full px-4 py-2.5 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pes focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-line bg-canvas flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setToolView(false)}
                className="px-5 py-2.5 text-sm font-medium text-body bg-white border border-line rounded-lg hover:bg-canvas transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-facility-form"
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-pes rounded-lg hover:bg-pes-800 transition-colors shadow-sm flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  "Save Facility"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

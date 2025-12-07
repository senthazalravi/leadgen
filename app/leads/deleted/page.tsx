"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LeadStatus = "HOT" | "COLD" | "WARM" | "PROGRESS" | "COMPLETED" | "DISQUALIFIED";

type Lead = {
  id: number;
  name: string;
  country?: string | null;
  status: LeadStatus;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  website?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function DeletedLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/check");
      if (!res.ok) {
        router.push("/login");
      }
    };

    const fetchDeletedLeads = async () => {
      try {
        const res = await fetch("/api/leads/deleted");
        if (!res.ok) {
          setError("Failed to load deleted leads");
          return;
        }
        const data = await res.json();
        setLeads(data);
      } catch (err) {
        setError("Unexpected error while loading deleted leads");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchDeletedLeads();
  }, [router]);

  const handleRestore = async (id: number) => {
    setRestoringId(id);
    try {
      const res = await fetch(`/api/leads/${id}/restore`, { method: "POST" });
      if (!res.ok) {
        setError("Failed to restore lead");
        setRestoringId(null);
        return;
      }
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      setError("Unexpected error while restoring lead");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="text-indigo-600 font-semibold">
              Back to Dashboard
            </Link>
            <span className="text-lg font-bold text-gray-900">Deleted Leads</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="text-center py-8">Loading deleted leads...</div>
          ) : error ? (
            <div className="bg-white shadow-sm rounded-lg p-6 text-red-600">{error}</div>
          ) : leads.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-6 text-gray-600">
              No deleted leads.
            </div>
          ) : (
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 overflow-x-auto">
                <div className="max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Country</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Deleted At</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Notes</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                            {lead.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                            {lead.country}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                            {new Date(lead.updatedAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-gray-700 max-w-xs truncate">
                            {lead.notes}
                          </td>
                          <td className="px-4 py-2 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRestore(lead.id)}
                              disabled={restoringId === lead.id}
                              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                            >
                              {restoringId === lead.id ? "Restoring..." : "Re-enable"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

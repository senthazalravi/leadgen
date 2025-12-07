"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/leads/${id}`);
        if (!res.ok) {
          setError("Failed to load lead");
          return;
        }
        const data = await res.json();
        setLead(data);
      } catch (err) {
        setError("Unexpected error while loading lead");
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this lead?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Failed to delete lead");
        setDeleting(false);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError("Unexpected error while deleting lead");
      setDeleting(false);
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
            <span className="text-lg font-bold text-gray-900">Lead Details</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-6">Loading lead...</div>
        ) : error ? (
          <div className="bg-white shadow-sm rounded-lg p-6 text-red-600">{error}</div>
        ) : !lead ? (
          <div className="bg-white shadow-sm rounded-lg p-6">Lead not found.</div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{lead.name}</h1>
                {lead.country && (
                  <p className="text-sm text-gray-500">{lead.country}</p>
                )}
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {lead.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              {lead.phoneNumber && <p>📞 {lead.phoneNumber}</p>}
              {lead.whatsappNumber && <p>💬 {lead.whatsappNumber}</p>}
              {lead.website && (
                <p>
                  🌐
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline ml-1"
                  >
                    {lead.website}
                  </a>
                </p>
              )}
              {lead.notes && (
                <p className="mt-2 whitespace-pre-wrap">{lead.notes}</p>
              )}
              <p className="text-xs text-gray-400 mt-4">
                Created at: {new Date(lead.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Back
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Lead"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

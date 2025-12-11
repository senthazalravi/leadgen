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
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

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
        setEditedLead(data);
      } catch (err) {
        setError("Unexpected error while loading lead");
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleSave = async () => {
    if (!id || !editedLead) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedLead),
      });
      if (!res.ok) {
        setError("Failed to save lead");
        setSaving(false);
        return;
      }
      const updatedLead = await res.json();
      setLead(updatedLead);
      setEditedLead(updatedLead);
      setSaving(false);
    } catch (err) {
      setError("Unexpected error while saving lead");
      setSaving(false);
    }
  };

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
                <input
                  type="text"
                  value={editedLead.name}
                  onChange={(e) => setEditedLead({ ...editedLead, name: e.target.value })}
                  className="text-2xl font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-md p-1"
                />
                {editedLead.country && (
                  <input
                    type="text"
                    value={editedLead.country}
                    onChange={(e) => setEditedLead({ ...editedLead, country: e.target.value })}
                    className="text-sm text-gray-500 bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-md p-1"
                  />
                )}
              </div>
              <select
                value={editedLead.status}
                onChange={(e) => setEditedLead({ ...editedLead, status: e.target.value as LeadStatus })}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                <option value="HOT">HOT</option>
                <option value="COLD">COLD</option>
                <option value="WARM">WARM</option>
                <option value="PROGRESS">PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DISQUALIFIED">DISQUALIFIED</option>
              </select>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              {editedLead.phoneNumber && (
                <input
                  type="tel"
                  value={editedLead.phoneNumber}
                  onChange={(e) => setEditedLead({ ...editedLead, phoneNumber: e.target.value })}
                  className="bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-md p-1"
                  placeholder="Phone Number"
                />
              )}
              {editedLead.whatsappNumber && (
                <input
                  type="tel"
                  value={editedLead.whatsappNumber}
                  onChange={(e) => setEditedLead({ ...editedLead, whatsappNumber: e.target.value })}
                  className="bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-md p-1"
                  placeholder="WhatsApp Number"
                />
              )}
              {editedLead.website && (
                <input
                  type="url"
                  value={editedLead.website}
                  onChange={(e) => setEditedLead({ ...editedLead, website: e.target.value })}
                  className="bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-md p-1"
                  placeholder="Website"
                />
              )}
              {editedLead.notes && (
                <textarea
                  value={editedLead.notes}
                  onChange={(e) => setEditedLead({ ...editedLead, notes: e.target.value })}
                  className="mt-2 whitespace-pre-wrap p-2 border rounded-md"
                  placeholder="Notes"
                />
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
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
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

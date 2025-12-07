"use client";

import { useEffect, useState } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Lead, LeadStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await prisma.lead.findMany({
          orderBy: { createdAt: 'desc' }
        });
        setLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const cookieStore = cookies();
  const session = cookieStore.get('session');

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">LeadGen Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center">
              <form 
                action={async () => {
                  'use server';
                  cookies().delete('session');
                  redirect('/login');
                }}
                className="flex items-center"
              >
                <button 
                  type="submit" 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
            <Link 
              href="/leads/new" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Add New Lead
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading leads...</div>
          ) : (
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {leads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{lead.name}</h3>
                          <p className="text-sm text-gray-500">{lead.country}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lead.status === LeadStatus.HOT 
                            ? 'bg-red-100 text-red-800' 
                            : lead.status === LeadStatus.PROGRESS 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600">📞 {lead.phoneNumber}</p>
                        <p className="text-sm text-gray-600">💬 {lead.whatsappNumber}</p>
                        <p className="text-sm text-gray-600">🌐 <a 
                          href={lead.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Website
                        </a></p>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{lead.notes}</p>
                      </div>
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        <Link 
                          href={`/leads/${lead.id}`} 
                          className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
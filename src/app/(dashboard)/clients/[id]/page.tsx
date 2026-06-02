"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, User, Calendar, Clock } from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </Link>

      {/* Placeholder card */}
      <div className="card">
        <div className="flex flex-col items-center py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
            <User className="h-10 w-10 text-indigo-600" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">Client Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Client ID: <span className="font-mono text-gray-700">{id}</span>
          </p>

          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-6 py-4">
            <p className="text-sm font-medium text-amber-800">
              Client details coming soon
            </p>
            <p className="mt-1 text-xs text-amber-600">
              This page will show full client information, appointment history,
              and review history.
            </p>
          </div>

          {/* Feature previews */}
          <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <Calendar className="mx-auto h-6 w-6 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-700">Appointments</p>
              <p className="text-xs text-gray-500">History &amp; upcoming</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <Clock className="mx-auto h-6 w-6 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-700">Activity</p>
              <p className="text-xs text-gray-500">Recent interactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

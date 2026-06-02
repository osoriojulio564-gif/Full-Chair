"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  Settings,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";

const MESSAGE_TEMPLATES = [
  {
    name: "Appointment Confirmation",
    preview:
      "Hi {{name}}, your appointment for {{service}} on {{date}} at {{time}} has been confirmed. See you at {{salon}}!",
  },
  {
    name: "Appointment Reminder",
    preview:
      "Reminder: You have an appointment for {{service}} tomorrow at {{time}}. Reply CONFIRM to confirm or CANCEL to cancel.",
  },
  {
    name: "Review Request",
    preview:
      "Hi {{name}}, thank you for visiting {{salon}}! We'd love to hear your feedback. Please rate your experience: {{link}}",
  },
  {
    name: "Follow-up",
    preview:
      "Hi {{name}}, it's been a while since your last visit! Book your next {{service}} appointment and get 10% off: {{link}}",
  },
];

export default function WhatsAppPage() {
  const [config, setConfig] = useState({
    phoneNumberId: "",
    businessAccountId: "",
    accessToken: "",
    verifyToken: "",
  });
  const [showToken, setShowToken] = useState(false);
  const [automations, setAutomations] = useState({
    autoConfirm: false,
    sendReminders: true,
    reminderHours: "24",
    sendReviewRequests: false,
    sendFollowUps: false,
  });

  const isConfigured =
    config.phoneNumberId &&
    config.businessAccountId &&
    config.accessToken &&
    config.verifyToken;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="h-7 w-7 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            WhatsApp Integration
          </h1>
          <p className="text-sm text-gray-500">
            Manage WhatsApp messaging for your salon
          </p>
        </div>
      </div>

      {/* Config Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Configuration
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              isConfigured
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isConfigured ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            {isConfigured ? "Connected" : "Not Configured"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number ID
            </label>
            <input
              type="text"
              value={config.phoneNumberId}
              onChange={(e) =>
                setConfig({ ...config, phoneNumberId: e.target.value })
              }
              className="input-field"
              placeholder="e.g. 123456789012345"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Business Account ID
            </label>
            <input
              type="text"
              value={config.businessAccountId}
              onChange={(e) =>
                setConfig({ ...config, businessAccountId: e.target.value })
              }
              className="input-field"
              placeholder="e.g. 987654321098765"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={config.accessToken}
                onChange={(e) =>
                  setConfig({ ...config, accessToken: e.target.value })
                }
                className="input-field pr-10"
                placeholder="EAAxxxxxxx..."
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Verify Token
            </label>
            <input
              type="text"
              value={config.verifyToken}
              onChange={(e) =>
                setConfig({ ...config, verifyToken: e.target.value })
              }
              className="input-field"
              placeholder="Your custom verify token"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="btn-primary inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Save Config
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <button
              disabled={!isConfigured}
              className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Send Test Message
            </button>
            {!isConfigured && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white whitespace-nowrap shadow-lg">
                  Configure WhatsApp first
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            )}
          </div>
          <button className="btn-secondary inline-flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Send Reminders
          </button>
          <button className="btn-secondary inline-flex items-center gap-2">
            <Star className="h-4 w-4" />
            Send Review Requests
          </button>
        </div>
      </div>

      {/* Message Templates */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Message Templates
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {MESSAGE_TEMPLATES.map((template) => (
            <div
              key={template.name}
              className="rounded-lg border border-gray-200 p-4 hover:border-green-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  {template.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {template.preview}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Settings */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Automation Settings
          </h2>
        </div>
        <div className="space-y-5">
          {/* Auto-confirm bookings */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Auto-confirm bookings via WhatsApp
              </p>
              <p className="text-xs text-gray-500">
                Automatically send a confirmation message when a booking is made
              </p>
            </div>
            <button
              onClick={() =>
                setAutomations({
                  ...automations,
                  autoConfirm: !automations.autoConfirm,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                automations.autoConfirm ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  automations.autoConfirm ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Send reminders */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Send appointment reminders
              </p>
              <p className="text-xs text-gray-500">
                Remind clients before their appointment
              </p>
            </div>
            <div className="flex items-center gap-3">
              {automations.sendReminders && (
                <select
                  value={automations.reminderHours}
                  onChange={(e) =>
                    setAutomations({
                      ...automations,
                      reminderHours: e.target.value,
                    })
                  }
                  className="input-field w-auto py-1 text-sm"
                >
                  <option value="2">2h before</option>
                  <option value="12">12h before</option>
                  <option value="24">24h before</option>
                </select>
              )}
              <button
                onClick={() =>
                  setAutomations({
                    ...automations,
                    sendReminders: !automations.sendReminders,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  automations.sendReminders ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    automations.sendReminders
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Send review requests */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Send review requests after completion
              </p>
              <p className="text-xs text-gray-500">
                Ask clients to rate their experience after an appointment
              </p>
            </div>
            <button
              onClick={() =>
                setAutomations({
                  ...automations,
                  sendReviewRequests: !automations.sendReviewRequests,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                automations.sendReviewRequests ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  automations.sendReviewRequests
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Send follow-ups */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Send follow-up messages
              </p>
              <p className="text-xs text-gray-500">
                Reach out to clients who haven&apos;t visited in a while
              </p>
            </div>
            <button
              onClick={() =>
                setAutomations({
                  ...automations,
                  sendFollowUps: !automations.sendFollowUps,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                automations.sendFollowUps ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  automations.sendFollowUps
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

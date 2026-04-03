import React from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { IAlert } from '@/services/alertService';

interface AlertViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: IAlert | null;
}

const AlertViewModal: React.FC<AlertViewModalProps> = ({ isOpen, onClose, alert }) => {
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  if (!isOpen || !alert) return null;

  const severityColors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const targetIcons: Record<string, string> = {
    everyone: '👥',
    traveler: '🧳',
    admin: '👨‍💼',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        style={{ backgroundColor: primaryColor }}
        className="rounded-[20px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: textColor }} className="text-2xl font-bold font-poppins">
            Alert Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
              Title
            </label>
            <p style={{ color: textColor }} className="text-lg font-poppins">
              {alert.title}
            </p>
          </div>

          {/* Description */}
          {alert.description && (
            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Description
              </label>
              <p style={{ color: textColor }} className="text-base font-poppins whitespace-pre-wrap">
                {alert.description}
              </p>
            </div>
          )}

          {/* Severity and Target */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Severity
              </label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                  severityColors[alert.severity]
                }`}
              >
                {alert.severity}
              </span>
            </div>

            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Target
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl">{targetIcons[alert.target]}</span>
                <span style={{ color: textColor }} className="text-base capitalize font-poppins">
                  {alert.target}
                </span>
              </div>
            </div>
          </div>

          {/* Active Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Starts On
              </label>
              <p style={{ color: textColor }} className="text-base font-poppins">
                {new Date(alert.startsOn).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Ends On
              </label>
              <p style={{ color: textColor }} className="text-base font-poppins">
                {new Date(alert.endsOn).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Locations */}
          <div>
            <label style={{ color: textColor }} className="block text-sm font-semibold mb-3">
              Locations ({alert.locations.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {alert.locations.map((location) => (
                <span
                  key={location}
                  className="bg-[#00CAFF] text-white px-4 py-2 rounded-full text-sm font-poppins"
                >
                  {location}
                </span>
              ))}
            </div>
          </div>

          {/* Created On */}
          <div>
            <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
              Created On
            </label>
            <p style={{ color: textColor }} className="text-base font-poppins opacity-75">
              {new Date(alert.createdOn).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#00CAFF] text-white rounded-[15px] font-semibold hover:bg-[#00b8e0] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertViewModal;

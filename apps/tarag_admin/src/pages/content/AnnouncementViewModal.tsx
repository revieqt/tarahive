import React from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { formatDateToString } from '@/utils/formatDateToString';
import { BACKEND_URL } from '@/constants/Config';
import type { IAnnouncement } from '@/services/announcementService';

interface AnnouncementViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: IAnnouncement | null;
}

const AnnouncementViewModal: React.FC<AnnouncementViewModalProps> = ({ isOpen, onClose, announcement }) => {
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  if (!isOpen || !announcement) return null;

  // Construct full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    // If it's already a full URL, return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, prepend BACKEND_URL/uploads
    return `${BACKEND_URL}${imagePath}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        style={{ backgroundColor: primaryColor }}
        className="rounded-[20px] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: textColor }} className="text-2xl font-bold font-poppins">
            Announcement Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content - Responsive Layout */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
          {/* Left Column - Text Content (2/3 on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Title
              </label>
              <p style={{ color: textColor }} className="text-lg font-poppins">
                {announcement.title}
              </p>
            </div>

            {/* Alt Description */}
            {announcement.altDesc && (
              <div>
                <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                  Alt Description
                </label>
                <p style={{ color: textColor }} className="text-base font-poppins">
                  {announcement.altDesc}
                </p>
              </div>
            )}

            {/* Type */}
            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Type
              </label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  announcement.isExternal
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {announcement.isExternal ? 'External URL' : 'Internal Link'}
              </span>
            </div>

            {/* Link Path */}
            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                {announcement.isExternal ? 'URL' : 'Internal Path'}
              </label>
              <p style={{ color: textColor }} className="text-base font-poppins break-all">
                {announcement.linkPath}
              </p>
            </div>

            {/* Active Period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                  Starts On
                </label>
                <p style={{ color: textColor }} className="text-base font-poppins">
                  {formatDateToString(new Date(announcement.startsOn))}
                </p>
              </div>

              <div>
                <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                  Ends On
                </label>
                <p style={{ color: textColor }} className="text-base font-poppins">
                  {formatDateToString(new Date(announcement.endsOn))}
                </p>
              </div>
            </div>

            {/* Created On */}
            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Created On
              </label>
              <p style={{ color: textColor }} className="text-base font-poppins opacity-75">
                {new Date(announcement.createdOn).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Right Column - Image (1/3 on large screens, full width on small screens) */}
          {announcement.image && (
            <div className="lg:col-span-1">
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Image
              </label>
              <div className="w-full rounded-[15px] overflow-hidden border border-gray-300 aspect-[2/3]">
                <img 
                  src={BACKEND_URL + announcement.image} 
                  alt={announcement.altDesc} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
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

export default AnnouncementViewModal;

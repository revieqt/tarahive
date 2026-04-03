import { useState, useEffect, useRef } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSession } from '@/context/SessionContext';
import TextField from '@/components/TextField';
import DatePicker from '@/components/DatePicker';
import { getAnnouncements, deleteAnnouncement, updateAnnouncement, createAnnouncement } from '@/services/announcementService';
import type { CreateAnnouncementPayload, IAnnouncement } from '@/services/announcementService';
import { formatDateToString } from '@/utils/formatDateToString';
import AnnouncementModal from './AnnouncementModal';
import AnnouncementViewModal from './AnnouncementViewModal';

export default function AnnouncementsList() {
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const { session } = useSession();

  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<IAnnouncement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);

  const [viewingAnnouncement, setViewingAnnouncement] = useState<IAnnouncement | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const accessToken = session?.accessToken;

  const fetchAnnouncements = async (page: number = 1) => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const result = await getAnnouncements(
        accessToken,
        page,
        searchKey || undefined,
        filterDate ? new Date(filterDate) : undefined,
        filterDate ? new Date(filterDate) : undefined
      );

      setAnnouncements(result.announcements || []);
      setCurrentPage(result.pagination?.currentPage || 1);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalItems(result.pagination?.totalCount || 0);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey, filterDate]);

  useEffect(() => {
    if (accessToken) {
      fetchAnnouncements(currentPage);
    }
  }, [accessToken, currentPage, searchKey, filterDate]);

  const handleSaveAnnouncement = async (data: CreateAnnouncementPayload) => {
    if (!accessToken) return;

    try {
      setIsSubmitting(true);
      if (editingAnnouncement) {
        await updateAnnouncement(accessToken, editingAnnouncement._id, data);
      } else {
        await createAnnouncement(accessToken, data);
      }
      await fetchAnnouncements(currentPage);
      setEditingAnnouncement(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save announcement:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!accessToken || !confirm('Are you sure you want to delete this announcement?')) return;

    try {
      setDeleting(announcementId);
      await deleteAnnouncement(accessToken, announcementId);
      await fetchAnnouncements(currentPage);
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleEditAnnouncement = (announcement: IAnnouncement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleViewAnnouncement = (announcement: IAnnouncement) => {
    setViewingAnnouncement(announcement);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingAnnouncement(null);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:gap-2 mb-4">
        <div className="flex-1 relative" >
          <TextField
            placeholder="Search announcements..."
            value={searchKey}
            onChangeText={setSearchKey}
          />
          <div ref={filterRef} className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center transition-colors"
              title="Filter announcements"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {filterDate && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </button>

            {isFilterOpen && (
              <div
                style={{ backgroundColor: primaryColor }}
                className="absolute top-full mt-3 right-0 w-72 p-4 rounded-[10px] shadow-lg z-50 border border-white border-opacity-20"
              >
                <div className="space-y-4">
                  <div>
                    <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                      Filter by Date
                    </label>
                    <DatePicker
                      placeholder="Select date"
                      value={filterDate}
                      onChangeDate={setFilterDate}
                    />
                    <p style={{ color: textColor }} className="text-xs opacity-70 mt-2">
                      Shows announcements active on this date
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setFilterDate('');
                      setIsFilterOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-[10px] font-semibold hover:bg-gray-400 transition-colors text-sm"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleCreateAnnouncement}
          className="w-full md:w-auto h-12 px-4 py-2 bg-[#00CAFF] text-white rounded-[15px] font-semibold hover:bg-[#00b8e0] transition-colors"
        >
          + New Announcement
        </button>
      </div>

      <div className="rounded-[20px] overflow-hidden" >
        {loading ? (
          <div className="p-8 text-center" style={{ color: textColor }}>
            <p className="font-poppins">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center" style={{ color: textColor }}>
            <p className="font-poppins text-lg">No announcements found</p>
            <p className="opacity-70 mt-2">Create your first announcement to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `2px solid ${textColor}20` }}>
                  <th style={{ color: textColor }} className="px-6 py-4 text-left font-semibold">
                    Title
                  </th>
                  <th style={{ color: textColor }} className="px-6 py-4 text-left font-semibold">
                    Type
                  </th>
                  <th style={{ color: textColor }} className="px-6 py-4 text-left font-semibold">
                    Active Period
                  </th>
                  <th style={{ color: textColor }} className="px-6 py-4 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement._id} style={{ borderBottom: `1px solid ${textColor}10` }}>
                    <td style={{ color: textColor }} className="px-6 py-4 text-sm">
                      {announcement.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          announcement.isExternal
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {announcement.isExternal ? 'External' : 'Internal'}
                      </span>
                    </td>
                    <td style={{ color: textColor }} className="px-6 py-4 text-sm">
                      {formatDateToString(new Date(announcement.startsOn))} - {formatDateToString(new Date(announcement.endsOn))}
                    </td>
                    <td className="px-6 py-4 text-center space-x-3">
                      <button
                        onClick={() => handleViewAnnouncement(announcement)}
                        className="text-green-500 hover:text-green-700 font-semibold text-sm mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="text-[#00CAFF] hover:text-[#00b8e0] font-semibold text-sm mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                        disabled={deleting === announcement._id}
                        className="text-red-500 hover:text-red-700 font-semibold text-sm disabled:opacity-50"
                      >
                        {deleting === announcement._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{ color: textColor }}
            className="px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span style={{ color: textColor }} className="px-4 py-2 font-semibold">
            Page {currentPage} of {totalPages} ({totalItems} items)
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{ color: textColor }}
            className="px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveAnnouncement}
        announcement={editingAnnouncement}
        isLoading={isSubmitting}
      />

      <AnnouncementViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        announcement={viewingAnnouncement}
      />
    </>
  );
}


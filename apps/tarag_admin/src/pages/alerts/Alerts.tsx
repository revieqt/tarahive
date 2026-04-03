import { useThemeColor } from '@/hooks/useThemeColor';
import { useSession } from '@/context/SessionContext';
import TextField from '@/components/TextField';
import DropDownField from '@/components/DropDownField';
import DatePicker from '@/components/DatePicker';
import AlertInputModal from '@/pages/alerts/AlertInputModal';
import AlertViewModal from '@/pages/alerts/AlertViewModal';
import EmergencyMonitoring from '@/pages/alerts/EmergencyMonitoring';
import { getAlerts, deleteAlert, updateAlert, createAlert } from '@/services/alertService';
import type { CreateAlertPayload, IAlert } from '@/services/alertService';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDateToString } from '@/utils/formatDateToString';

export default function Alerts() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const { session } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'alerts', label: 'Alerts', path: '/alerts', content: 'alerts' },
    { id: 'emergency', label: 'Emergency Monitoring', path: '/alerts/emergency-monitoring', content: 'emergency' },
  ];

  const activeTab = tabs.find(tab => location.pathname === tab.path)?.id ?? 'alerts';

  // State
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [filterTarget, setFilterTarget] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<IAlert | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewingAlert, setViewingAlert] = useState<IAlert | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);

  const accessToken = session?.accessToken;

  // Fetch alerts
  const fetchAlerts = async (page: number = 1) => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const result = await getAlerts(
        accessToken,
        page,
        searchKey || undefined,
        filterTarget || undefined,
        filterSeverity || undefined,
        filterDate ? new Date(filterDate) : undefined
      );
      setAlerts(result.alerts);
      setCurrentPage(result.pagination.currentPage);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.totalItems);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFilterOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
          setIsFilterOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isFilterOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey, filterTarget, filterSeverity, filterDate]);

  useEffect(() => {
    if (accessToken) {
      fetchAlerts(currentPage);
    }
  }, [accessToken, currentPage, searchKey, filterTarget, filterSeverity, filterDate]);

  // Create/Update alert
  const handleSaveAlert = async (data: CreateAlertPayload) => {
    if (!accessToken) return;

    try {
      setIsSubmitting(true);
      if (editingAlert) {
        await updateAlert(accessToken, editingAlert._id, data);
      } else {
        await createAlert(accessToken, data);
      }
      await fetchAlerts(currentPage);
      setEditingAlert(null);
    } catch (error) {
      console.error('Failed to save alert:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete alert
  const handleDeleteAlert = async (alertId: string) => {
    if (!accessToken || !confirm('Are you sure you want to delete this alert?')) return;

    try {
      setDeleting(alertId);
      await deleteAlert(accessToken, alertId);
      await fetchAlerts(currentPage);
    } catch (error) {
      console.error('Failed to delete alert:', error);
    } finally {
      setDeleting(null);
    }
  };

  // Open modal for edit
  const handleEditAlert = (alert: IAlert) => {
    setEditingAlert(alert);
    setIsModalOpen(true);
  };

  // Open modal for view
  const handleViewAlert = (alert: IAlert) => {
    setViewingAlert(alert);
    setIsViewModalOpen(true);
  };

  // Open modal for create
  const handleCreateAlert = () => {
    setEditingAlert(null);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAlert(null);
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingAlert(null);
  };

  return (
    <div style={{ backgroundColor }} className="min-h-screen pt-2 md:p-6 md:pt-2">
      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Header */}
        <div className="mb-5 mx-5">
          <h1 style={{ color: textColor }} className="text-3xl font-bold font-poppins mb-2">
            Alerts
          </h1>
          <p style={{ color: textColor }} className="text-base opacity-70 font-poppins">
            Manage and broadcast alerts to users
          </p>
        </div>

        {/* Tabs */}
        <div 
          className="md:rounded-[10px] p-3 mb-6"
          style={{ 
            backgroundColor: `${primaryColor}`,
          }}
        >
          <div className="flex gap-8 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`pb-3 transition-colors relative ${
                  activeTab === tab.id
                    ? `text-white font-semibold`
                    : `text-gray-400 hover:text-gray-300`
                }`}
                style={
                  activeTab === tab.id
                    ? { color: '#00CAFF' }
                    : undefined
                }
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
                    style={{ backgroundColor: '#00CAFF' }}
                  ></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-2">
            {activeTab === 'alerts' && (
              <div style={{ backgroundColor: primaryColor }} className="rounded-[8px] p-3 min-h-96">
                {/* Top Bar - Search and Filters */}
                <div className="flex flex-col md:flex-row md:gap-2">
                  <div className="flex-1 w-full flex-shrink-0">
                    {/* Search with Filter inside */}
                    <div className="relative">
                      <TextField
                        placeholder="Search alerts..."
                        value={searchKey}
                        onChangeText={setSearchKey}
                      />
                      
                      {/* Filter Button Inside TextField */}
                      <div ref={filterRef} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <button
                          onClick={() => setIsFilterOpen(!isFilterOpen)}
                          className="relative flex items-center justify-center transition-colors"
                          title="Filter alerts"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>

                          {/* Red dot indicator */}
                          {(filterTarget || filterSeverity || filterDate) && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </button>

                        {/* Filter Dropdown */}
                        {isFilterOpen && (
                          <div
                            style={{ backgroundColor: primaryColor }}
                            className="absolute top-full mt-3 right-0 w-72 p-4 rounded-[10px] shadow-lg z-100"
                          >
                            <div className="space-y-4">
                              {/* Target Filter */}
                              <div>
                                <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                                  Target
                                </label>
                                <DropDownField
                                  placeholder="All Targets"
                                  value={filterTarget}
                                  onChangeValue={(value) => setFilterTarget(value as string)}
                                  options={[
                                    { label: 'All Targets', value: '' },
                                    { label: 'Everyone', value: 'everyone' },
                                    { label: 'Traveler', value: 'traveler' },
                                    { label: 'Admin', value: 'admin' },
                                  ]}
                                />
                              </div>

                              {/* Severity Filter */}
                              <div>
                                <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                                  Severity
                                </label>
                                <DropDownField
                                  placeholder="All Severity"
                                  value={filterSeverity}
                                  onChangeValue={(value) => setFilterSeverity(value as string)}
                                  options={[
                                    { label: 'All Severity', value: '' },
                                    { label: 'Low', value: 'low' },
                                    { label: 'Medium', value: 'medium' },
                                    { label: 'High', value: 'high' },
                                  ]}
                                />
                              </div>

                              {/* Date Filter */}
                              <div>
                                <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                                  Active Date
                                </label>
                                <DatePicker
                                  placeholder="Select date"
                                  value={filterDate}
                                  onChangeDate={setFilterDate}
                                />
                              </div>

                              {/* Clear Filters Button */}
                              <button
                                onClick={() => {
                                  setFilterTarget('');
                                  setFilterSeverity('');
                                  setFilterDate('');
                                  setIsFilterOpen(false);
                                }}
                                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-[10px] font-semibold hover:bg-gray-400 transition-colors text-sm"
                              >
                                Clear Filters
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateAlert}
                    className="w-full md:w-auto h-12 px-4 py-2 bg-[#00CAFF] text-white rounded-[15px] font-semibold hover:bg-[#00b8e0] transition-colors"
                  >
                    + New Alert
                  </button>
                </div>

                {/* Alerts List */}
                <div className="rounded-[20px] overflow-hidden">
                  {loading ? (
                    <div className="p-8 text-center" style={{ color: textColor }}>
                      <p className="font-poppins">Loading alerts...</p>
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="p-8 text-center" style={{ color: textColor }}>
                      <p className="font-poppins text-lg">No alerts found</p>
                      <p className="opacity-70 mt-2">Create your first alert to get started</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: `2px solid ${textColor}20` }}>
                            <th style={{ color: textColor }} className="px-6 py-4 text-left font-semibold w-1/3">
                              Title
                            </th>
                            <th style={{ color: textColor }} className="px-6 py-4 text-left font-semibold">
                              Target
                            </th>
                            <th style={{ color: textColor }} className="px-6 py-4 text-left font-semibold">
                              Severity
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
                          {alerts.map((alert) => (
                            <tr
                              key={alert._id}
                              style={{ borderBottom: `1px solid ${textColor}10` }}
                              className="hover:bg-opacity-50 transition-colors"
                            >
                              <td style={{ color: textColor }} className="px-6 py-4 text-sm">
                                {alert.title}
                              </td>
                              <td className="px-6 py-4">
                                <span style={{ color: textColor }} className="ml-2 text-sm capitalize">
                                  {alert.target}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span style={{ color: textColor }} className="ml-2 text-sm capitalize">
                                  {alert.severity}
                                </span>
                              </td>
                              <td style={{ color: textColor }} className="px-6 py-4 text-sm">
                                {formatDateToString(new Date(alert.startsOn))} - {formatDateToString(new Date(alert.endsOn))}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleViewAlert(alert)}
                                  className="text-green-500 hover:text-green-700 font-semibold text-sm mr-3"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleEditAlert(alert)}
                                  className="text-[#00CAFF] hover:text-[#00b8e0] font-semibold text-sm mr-3"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteAlert(alert._id)}
                                  disabled={deleting === alert._id}
                                  className="text-red-500 hover:text-red-700 font-semibold text-sm disabled:opacity-50"
                                >
                                  {deleting === alert._id ? 'Deleting...' : 'Delete'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pagination */}
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
              </div>
            )}

            {activeTab === 'emergency' && <EmergencyMonitoring />}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertInputModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveAlert}
        alert={editingAlert}
        isLoading={isSubmitting}
      />

      {/* Alert View Modal */}
      <AlertViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        alert={viewingAlert}
      />
    </div>
  );
}

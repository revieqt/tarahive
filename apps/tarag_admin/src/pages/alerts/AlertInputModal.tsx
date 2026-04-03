import React, { useState, useEffect } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import TextField from '@/components/TextField';
import DropDownField from '@/components/DropDownField';
import DatePicker from '@/components/DatePicker';
import type { IAlert, CreateAlertPayload } from '@/services/alertService';

interface AlertInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAlertPayload) => Promise<void>;
  alert?: IAlert | null;
  isLoading?: boolean;
}

const AlertInputModal: React.FC<AlertInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  alert,
  isLoading = false,
}) => {
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const [formData, setFormData] = useState<CreateAlertPayload>({
    title: '',
    description: undefined,
    severity: 'low',
    target: 'everyone',
    startsOn: new Date().toISOString().split('T')[0],
    endsOn: new Date().toISOString().split('T')[0],
    locations: [],
  });

  const [locationInput, setLocationInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (alert) {
      setFormData({
        title: alert.title,
        description: alert.description || undefined,
        severity: alert.severity,
        target: alert.target,
        startsOn: new Date(alert.startsOn).toISOString().split('T')[0],
        endsOn: new Date(alert.endsOn).toISOString().split('T')[0],
        locations: alert.locations,
      });
    } else {
      setFormData({
        title: '',
        description: undefined,
        severity: 'low',
        target: 'everyone',
        startsOn: new Date().toISOString().split('T')[0],
        endsOn: new Date().toISOString().split('T')[0],
        locations: [],
      });
    }
    setLocationInput('');
    setError('');
  }, [alert, isOpen]);

  const handleAddLocation = () => {
    if (locationInput.trim() && !formData.locations.includes(locationInput.trim())) {
      setFormData({
        ...formData,
        locations: [...formData.locations, locationInput.trim()],
      });
      setLocationInput('');
    }
  };

  const handleRemoveLocation = (location: string) => {
    setFormData({
      ...formData,
      locations: formData.locations.filter((loc) => loc !== location),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.locations.length === 0) {
      setError('At least one location is required');
      return;
    }

    if (new Date(formData.startsOn) > new Date(formData.endsOn)) {
      setError('Start date must be before end date');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save alert');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        style={{ backgroundColor: primaryColor }}
        className="rounded-[20px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: textColor }} className="text-2xl font-bold font-poppins">
            {alert ? 'Edit Alert' : 'Create New Alert'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-[10px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
              Title *
            </label>
            <TextField
              placeholder="Alert title"
              value={formData.title}
              onChangeText={(title) => setFormData({ ...formData, title })}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
              Description
            </label>
            <TextField
              placeholder="Alert description"
              value={formData.description || ''}
              onChangeText={(description) => setFormData({ ...formData, description })}
              multiline
              rows={3}
            />
          </div>

          {/* Severity and Target */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Severity *
              </label>
              <DropDownField
                placeholder="Select severity"
                value={formData.severity}
                onChangeValue={(severity) =>
                  setFormData({
                    ...formData,
                    severity: severity as 'low' | 'medium' | 'high',
                  })
                }
                options={[
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' },
                ]}
              />
            </div>

            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Target *
              </label>
              <DropDownField
                placeholder="Select target"
                value={formData.target}
                onChangeValue={(target) =>
                  setFormData({
                    ...formData,
                    target: target as 'everyone' | 'traveler' | 'admin',
                  })
                }
                options={[
                  { label: 'Everyone', value: 'everyone' },
                  { label: 'Traveler', value: 'traveler' },
                  { label: 'Admin', value: 'admin' },
                ]}
              />
            </div>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Starts On *
              </label>
              <DatePicker
                placeholder="Start date"
                value={typeof formData.startsOn === 'string' ? formData.startsOn : new Date(formData.startsOn).toISOString().split('T')[0]}
                onChangeDate={(startsOn) => setFormData({ ...formData, startsOn })}
              />
            </div>

            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Ends On *
              </label>
              <DatePicker
                placeholder="End date"
                value={typeof formData.endsOn === 'string' ? formData.endsOn : new Date(formData.endsOn).toISOString().split('T')[0]}
                onChangeDate={(endsOn) => setFormData({ ...formData, endsOn })}
              />
            </div>
          </div>

          {/* Locations */}
          <div>
            <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
              Locations * ({formData.locations.length})
            </label>
            <div className="flex gap-2 mb-3">
              <TextField
                placeholder="Add location"
                value={locationInput}
                onChangeText={setLocationInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLocation();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddLocation}
                disabled={!locationInput.trim()}
                className="px-4 py-3 bg-[#00CAFF] text-white rounded-[15px] font-semibold disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {/* Location Tags */}
            <div className="flex flex-wrap gap-2">
              {formData.locations.map((location) => (
                <div
                  key={location}
                  className="bg-[#00CAFF] text-white px-4 py-2 rounded-full flex items-center gap-2"
                >
                  <span>{location}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(location)}
                    className="text-white hover:text-gray-200 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{ backgroundColor: textColor, color: primaryColor }}
              className="flex-1 py-3 rounded-[15px] font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-[#00CAFF] text-white rounded-[15px] font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : alert ? 'Update Alert' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertInputModal;

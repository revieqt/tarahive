import { useState, useEffect } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import TextField from '@/components/TextField';
import DatePicker from '@/components/DatePicker';
import DropDownField from '@/components/DropDownField';
import type { CreateAnnouncementPayload, IAnnouncement } from '@/services/announcementService';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAnnouncementPayload) => Promise<void>;
  announcement: IAnnouncement | null;
  isLoading: boolean;
}

export default function AnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  announcement,
  isLoading,
}: AnnouncementModalProps) {
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [altDesc, setAltDesc] = useState('');
  const [isExternal, setIsExternal] = useState(false);
  const [linkPath, setLinkPath] = useState('');
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setImage(null);
      setImagePreview('');
      setAltDesc('');
      setIsExternal(false);
      setLinkPath('');
      setStartsOn('');
      setEndsOn('');
      return;
    }

    if (announcement) {
      // Populate form with existing announcement data
      setTitle(announcement.title);
      setImagePreview(announcement.image);
      setAltDesc(announcement.altDesc);
      setIsExternal(announcement.isExternal);
      setLinkPath(announcement.linkPath);
      setStartsOn(new Date(announcement.startsOn).toISOString().split('T')[0]);
      setEndsOn(new Date(announcement.endsOn).toISOString().split('T')[0]);
      setImage(null); // Reset image file, user can change it if needed
    } else {
      // Reset for new announcement
      setTitle('');
      setImage(null);
      setImagePreview('');
      setAltDesc('');
      setIsExternal(false);
      setLinkPath('');
      setStartsOn('');
      setEndsOn('');
    }
  }, [isOpen, announcement]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !startsOn || !endsOn) {
      alert('Please fill in all required fields');
      return;
    }

    const payload: CreateAnnouncementPayload = {
      title,
      altDesc,
      isExternal,
      linkPath,
      startsOn: new Date(startsOn),
      endsOn: new Date(endsOn),
      ...(image && { image }),
    };

    await onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        style={{ backgroundColor: primaryColor }}
        className="rounded-[20px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: textColor }} className="text-2xl font-bold font-poppins">
            {announcement ? 'Edit Announcement' : 'New Announcement'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
              Title
            </label>
            <TextField
              placeholder="Announcement title"
              value={title}
              onChangeText={setTitle}
            />
          </div>

          <div>
            <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
              Image
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 rounded-[15px] border border-gray-300 text-sm"
                />
              </div>
              {imagePreview && (
                <div className="w-24 h-36 rounded-[10px] overflow-hidden border border-gray-300">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
              Alt Description
            </label>
            <TextField
              placeholder="Alt description for image"
              value={altDesc}
              onChangeText={setAltDesc}
            />
          </div>

          <div>
            <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
              Link Type
            </label>
            <DropDownField
              placeholder="Select link type"
              value={isExternal ? 'external' : 'internal'}
              onChangeValue={(value) => setIsExternal(value === 'external')}
              options={[
                { label: 'Internal Link', value: 'internal' },
                { label: 'External URL', value: 'external' },
              ]}
            />
          </div>

          <div>
            <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
              {isExternal ? 'URL' : 'Internal Path'}
            </label>
            <TextField
              placeholder={isExternal ? 'https://example.com' : '/path/to/page'}
              value={linkPath}
              onChangeText={setLinkPath}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                Start Date
              </label>
              <DatePicker
                placeholder="Start date"
                value={startsOn}
                onChangeDate={setStartsOn}
              />
            </div>
            <div>
              <label style={{ color: textColor }} className="block text-sm font-semibold mb-2">
                End Date
              </label>
              <DatePicker
                placeholder="End date"
                value={endsOn}
                onChangeDate={setEndsOn}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-[15px] bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-[15px] bg-[#00CAFF] text-white font-semibold hover:bg-[#00b8e0] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Announcement'}
          </button>
        </div>
      </div>
    </div>
  );
}

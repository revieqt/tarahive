import { useThemeColor } from '@/hooks/useThemeColor';
import { useLocation, useNavigate } from 'react-router-dom';
import GradientBlobs from '@/components/GradientBlobs';

export default function Events() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 0, label: 'Events', path: '/events', content: null },
    { id: 1, label: 'Submissions', path: '/events/submissions', content: null },
  ];

  const activeTab = tabs.find(tab => location.pathname === tab.path)?.id ?? 0;


  return (
    <div style={{ backgroundColor }} className="min-h-screen pt-2 md:p-6 md:pt-2">
      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Header */}
        <div className="mb-5 mx-5">
          <h1 style={{ color: textColor }} className="text-3xl font-bold font-poppins mb-2">
            Events
          </h1>
          <p style={{ color: textColor }} className="text-base opacity-70 font-poppins">
            Manage system configurations and preferences.
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
            {activeTab === 0 && (
              <>
                
              </>
            )}

            {activeTab === 1 && (
              <>
                {/* Logs Content */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

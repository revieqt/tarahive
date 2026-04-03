import { useThemeColor } from '@/hooks/useThemeColor';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import { streamSystemHealth } from '@/services/systemService';
import { useState, useRef, useEffect } from 'react';

export default function System() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useSession();
  const consoleRef = useRef<HTMLDivElement>(null);
  
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState({ passed: 0, failed: 0, warnings: 0 });
  const cleanupRef = useRef<() => void>(() => {});

  const tabs = [
    { id: 0, label: 'Health', path: '/system', content: null },
    { id: 1, label: 'Logs', path: '/system/logs', content: null },
    { id: 2, label: 'RBAC', path: '/system/rbac', content: null },
  ];

  const activeTab = tabs.find(tab => location.pathname === tab.path)?.id ?? 0;

  const handleRunHealthCheck = () => {
    if (!session?.accessToken) {
      setLogs(['❌ Error: No authentication token available']);
      return;
    }

    setLogs(['Starting system health check...']);
    setIsRunning(true);
    setShowSummary(false);
    setSummary({ passed: 0, failed: 0, warnings: 0 });

    const handleMessage = (message: string) => {
      setLogs((prevLogs) => [...prevLogs, message]);
      
      // Check if this is the completion message
      if (message.includes('completed')) {
        setIsRunning(false);
        // Generate summary from logs
        generateSummary();
      }
    };

    const handleError = (error: string) => {
      setLogs((prevLogs) => [...prevLogs, `❌ Error: ${error}`]);
      setIsRunning(false);
      generateSummary();
    };

    // Start the health check stream
    cleanupRef.current = streamSystemHealth(session.accessToken, handleMessage, handleError);
  };

  const generateSummary = () => {
    setShowSummary(true);
    
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    logs.forEach((log) => {
      if (log.includes('✅')) {
        passed++;
      } else if (log.includes('❌')) {
        failed++;
      } else if (log.includes('⚠️')) {
        warnings++;
      }
    });

    setSummary({ passed, failed, warnings });
  };

  // Update summary whenever logs change
  useEffect(() => {
    if (logs.length > 0) {
      generateSummary();
    }
  }, [logs]);

  const handleStopHealthCheck = () => {
    cleanupRef.current();
    setLogs((prevLogs) => [...prevLogs, '⏹️ Health check stopped by user']);
    setIsRunning(false);
  };

  // Scroll to bottom when logs update
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current();
    };
  }, []);


  return (
    <div style={{ backgroundColor }} className="min-h-screen pt-2 md:p-6 md:pt-2">
      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Header */}
        <div className="mb-5 mx-5">
          <h1 style={{ color: textColor }} className="text-3xl font-bold font-poppins mb-2">
            System Management
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
              <div style={{ backgroundColor: primaryColor }} className="rounded-[8px] p-3 min-h-96 space-y-4">
                {/* Health Check Controls */}
                <div className="flex flex-col md:flex-row gap-3 md:justify-end">
                  <div className="flex gap-3 flex-col md:flex-row w-full md:w-auto">
                    {!isRunning && 
                      <button
                        onClick={handleRunHealthCheck}
                        disabled={isRunning}
                        className="w-full md:w-auto px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 text-white"
                        style={{ backgroundColor: '#00CAFF' }}
                      >
                        Run Health Check
                      </button>
                    }
                    
                    {isRunning && (
                      <button
                        onClick={handleStopHealthCheck}
                        className="w-full md:w-auto px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-80 text-white"
                        style={{ backgroundColor: '#ef4444' }}
                      >
                        Stop
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`summary-item rounded-lg p-4 text-center backdrop-blur-sm border transition-all ${showSummary ? 'opacity-100' : 'opacity-50'}`}
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      borderColor: 'rgba(34, 197, 94, 0.4)',
                    }}
                  >
                    <div className="text-3xl font-bold text-green-400">{summary.passed}</div>
                    <div style={{ color: textColor }} className="text-sm opacity-70 mt-1">
                      Passed
                    </div>
                  </div>

                  <div
                    className={`summary-item rounded-lg p-4 text-center backdrop-blur-sm border transition-all ${showSummary ? 'opacity-100' : 'opacity-50'}`}
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    <div className="text-3xl font-bold text-red-400">{summary.failed}</div>
                    <div style={{ color: textColor }} className="text-sm opacity-70 mt-1">
                      Failed
                    </div>
                  </div>

                  <div
                    className={`summary-item rounded-lg p-4 text-center backdrop-blur-sm border transition-all ${showSummary ? 'opacity-100' : 'opacity-50'}`}
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      borderColor: 'rgba(245, 158, 11, 0.4)',
                    }}
                  >
                    <div className="text-3xl font-bold text-amber-400">{summary.warnings}</div>
                    <div style={{ color: textColor }} className="text-sm opacity-70 mt-1">
                      Warnings
                    </div>
                  </div>
                </div>

                {/* Console Display */}
                <div
                  ref={consoleRef}
                  style={{
                    backgroundColor: primaryColor,
                    color: textColor,
                  }}
                  className="rounded-lg border p-4 h-96 overflow-y-auto font-mono text-sm"
                >
                  {logs.length === 0 ? (
                    <div className="opacity-50">Click "Run Health Check" to start...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap break-words mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <>
                {/* Logs Content */}
              </>
            )}

            {activeTab === 2 && (
              <>
                {/* RBAC Content */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

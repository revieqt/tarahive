import { useThemeColor } from '@/hooks/useThemeColor';

export default function EmergencyMonitoring() {
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <div style={{ backgroundColor: primaryColor }} className="rounded-[8px] p-3 min-h-96">
      <div className="text-center">
        <h2 style={{ color: textColor }} className="text-2xl font-bold font-poppins mb-4">
          Emergency Monitoring
        </h2>
        <p style={{ color: textColor }} className="opacity-70 font-poppins">
          Emergency monitoring features coming soon...
        </p>
      </div>
    </div>
  );
}

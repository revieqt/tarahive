export const EMERGENCY_TYPES = [
  { id: 'medical', icon: 'medical-bag', color: '#C2185B', labelKey: 'sos.emergency_types.medical' },
  { id: 'criminal', icon: 'shield-alert', color: '#512DA8', labelKey: 'sos.emergency_types.criminal' },
  { id: 'fire', icon: 'fire', color: '#E65100', labelKey: 'sos.emergency_types.fire' },
  { id: 'natural', icon: 'weather-hurricane', color: '#00796B', labelKey: 'sos.emergency_types.natural' },
  { id: 'utility', icon: 'flash-off', color: '#827717', labelKey: 'sos.emergency_types.utility' },
  { id: 'road', icon: 'car', color: '#1565C0', labelKey: 'sos.emergency_types.road' },
  { id: 'domestic', icon: 'home-alert', color: '#7B1FA2', labelKey: 'sos.emergency_types.domestic' },
  { id: 'animal', icon: 'paw', color: '#2E7D32', labelKey: 'sos.emergency_types.animal' },
  { id: 'other', icon: 'help-circle', color: '#546E7A', labelKey: 'sos.emergency_types.other' },
];

export type EmergencyType = typeof EMERGENCY_TYPES[number];

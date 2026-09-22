export const EMERGENCY_TYPES = [
  { id: 'medical', icon: 'medical-bag', labelKey: 'sos.emergency_types.medical' },
  { id: 'criminal', icon: 'shield-alert', labelKey: 'sos.emergency_types.criminal' },
  { id: 'fire', icon: 'fire', labelKey: 'sos.emergency_types.fire' },
  { id: 'natural', icon: 'weather-hurricane', labelKey: 'sos.emergency_types.natural' },
  { id: 'utility', icon: 'flash-off', labelKey: 'sos.emergency_types.utility' },
  { id: 'road', icon: 'car', labelKey: 'sos.emergency_types.road' },
  { id: 'domestic', icon: 'home-alert', labelKey: 'sos.emergency_types.domestic' },
  { id: 'animal', icon: 'paw', labelKey: 'sos.emergency_types.animal' },
  { id: 'other', icon: 'help-circle', labelKey: 'sos.emergency_types.other' },
];

export type EmergencyType = typeof EMERGENCY_TYPES[number];

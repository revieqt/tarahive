// export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ; 
// export const BACKEND_URL = 'http://192.168.68.103:5000' ; 
export const BACKEND_URL = 'https://api.tarag.space' ; 
export const SUPPORT_FORM_URL = 'https://forms.gle/PPqT7Sy2JNY5NH2c6';
export const TRAVELLER_PRO_PRICE = 4.99;

export const DEFAULT_AREA_CODES = [
  { label: '🇵🇭 +63', value: '+63' },   // Philippines
  { label: '🇺🇸 +1', value: '+1' },     // United States
  { label: '🇨🇦 +1', value: '+1-CA' },  // Canada (same code as US)
  { label: '🇬🇧 +44', value: '+44' },   // United Kingdom
  { label: '🇮🇳 +91', value: '+91' },   // India
  { label: '🇦🇺 +61', value: '+61' },   // Australia
  { label: '🇳🇿 +64', value: '+64' },   // New Zealand
  { label: '🇸🇬 +65', value: '+65' },   // Singapore
  { label: '🇲🇾 +60', value: '+60' },   // Malaysia
  { label: '🇮🇩 +62', value: '+62' },   // Indonesia
  { label: '🇹🇭 +66', value: '+66' },   // Thailand
  { label: '🇻🇳 +84', value: '+84' },   // Vietnam
  { label: '🇭🇰 +852', value: '+852' }, // Hong Kong
  { label: '🇨🇳 +86', value: '+86' },   // China
  { label: '🇯🇵 +81', value: '+81' },   // Japan
  { label: '🇰🇷 +82', value: '+82' },   // South Korea
  { label: '🇩🇪 +49', value: '+49' },   // Germany
  { label: '🇫🇷 +33', value: '+33' },   // France
  { label: '🇮🇹 +39', value: '+39' },   // Italy
  { label: '🇪🇸 +34', value: '+34' },   // Spain
  { label: '🇸🇪 +46', value: '+46' },   // Sweden
  { label: '🇳🇴 +47', value: '+47' },   // Norway
  { label: '🇩🇰 +45', value: '+45' },   // Denmark
  { label: '🇳🇱 +31', value: '+31' },   // Netherlands
  { label: '🇧🇪 +32', value: '+32' },   // Belgium
  { label: '🇨🇭 +41', value: '+41' },   // Switzerland
  { label: '🇧🇷 +55', value: '+55' },   // Brazil
  { label: '🇲🇽 +52', value: '+52' },   // Mexico
  { label: '🇦🇷 +54', value: '+54' },   // Argentina
  { label: '🇨🇱 +56', value: '+56' },   // Chile
  { label: '🇳🇬 +234', value: '+234' }, // Nigeria
  { label: '🇪🇬 +20', value: '+20' },   // Egypt
  { label: '🇿🇦 +27', value: '+27' },   // South Africa
  { label: '🇹🇷 +90', value: '+90' },   // Turkey
  { label: '🇸🇦 +966', value: '+966' }, // Saudi Arabia
  { label: '🇦🇪 +971', value: '+971' }, // UAE
];


export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  { label: 'Other', value: 'other' },
];

export const TARA_MESSAGES = [
  "Ready for your next adventure? ",
  "Let's explore something new today! ",
  "I'm here to help you travel smarter! ",
  "Planning a trip? I've got you covered! ",
  "Adventure awaits - where shall we go? ",
  "Need travel tips? Just ask me! ",
  "Let's make your journey unforgettable! ",
  "Discover amazing places with me! ",
  "Your travel companion is ready! ",
  "Time to create new memories! ",
  "Every journey starts with a single step! ",
  "Let's turn your travel dreams into reality! ",
  "I'm excited to help you explore! ",
  "Ready to discover hidden gems? ",
  "Your next adventure is just a tap away! "
];

export const TARA_AI_SUGGESTIONS = [
  "What are some must-visit spots in Lapu-Lapu City?",
  "Plan a 3-day itinerary for Cebu",
  "What are the best beaches in Cebu?",
];

export const LIKES = [
  "Nature", "Outdoors", "City Life", "Culture", "History", "Arts", 
  "Water Activities", "Adventure", "Camping", "Relaxation", "Wellness", 
  "Social", "Aesthetics", "Events", "Entertainment"
];

export const PREDEFINED_WEATHER_ALERTS = {
  'thunderstorm': {
    title: 'Thunderstorm',
    type: 'thunderstorm',
    weatherCodes: [95, 96, 97, 98, 99],
    temperature: [null, null],
    wind: [null, null],
    description: [
      "• Seek shelter immediately in a sturdy building or hard-topped vehicle",
      "• Stay away from windows, doors, and electrical appliances",
      "• Avoid using corded phones or taking showers during the storm",
      "• If caught outdoors, crouch low in an open area away from trees and metal objects",
      "• Wait 30 minutes after the last thunder before resuming outdoor activities"
    ]
  },
  'rain': {
    title: 'Rain',
    type: 'rain',
    weatherCodes: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 80, 81, 82],
    temperature: [null, null],
    wind: [null, null],
    description: [
      "• Carry a sturdy umbrella and wear waterproof clothing",
      "• Avoid driving through puddles or flooded roads - turn around, don't drown",
      "• Keep car headlights on for better visibility",
      "• Stay away from storm drains and low-lying areas prone to flooding",
      "• Have indoor backup plans for outdoor activities"
    ]
  },
  'drizzle': {
    title: 'Drizzle',
    type: 'drizzle',
    weatherCodes: [45, 48, 3],
    temperature: [null, null],
    wind: [null, null],
    description: [
      "• Use an umbrella or light rain jacket to stay dry",
      "• Drive slowly and increase following distance on wet roads",
      "• Be extra cautious on bridges, overpasses, and shaded areas that may be slippery",
      "• Wear shoes with good traction to prevent slipping",
      "• Allow extra time for travel as visibility may be reduced"
    ]
  },
  'snow': {
    title: 'Snow',
    type: 'snow',
    weatherCodes: [71, 72, 73, 74, 75, 76, 77, 85, 86],
    temperature: [-50, 0],
    wind: [null, null],
    description: [
      "• Clear snow from vehicle windows, lights, and exhaust pipe before driving",
      "• Keep an emergency kit in your car with blankets, food, and water",
      "• Walk slowly and wear shoes with good traction to prevent falls",
      "• Shovel snow frequently rather than waiting for heavy accumulation",
      "• Dress warmly in layers and cover all exposed skin when going outside"
    ]
  },
  'extreme-heat': {
    title: 'Extreme Heat',
    type: 'extreme-heat',
    weatherCodes: [],
    temperature: [35, 100],
    wind: [null, null],
    description: [
      "• Drink plenty of water throughout the day, even if you don't feel thirsty",
      "• Wear light-colored, loose-fitting clothing and a wide-brimmed hat",
      "• Seek shade or air-conditioned spaces during peak hours (10am-4pm)",
      "• Avoid strenuous outdoor activities during the hottest part of the day",
      "• Watch for signs of heat exhaustion: dizziness, nausea, or excessive sweating"
    ]
  },
  'cold-temp': {
    title: 'Cold Temperature',
    type: 'cold-temp',
    weatherCodes: [],
    temperature: [-50, 0],
    wind: [null, null],
    description: [
      "• Dress in layers to trap warm air and stay dry",
      "• Wear insulated, waterproof boots and warm gloves",
      "• Cover exposed skin to prevent frostbite, especially fingers and toes",
      "• Keep your home heated and check on elderly neighbors",
      "• Have emergency heating sources and warm blankets available"
    ]
  },
  'strong-wind': {
    title: 'Strong Wind',
    type: 'strong-wind',
    weatherCodes: [],
    temperature: [null, null],
    wind: [40, 200],
    description: [
      "• Secure or bring indoors any loose outdoor items like furniture or decorations",
      "• Avoid parking under trees or near tall structures that could fall",
      "• Drive carefully and be prepared for sudden gusts that can affect vehicle control",
      "• Stay away from windows and glass doors during peak wind periods",
      "• Postpone outdoor activities like hiking or cycling until winds subside"
    ]
  }
};
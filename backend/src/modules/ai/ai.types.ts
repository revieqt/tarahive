import { IAddress } from "../itinerary/itinerary.model";

// ============= INTENT DETECTION =============
export type IntentType = 'chat' | 'itinerary';

export interface IntentDetection {
  intent: IntentType;
  confidence: number; // 0-1
  tags?: string[]; // For future extensibility
}

// ============= UNIFIED RESPONSE FORMAT =============
export interface UnifiedAIResponse {
  success: boolean;
  message: string; // Display message to user
  type: 'chat' | 'itinerary';
  json?: any; // Optional JSON for itinerary creation
}

// ============= CHAT TYPES =============
export interface PredefinedResponse {
  intent: string;
  keywords: string[];
  response: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationContext {
  userId: string;
  messages: ChatMessage[];
  createdAt: number;
  lastUpdated: number;
}

// ============= ITINERARY TYPES =============
export interface AIItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
  planDaily: boolean;
  interests?: string[];
}

export interface AILocation {
  latitude: number;
  longitude: number;
  locationName: string;
  address?: IAddress;
  note: string;
}

export interface AIDailyItinerary {
  date: string;
  locations: AILocation[];
}

export interface AIItineraryResponse {
  title: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  planDaily: boolean;
  locations: AILocation[] | AIDailyItinerary[];
}

// ============= ITINERARY GATHERING CONTEXT =============
export interface ItineraryGatheringContext {
  userId: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  planDaily?: boolean;
  interests?: string[];
  messages: ChatMessage[];
  createdAt: number;
  lastUpdated: number;
}
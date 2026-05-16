import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { BACKEND_URL } from '@/constants/Config';

const API_URL = `${BACKEND_URL}/api/announcements`;

export interface Announcement {
  _id: string;
  title: string;
  image: string;
  altDesc: string;
  isExternal: boolean;
  linkPath: string;
}

/**
 * Fetch today's announcements from the backend
 */
async function fetchTodaysAnnouncements(): Promise<Announcement[]> {
  try {
    console.log('[Announcements] 🚀 Fetching announcements from backend');
    
    const response = await fetch(`${API_URL}/today`);
    
    if (!response.ok) {
      console.error('[Announcements] ❌ Failed to fetch announcements:', response.statusText);
      return [];
    }
    
    const data = await response.json();
    const announcements = data.data || [];
    
    console.log(`[Announcements] ✅ Received ${announcements.length} announcements`);
    return announcements;
  } catch (error) {
    console.error('[Announcements] ❌ Error fetching announcements:', error);
    return [];
  }
}

interface UseAnnouncementReturn {
  announcements: Announcement[];
  currentAnnouncement: Announcement | null;
  isLoading: boolean;
  isError: boolean;
  handleNextAnnouncement: () => void;
  resetAnnouncements: () => void;
}

/**
 * Custom hook to manage announcement fetching and display logic
 * - Fetches announcements with 6-hour cache using React Query
 * - Manages which announcement to display
 * - Handles progression through announcements
 */
export function useAnnouncement(): UseAnnouncementReturn {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch announcements with 6-hour cache (6 * 60 * 60 * 1000 = 21600000 ms)
  const { data: announcements = [], isLoading, isError } = useQuery({
    queryKey: ['announcements-today'],
    queryFn: fetchTodaysAnnouncements,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    gcTime: 6 * 60 * 60 * 1000,    // 6 hours (formerly cacheTime)
  });

  // Get the current announcement based on index
  const currentAnnouncement: Announcement | null =
    currentIndex < announcements.length ? announcements[currentIndex] : null;

  // Move to the next announcement
  const handleNextAnnouncement = useCallback(() => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, []);

  // Reset to the first announcement
  const resetAnnouncements = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  return {
    announcements,
    currentAnnouncement,
    isLoading,
    isError,
    handleNextAnnouncement,
    resetAnnouncements,
  };
}

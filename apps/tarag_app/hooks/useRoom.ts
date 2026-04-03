import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRooms as getRoomsService,
  getSpecificRoom as getSpecificRoomService,
  createRoom as createRoomService,
  leaveRoom as leaveRoomService,
  updateRoomName as updateRoomNameService,
  updateRoomImage as updateRoomImageService,
  updateRoomColor as updateRoomColorService,
  attachItinerary as attachItineraryService,
  unattachItinerary as unattachItineraryService,
  inviteUser as inviteUserService,
  approveInvite as approveInviteService,
  requestToJoin as requestToJoinService,
  approveJoinRequest as approveJoinRequestService,
  changeUserNickname as changeUserNicknameService,
  kickUser as kickUserService,
  elevateToAdmin as elevateToAdminService,
  Room,
  RoomDetail,
  CreateRoomData,
  CreateRoomResponse,
} from '@/services/roomService';

// Query keys for cache management
const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (status?: string) => [...roomKeys.lists(), status || 'member'] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
};

/**
 * Hook to fetch all rooms the user is a member of
 * @param status - Filter by membership status: 'member' (default), 'invited', 'waiting'
 */
export function useGetRooms(status: string = 'member') {
  return useQuery({
    queryKey: roomKeys.list(status),
    queryFn: async () => await getRoomsService(status),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch specific room details by ID
 */
export function useGetSpecificRoom(roomID: string | null) {
  return useQuery({
    queryKey: roomKeys.detail(roomID || ''),
    queryFn: async () => await getSpecificRoomService(roomID!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes (formerly cacheTime)
    enabled: !!roomID,
  });
}

/**
 * Hook to create a new room
 */
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomData: CreateRoomData) =>
      await createRoomService(roomData),
    onSuccess: () => {
      // Invalidate and refetch rooms list
      queryClient.invalidateQueries({ queryKey: roomKeys.list() });
    },
  });
}

/**
 * Hook to leave a room
 */
export function useLeaveRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomID: string) =>
      await leaveRoomService(roomID),
    onSuccess: () => {
      // Invalidate and refetch rooms list
      queryClient.invalidateQueries({ queryKey: roomKeys.list() });
      // Also invalidate all room details in case user was viewing it
      queryClient.invalidateQueries({ queryKey: roomKeys.details() });
    },
  });
}

/**
 * Hook to update room name
 */
export function useUpdateRoomName(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) =>
      await updateRoomNameService(roomID, name),
    onSuccess: () => {
      // Invalidate and refetch room details
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
    },
  });
}

/**
 * Hook to update room image
 */
export function useUpdateRoomImage(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageUri: string) =>
      await updateRoomImageService(roomID, imageUri),
    onSuccess: () => {
      // Invalidate and refetch room details
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
    },
  });
}

/**
 * Hook to update room color
 */
export function useUpdateRoomColor(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (color: string) =>
      await updateRoomColorService(roomID, color),
    onSuccess: () => {
      // Invalidate and refetch room details
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
    },
  });
}

/**
 * Hook to attach itinerary to room
 */
export function useAttachItinerary(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itineraryID: string) =>
      await attachItineraryService(roomID, itineraryID),
    onSuccess: () => {
      // Invalidate and refetch room details
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
    },
  });
}

/**
 * Hook to unattach itinerary from room
 */
export function useUnattachItinerary(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await unattachItineraryService(roomID),
    onSuccess: () => {
      // Invalidate and refetch room details
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
    },
  });
}

/**
 * Hook to invite user to room
 */
export function useInviteUser(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userID: string) =>
      await inviteUserService(roomID, userID),
    onSuccess: () => {
      // Invalidate and refetch room details
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
    },
  });
}

/**
 * Hook to approve or reject an invite
 */
export function useApproveInvite(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (approval: boolean) =>
      await approveInviteService(roomID, approval),
    onSuccess: () => {
      // Invalidate room details and rooms list
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
      queryClient.invalidateQueries({ queryKey: roomKeys.list() });
    },
  });
}

/**
 * Hook to request to join a room
 */
export function useRequestToJoin(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      await requestToJoinService(roomID),
    onSuccess: () => {
      // Invalidate room details and rooms list
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
      queryClient.invalidateQueries({ queryKey: roomKeys.list() });
    },
  });
}

/**
 * Hook to approve or reject a join request (admin only)
 */
export function useApproveJoinRequest(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userID, approval }: { userID: string; approval: boolean }) =>
      await approveJoinRequestService(roomID, userID, approval),
    onSuccess: () => {
      // Invalidate and refetch room details
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
    },
  });
}

/**
 * Hook to change a user's nickname in the room (admin only)
 */
export function useChangeUserNickname(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userID, nickname }: { userID: string; nickname: string }) =>
      await changeUserNicknameService(roomID, userID, nickname),
    onSuccess: () => {
      // Invalidate and refetch room details
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
    },
  });
}

/**
 * Hook to kick user from room (admin only)
 */
export function useKickUser(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userID: string) =>
      await kickUserService(roomID, userID),
    onSuccess: () => {
      // Invalidate and refetch room details
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
    },
  });
}

/**
 * Hook to elevate user to admin (admin only)
 */
export function useElevateToAdmin(roomID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userID: string) =>
      await elevateToAdminService(roomID, userID),
    onSuccess: () => {
      // Invalidate and refetch room details
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomID) });
    },
  });
}

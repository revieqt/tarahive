import { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TIcon, TText } from '@/components/ui/Themed';
import TextField from '@/components/ui/TextField';
import type { SharedExpensePayload, SharedExpenseStatus } from '@/types/expensesTypes';
import { useGetRoomMembers } from '@/hooks/room/useGetRoomMembers';
import type { RoomMember } from '@/types/roomTypes';

interface ExpenseFormFieldsProps {
  amount: string;
  setAmount: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  sharedBy: SharedExpensePayload[];
  addShare: () => void;
  updateShare: (index: number, patch: Partial<SharedExpensePayload>) => void;
  removeShare: (index: number) => void;
  showSharedExpenses?: boolean;
  roomId?: string;
}

export default function ExpenseFormFields({
  amount,
  setAmount,
  title,
  setTitle,
  description,
  setDescription,
  sharedBy,
  addShare,
  updateShare,
  removeShare,
  showSharedExpenses = true,
  roomId,
}: ExpenseFormFieldsProps) {
  const { members, isLoading: isMembersLoading } = useGetRoomMembers(roomId ?? '');
  const [memberPickerIndex, setMemberPickerIndex] = useState<number | null>(null);

  const getMemberName = (member: RoomMember) =>
    [member.user.fname, member.user.lname].filter(Boolean).join(' ') || member.user.username || member.nickname;

  const getMemberLabel = (member: RoomMember) =>
    `${getMemberName(member)}${member.user.username ? ` (@${member.user.username})` : ''}`;

  const selectMember = (member: RoomMember) => {
    if (memberPickerIndex === null) return;
    updateShare(memberPickerIndex, { userId: member.userId });
    setMemberPickerIndex(null);
  };

  return (
    <>
      <TextField value={title} onChangeText={setTitle} placeholder="Title" autoCapitalize="sentences" maxLength={150} />
      <TextField value={amount} onChangeText={setAmount} placeholder="Amount" keyboardType="numeric" />
      <TextField value={description} onChangeText={setDescription} placeholder="Description (optional)" multiline numberOfLines={3} />

      {showSharedExpenses && <View style={styles.shareHeader}>
        <TText type="subtitle">Shared expense allocations</TText>
        <TouchableOpacity onPress={addShare} accessibilityRole="button">
          <TIcon name="plus-circle" size={28} />
        </TouchableOpacity>
      </View>}
      {showSharedExpenses && sharedBy.map((share, index) => (
        <View key={`${index}-${share.userId}`} style={styles.share}>
          <TouchableOpacity
            style={styles.memberField}
            onPress={() => setMemberPickerIndex(index)}
            accessibilityRole="button"
          >
            <TText style={share.userId ? undefined : styles.placeholder}>
              {(() => {
                const member = members.find((item) => item.userId === share.userId);
                return member ? getMemberLabel(member) : 'Choose a participant';
              })()}
            </TText>
            <TIcon name="chevron-down" size={20} />
          </TouchableOpacity>
          <TextField
            value={share.amount ? String(share.amount) : ''}
            onChangeText={(value) => updateShare(index, { amount: Number(value) || 0 })}
            placeholder="Allocated amount"
            keyboardType="numeric"
          />
          <TextField
            value={share.note ?? ''}
            onChangeText={(value) => updateShare(index, { note: value })}
            placeholder="Note (optional)"
          />
          <View style={styles.shareActions}>
            <TouchableOpacity
              style={[styles.status, share.status === 'PENDING' && styles.activeStatus]}
              onPress={() => updateShare(index, { status: 'PENDING' as SharedExpenseStatus })}
            >
              <TText>PENDING</TText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.status, share.status === 'PAID' && styles.activeStatus]}
              onPress={() => updateShare(index, { status: 'PAID' as SharedExpenseStatus })}
            >
              <TText>PAID</TText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeShare(index)}>
              <TIcon name="delete" size={22} color="#DC143C" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <Modal
        visible={memberPickerIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMemberPickerIndex(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMemberPickerIndex(null)}>
          <Pressable style={styles.memberModal} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <TText type="subtitle">Choose participant</TText>
              <TouchableOpacity onPress={() => setMemberPickerIndex(null)}>
                <TIcon name="close" size={24} />
              </TouchableOpacity>
            </View>
            {isMembersLoading ? <ActivityIndicator /> : (
              <FlatList
                data={members}
                keyExtractor={(member) => member.userId}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.memberOption} onPress={() => selectMember(item)}>
                    <View>
                      <TText>{getMemberName(item)}</TText>
                      {item.user.username && <TText style={styles.username}>@{item.user.username}</TText>}
                    </View>
                    {sharedBy[memberPickerIndex ?? -1]?.userId === item.userId && <TIcon name="check" size={22} />}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<TText style={styles.emptyMembers}>No room members found.</TText>}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  share: {
    borderWidth: 1,
    borderColor: '#ccc5',
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
  },
  memberField: {
    borderWidth: 1,
    borderColor: '#ccc6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholder: { opacity: 0.6 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0008',
  },
  memberModal: {
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  memberOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  username: { opacity: 0.6, marginTop: 2 },
  emptyMembers: { paddingVertical: 20, textAlign: 'center' },
  shareActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    borderWidth: 1,
    borderColor: '#ccc6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  activeStatus: {
    backgroundColor: '#4CAF5040',
    borderColor: '#4CAF50',
  },
});

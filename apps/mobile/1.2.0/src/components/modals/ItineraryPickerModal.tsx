import React from 'react';
import {
	ActivityIndicator,
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyMessage from '@/components/common/EmptyMessage';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import { useGetUserItineraries } from '@/hooks/itinerary/useGetUserItineraries';
import { useLanguage } from '@/context/LanguageContext';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { Itinerary } from '@/types/itineraryTypes';
import { formatDateToString } from '@/utils/formatDateToString';

interface ItineraryPickerModalProps {
	visible: boolean;
	onClose: () => void;
	onSelect: (itinerary: Itinerary) => void;
}

export default function ItineraryPickerModal({
	visible,
	onClose,
	onSelect,
}: ItineraryPickerModalProps) {
	const { currentLanguage } = useLanguage();
	const { itineraries, isLoading, isError } = useGetUserItineraries('active');
	const accentColor = useThemeColor({}, 'accent');
	const borderColor = useThemeColor({}, 'icon') + '40';

	const handleSelect = (itinerary: Itinerary) => {
		onSelect(itinerary);
		onClose();
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<SafeAreaView style={styles.safeArea} edges={['bottom']}>
				<View style={styles.overlay}>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Close itinerary picker"
						style={StyleSheet.absoluteFill}
						onPress={onClose}
					/>
					<TView color="primary" style={styles.sheet}>
						{isLoading ? (
							<View style={styles.stateContainer}>
								<ActivityIndicator size="large" color={accentColor} />
							</View>
						) : isError ? (
							<View style={styles.stateContainer}>
								<EmptyMessage
									title="Couldn't load itineraries"
									description="Please try again later."
									iconName="alert-circle-outline"
								/>
							</View>
						) : itineraries?.length === 0 ? (
							<View style={styles.stateContainer}>
								<EmptyMessage
									title="No active itineraries"
									description="Create an itinerary before attaching one to this room."
									iconName="calendar-blank-outline"
								/>
							</View>
						) : (
							<FlatList
								data={itineraries}
								keyExtractor={(item) => item.id}
								contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
								renderItem={({ item }) => (
									<TouchableOpacity
										accessibilityRole="button"
										accessibilityLabel={`Attach ${item.title}`}
										onPress={() => handleSelect(item)}
										style={[styles.itineraryRow, { borderBottomColor: borderColor }]}
									>
										<View style={styles.rowText}>
											<TText numberOfLines={1} style={styles.itineraryTitle}>
												{item.title}
											</TText>
											<TText style={styles.dateText}>
												{formatDateToString(item.startDate, currentLanguage.code)}
												{' - '}
												{formatDateToString(item.endDate, currentLanguage.code)}
											</TText>
										</View>
										<TIcon name="chevron-right" size={20} color={accentColor} />
									</TouchableOpacity>
								)}
							/>
						)}
					</TView>
				</View>
			</SafeAreaView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	overlay: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: '#0008',
	},
	sheet: {
		maxHeight: '82%',
		minHeight: '38%',
		paddingTop: 18,
		paddingHorizontal: '3%',
		paddingBottom: 12,
		borderTopLeftRadius: 18,
		borderTopRightRadius: 18,
	},
	listContent: {
		paddingBottom: 12,
	},
	itineraryRow: {
		minHeight: 64,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: StyleSheet.hairlineWidth,
		paddingVertical: 12,
		gap: 12,
	},
	rowText: {
		flex: 1,
		gap: 4,
	},
	itineraryTitle: {
		fontSize: 14,
		fontWeight: '600',
	},
	dateText: {
		fontSize: 11,
		opacity: 0.7,
	},
	stateContainer: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
});

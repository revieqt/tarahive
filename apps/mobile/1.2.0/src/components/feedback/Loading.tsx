import React from "react";
import { StyleSheet } from "react-native";
import HiveLoading from "@/components/feedback/HiveLoading";
import { TView } from "@/components/ui/Themed";

interface LoadingProps {
	visible: boolean;
}

const Loading: React.FC<LoadingProps> = ({ visible }) => {
	if (!visible) return null;

	return (
		<TView pointerEvents="auto" style={styles.overlay}>
			<HiveLoading size={50}/>
		</TView>
	);
};

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 10000,
		elevation: 10000,
		alignItems: "center",
		justifyContent: "center",
		gap: 16,
	},
});

export default Loading;

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { TIcon, TText, TView } from "@/components/ui/Themed";
import { Markdown } from "@/components/ui/Markdown";
import { useThemeColor } from "@/hooks/shared/useThemeColor";
import { EMERGENCY_TYPES } from "@/types/sosTypes";
import { useAdvice } from "@/hooks/sos/useAdvice";
import { useLanguage } from "@/context/LanguageContext";

type EmergencyResourcesModalProps = {
  visible: boolean;
  emergencyType: string | null;
  onClose: () => void;
};

export default function EmergencyResourcesModal({
  visible,
  emergencyType,
  onClose,
}: EmergencyResourcesModalProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useThemeColor({}, "accent");
  const [ currentTab, setCurrentTab ] = useState(1);
  const { t } = useLanguage();
  const {
    advice,
    isLoading,
    error,
    retryAdvice,
  } = useAdvice(emergencyType, visible);
  const emergencyTypeDefinition = EMERGENCY_TYPES.find(
    (type) => type.id === emergencyType,
  ) ?? EMERGENCY_TYPES.find((type) => type.id === "other")!;
  const emergencyLabel = t(
    emergencyTypeDefinition.labelKey,
  );

  useEffect(() => {
    if (visible) {
      setCurrentTab(1);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close emergency resources"
          onPress={onClose}
          style={styles.backdrop}
        />
        <TView color='primary' style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.titleRow}>
                <View style={[styles.iconContainer, {backgroundColor: emergencyTypeDefinition.color + '30'}]}>
                    <TIcon
                    name={emergencyTypeDefinition.icon}
                    size={30}
                    color={emergencyTypeDefinition.color}
                    />
                </View>
                

                <View style={{flex: 1}}>
                    <TText type="title" style={styles.title}>{emergencyLabel}</TText>
                    <TText style={{fontSize: 12, opacity: .7, marginTop: -5}}>{t('sos.resources.subtitle')}</TText>
                </View>
                
            </View>
            

            <ScrollView
                style={styles.tabsScrollView}
                contentContainerStyle={styles.tabsContainer}
                horizontal
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
            >
                <TouchableOpacity
                accessibilityRole="tab"
                accessibilityState={{ selected: currentTab === 1 }}
                onPress={() => setCurrentTab(1)}
                style={[styles.tabs, currentTab === 1 && {backgroundColor: emergencyTypeDefinition.color + '30'}]}
                >
                <TText style={currentTab === 1 && styles.activeTabText}>{t('sos.resources.advisory')}</TText>
                </TouchableOpacity>

                <TouchableOpacity
                accessibilityRole="tab"
                accessibilityState={{ selected: currentTab === 2 }}
                onPress={() => setCurrentTab(2)}
                style={[styles.tabs, currentTab === 2 && {backgroundColor: emergencyTypeDefinition.color + '30'}]}
                >
                <TText style={currentTab === 2 && styles.activeTabText}>{t('sos.resources.nearby_help')}</TText>
                </TouchableOpacity>
            </ScrollView>
          </View>

          <ScrollView
            style={[styles.scrollView, {backgroundColor}]}
            showsVerticalScrollIndicator={false}
          >
            {currentTab === 1 && (isLoading ? (
              <View style={styles.status}>
                <ActivityIndicator color={accentColor} />
                <TText style={{ color: textColor }}>Loading advice...</TText>
              </View>
            ) : error ? (
              <View style={styles.status}>
                <TText style={styles.errorText}>{error}</TText>
                <Pressable
                  accessibilityRole="button"
                  onPress={retryAdvice}
                  style={[styles.retryButton, { backgroundColor: accentColor }]}
                >
                  <TText style={styles.retryText}>Try again</TText>
                </Pressable>
              </View>
            ) : advice ? (
              <Markdown>{advice}</Markdown>
            ) : null)}
          </ScrollView>
        </TView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0008",
  },
  sheet: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#8888",
  },
  header:{
    paddingHorizontal: '3%',
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: "center",
    gap: 8,
    marginTop: 5
  },
  title: {
    flex: 1,
    fontSize: 14,
  },
  iconContainer:{
    width: 40,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  tabsScrollView: {
    flexGrow: 0,
    flexShrink: 0,
    height: 48,
    marginTop: 5,
    borderBottomWidth: 1,
    borderColor: "#ccc4",
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  tabs: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },
  activeTabText: {
    fontWeight: "700",
  },
  scrollView: {
    flexShrink: 1,
    paddingHorizontal: '3%'
  },
  status: {
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    color: "#D53E0F",
    textAlign: "center",
  },
  retryButton: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
});
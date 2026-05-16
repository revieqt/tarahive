import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { TView, TText } from "@/shared/components/ui/Themed";
import Button from "@/shared/components/ui/Button";
import LangButton from "@/shared/components/common/LanguageButton";
import { useLanguage } from "@/shared/context/LanguageContext";
import HiveBg from "@/shared/components/common/HiveBg";
import { useThemeColor } from "@/shared/hooks/useThemeColor";
import { ONBOARDING_KEY, slideTemplates, SlideItemProps } from "@/shared/constants/Onboarding";

const { width, height } = Dimensions.get("window");


function SlideItem({ item, index, translateFn }: SlideItemProps) {
  return (
    <View style={[styles.slide, {width}]}>
      <Image source={item.image} style={{ width: 200, height: 200, marginBottom: 48 }} resizeMode="contain" />

      <View style={styles.textBlock}>
        <TText type='title' style={styles.title}>{translateFn(item.titleKey)}</TText>
        <TText style={styles.subtitle} type='subtitle'>{translateFn(item.subtitleKey)}</TText>
        <TText style={styles.description}>
          {translateFn(item.descriptionKey)}
        </TText>
      </View>
    </View>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { t } = useLanguage();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const dotColor = useThemeColor({}, 'accent');

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch (_) {}
    router.replace("/login");
  };

  const isLastSlide = currentIndex === slideTemplates.length - 1;

  return (
    <TView style={{flex: 1}}>
      <HiveBg />
      <LangButton />
      <Animated.FlatList
        ref={flatListRef}
        data={slideTemplates}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <SlideItem item={item} index={index} translateFn={t} />
        )}
      />

      <View style={styles.bottomBar}>
        <View style={[styles.indicators, {marginBottom: isLastSlide ? 0 : 24}]}>
          {slideTemplates.map((slide, i) => {
            const inputRange = [
              (i - 1) * width,
              i * width,
              (i + 1) * width,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 22, 6],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={slide.id}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: dotColor,
                  },
                ]}
              />
            );
          })}
        </View>

        {isLastSlide && (
          <Button
            title={t("common.common.continue")}
            onPress={handleContinue}
            type="primary"
            buttonStyle={styles.continueBtn}
          />
        )}
      </View>
    </TView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  slide: {
    flex: 1,
    height,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  textBlock: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 30,
  },
  subtitle: {
    marginBottom: 25,
    textAlign: "center",
  },
  description: {
    opacity: 0.7,
    lineHeight: 25,
    fontWeight: "400",
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 24,
  },
  indicators: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  continueBtn: {
    width: "100%",
    marginBottom: 16,
  },
});
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
import { TView, TText } from "@/components/ui/Themed";
import Button from "@/components/ui/Button";

const { width, height } = Dimensions.get("window");

const ONBOARDING_KEY = "ONBOARDING_COMPLETED";

type Slide = {
  id: string;
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  description: string;
};

const slides: Slide[] = [
  {
    id: "1",
    image: require("../assets/images/icon.png"),
    title: "Welcome",
    subtitle: "to Tarahive",
    description:
      "Your ultimate travel companion app, designed to make every journey smarter, safer, and more enjoyable.",
  },
  {
    id: "2",
    image: require("../assets/images/slide2-img.png"),
    title: "Plan",
    subtitle: "your next adventure.",
    description:
      "Get personalized travel recommendations based on your preferences, weather conditions, and local insights.",
  },
  {
    id: "3",
    image: require("../assets/images/slide3-img.png"),
    title: "Safety",
    subtitle: "is our priority.",
    description:
      "Stay informed with weather updates, route safety assessments, and quick access to emergency contacts.",
  },
  {
    id: "4",
    image: require("../assets/images/slide4-img.png"),
    title: "Connect",
    subtitle: "with the community.",
    description:
      "Join tours, share tips, ask questions, and connect with fellow adventurers for a more social and enriching travel experience.",
  },
];

function SlideItem({ item, index }: { item: Slide; index: number }) {
  return (
    <TView style={[styles.slide, {width}]}>

      <Image source={item.image} style={{ width: 200, height: 200, marginBottom: 48 }} resizeMode="contain" />

      <View style={styles.textBlock}>
        
        <TText type='title' style={styles.title}>{item.title}</TText>
        <TText style={styles.subtitle}>{item.subtitle}</TText>
        <TText style={styles.description}>
          {item.description}
        </TText>
      </View>
    </TView>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch (_) {}
    router.replace("/auth/login");
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={{flex: 1}}>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
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
          <SlideItem item={item} index={index} />
        )}
      />

      <View style={styles.bottomBar}>
        <View style={[styles.indicators, {marginBottom: isLastSlide ? 0 : 24}]}>
          {slides.map((slide, i) => {
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
                    backgroundColor: "#FFC94D",
                  },
                ]}
              />
            );
          })}
        </View>

        {isLastSlide && (
          <Button
            title="Continue"
            onPress={handleContinue}
            type="primary"
            buttonStyle={styles.continueBtn}
          />
        )}
      </View>
    </View>
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
    fontSize: 40,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 25,
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
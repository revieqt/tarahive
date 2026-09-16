import { ImageSourcePropType } from "react-native";

export const ONBOARDING_KEY = "ONBOARDING_COMPLETED";

type Slide = {
  id: string;
  image: ImageSourcePropType;
  titleKey: string;
  subtitleKey: string;
  descriptionKey: string;
};

export const slideTemplates: Slide[] = [
  {
    id: "1",
    image: require("../../shared/assets/images/icon.png"),
    titleKey: "auth.onboarding.slide1_title",
    subtitleKey: "auth.onboarding.slide1_subtitle",
    descriptionKey: "auth.onboarding.slide1_description",
  },
  {
    id: "2",
    image: require("../../shared/assets/images/slide2-img.png"),
    titleKey: "auth.onboarding.slide2_title",
    subtitleKey: "auth.onboarding.slide2_subtitle",
    descriptionKey: "auth.onboarding.slide2_description",
  },
  {
    id: "3",
    image: require("../../shared/assets/images/slide3-img.png"),
    titleKey: "auth.onboarding.slide3_title",
    subtitleKey: "auth.onboarding.slide3_subtitle",
    descriptionKey: "auth.onboarding.slide3_description",
  },
  {
    id: "4",
    image: require("../../shared/assets/images/slide4-img.png"),
    titleKey: "auth.onboarding.slide4_title",
    subtitleKey: "auth.onboarding.slide4_subtitle",
    descriptionKey: "auth.onboarding.slide4_description",
  },
];

export type SlideItemProps = {
  item: Slide;
  index: number;
  translateFn: (key: string) => string;
};
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
    image: require("../../assets/images/icon.png"),
    titleKey: "onboarding.slide1_title",
    subtitleKey: "onboarding.slide1_subtitle",
    descriptionKey: "onboarding.slide1_description",
  },
  {
    id: "2",
    image: require("../../assets/images/slide2-img.png"),
    titleKey: "onboarding.slide2_title",
    subtitleKey: "onboarding.slide2_subtitle",
    descriptionKey: "onboarding.slide2_description",
  },
  {
    id: "3",
    image: require("../../assets/images/slide3-img.png"),
    titleKey: "onboarding.slide3_title",
    subtitleKey: "onboarding.slide3_subtitle",
    descriptionKey: "onboarding.slide3_description",
  },
  {
    id: "4",
    image: require("../../assets/images/slide4-img.png"),
    titleKey: "onboarding.slide4_title",
    subtitleKey: "onboarding.slide4_subtitle",
    descriptionKey: "onboarding.slide4_description",
  },
];

export type SlideItemProps = {
  item: Slide;
  index: number;
  translateFn: (key: string) => string;
};
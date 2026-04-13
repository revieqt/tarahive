import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.BANNER : 'your-real-banner-id';

export default function Banner() {
  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
    />
  );
}

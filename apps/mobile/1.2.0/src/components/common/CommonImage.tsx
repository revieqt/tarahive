import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { TIcon } from '@/components/ui/Themed';
import { useInternetConnection } from '@/utils/checkInternetConnection';

type CityImageInfo = {
  thumburl?: string;
  descriptionurl?: string;
  extmetadata?: {
    Artist?: { value?: string };
    LicenseShortName?: { value?: string };
  };
};

type CommonsSearchResponse = {
  query?: {
    pages?: Record<string, { imageinfo?: CityImageInfo[] }>;
  };
};

type CityImage = {
  uri: string;
  descriptionUrl?: string;
  attribution: string;
};

type CommonImageProps = {
  searchQuery: string;
  style?: StyleProp<ViewStyle>;
  overlay?: StyleProp<ViewStyle>;
};

async function fetchImage(searchQuery: string): Promise<CityImage | null> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: searchQuery,
    gsrnamespace: '6',
    gsrlimit: '1',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1200',
    format: 'json',
    origin: '*',
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Wikimedia Commons image search failed: ${response.status}`);
  }

  const data = await response.json() as CommonsSearchResponse;
  const pages = data.query?.pages;
  const firstPageId = pages ? Object.keys(pages)[0] : undefined;
  const image = firstPageId ? pages?.[firstPageId]?.imageinfo?.[0] : undefined;
  if (!image?.thumburl) return null;

  const artist = image.extmetadata?.Artist?.value
    ?.replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  const license = image.extmetadata?.LicenseShortName?.value;

  return {
    uri: image.thumburl,
    descriptionUrl: image.descriptionurl,
    attribution: [
      artist ? `Photo by ${artist}` : 'Photo',
      'Wikimedia Commons',
      license,
    ].filter(Boolean).join(' · '),
  };
}

export default function CommonImage({ searchQuery, style, overlay }: CommonImageProps) {
  const isConnected = useInternetConnection();
  const search = searchQuery.trim();
  const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);
  const {
    data: cityImage,
    error: cityImageError,
  } = useQuery({
    queryKey: ['commons-image', search],
    queryFn: () => fetchImage(search),
    enabled: isConnected === true && search.length > 0,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (cityImageError) {
      console.error('[CommonImage] Failed to load city image:', cityImageError);
    }
  }, [cityImageError]);

  useEffect(() => {
    setIsFullScreenVisible(false);
  }, [search]);

  return (
    <View pointerEvents='box-none' style={[style, StyleSheet.absoluteFillObject]}>
      {cityImage?.uri ? (
        <>
          <TouchableOpacity
            accessibilityRole='button'
            accessibilityLabel='Open image in full screen'
            activeOpacity={1}
            style={StyleSheet.absoluteFill}
            onPress={() => setIsFullScreenVisible(true)}
          >
            <Image
              source={{ uri: cityImage.uri }}
              style={StyleSheet.absoluteFill}
              contentFit='cover'
              transition={400}
            />
            <View pointerEvents='none' style={[styles.overlay, overlay]} />
          </TouchableOpacity>
          {cityImage.attribution ? (
            <TouchableOpacity
              style={styles.attribution}
              disabled={!cityImage.descriptionUrl}
              onPress={() => {
                if (cityImage.descriptionUrl) {
                  void Linking.openURL(cityImage.descriptionUrl);
                }
              }}
            >
              <Text numberOfLines={1} style={styles.attributionText}>
                {cityImage.attribution}
              </Text>
            </TouchableOpacity>
          ) : null}
          <Modal
            visible={isFullScreenVisible}
            transparent
            animationType='fade'
            statusBarTranslucent
            onRequestClose={() => setIsFullScreenVisible(false)}
          >
            <View style={styles.fullScreenContainer}>
              <Image
                source={{ uri: cityImage.uri }}
                style={styles.fullScreenImage}
                contentFit='contain'
              />
              <TouchableOpacity
                accessibilityRole='button'
                accessibilityLabel='Close full-screen image'
                style={styles.closeButton}
                onPress={() => setIsFullScreenVisible(false)}
              >
                <TIcon name='close' size={22} color='#fff' />
              </TouchableOpacity>
              {cityImage.attribution && cityImage.descriptionUrl ? (
                <TouchableOpacity
                  style={styles.fullScreenAttribution}
                  onPress={() => {
                    const descriptionUrl = cityImage.descriptionUrl;
                    if (descriptionUrl) {
                      void Linking.openURL(descriptionUrl);
                    }
                  }}
                >
                  <Text numberOfLines={1} style={styles.attributionText}>
                    {cityImage.attribution}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </Modal>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  attribution: {
    position: 'absolute',
    right: 8,
    bottom: 4,
    maxWidth: '90%',
  },
  attributionText: {
    color: '#fff',
    fontSize: 8,
    opacity: 0.75,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0009',
  },
  fullScreenAttribution: {
    position: 'absolute',
    bottom: 20,
    maxWidth: '90%',
  },
});

import { useEffect, useState } from 'react';
import { Image as RNImage } from 'react-native';

import { BACKGROUND_IMAGES } from '@/shared/constants/BackgroundImages';

const FALLBACK_IMAGE = require('../assets/images/defaultBg.jpg');

const IMAGE_TIMEOUT = 3000;

export type BackgroundImage = string | number;

interface TouristBackground {
  image: BackgroundImage;
  loading: boolean;
}

export function useLoginBg(): TouristBackground {
  const [image, setImage] =
    useState<BackgroundImage>(FALLBACK_IMAGE);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (BACKGROUND_IMAGES.length === 0) {
        if (isMounted) {
          setLoading(false);
        }

        return;
      }

      const randomIndex = Math.floor(
        Math.random() * BACKGROUND_IMAGES.length
      );

      const imageUrl = BACKGROUND_IMAGES[randomIndex];

      try {
        const loaded = await Promise.race([
          RNImage.prefetch(imageUrl),

          new Promise<boolean>((resolve) => {
            setTimeout(() => resolve(false), IMAGE_TIMEOUT);
          }),
        ]);

        if (isMounted && loaded) {
          setImage(imageUrl);
        }
      } catch {
        // Keep the local fallback image
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    image,
    loading,
  };
}
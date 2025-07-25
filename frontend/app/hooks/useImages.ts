import { useCallback } from "react";
import { usePreloadedImages } from "./useImagePreloader";

export const useImages = () => {
  const { images: preloadedImages, isLoading } = usePreloadedImages();

  const getImage = useCallback(
    (key: string) => {
      console.log("getImage", key);
      if (preloadedImages) {
        const image = preloadedImages[key as keyof typeof preloadedImages];
        return image || preloadedImages.unknown || null;
      }
      return null;
    },
    [preloadedImages],
  );

  return { getImage, isLoading, images: preloadedImages || {} };
};

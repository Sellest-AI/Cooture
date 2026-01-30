import { Image as NativeImage, Platform } from "react-native";

type Dimensions = { width: number; height: number };

export function getFileDimensions(file: File) {
  return new Promise<Dimensions>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("File is not an image"));
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      URL.revokeObjectURL(url); // Clean up object URL
      resolve({ width, height });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url); // Clean up on error
      reject(new Error(err.toString()));
    };

    img.src = url;
  });
}

export function getImageDimensions(url: string): Promise<Dimensions> {
  if (Platform.OS !== 'web') {
    return new Promise((resolve, reject) => {
      NativeImage.getSize(
        url,
        (width, height) => resolve({ width, height }),
        (error) => reject(error)
      );
    });
  }

  return new Promise<Dimensions>((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      URL.revokeObjectURL(url); // Clean up object URL
      resolve({ width, height });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url); // Clean up on error
      reject(new Error(err.toString()));
    };

    img.src = url;
  });
}
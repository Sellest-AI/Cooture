type Anchor = 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center' | 'top-center';

type Options = {
  watermarkUrl?: string;
  opacity?: number;
  offsetPercent?: number;
  sizePercent?: number;
  anchor?: Anchor;
};

const DEFAULT_OPTIONS: Required<Options> = {
  watermarkUrl: '/watermark.png',
  opacity: 1,
  sizePercent: 6,
  offsetPercent: 3,
  anchor: 'bottom-right',
};

export const applyWatermark = async (url: string, options?: Options): Promise<string> => {
  const _options = { ...DEFAULT_OPTIONS, ...options };
  const { watermarkUrl, opacity, sizePercent, offsetPercent, anchor } = _options;

  const { StaticCanvas, FabricImage } = await import('fabric');

  const imageElement = new Image();
  imageElement.src = url;
  imageElement.crossOrigin = 'anonymous'; // Ensure CORS is handled
  await imageElement.decode(); // Ensure the image is loaded

  // Create a Fabric canvas with the dimensions of the main image
  const fabricCanvas = new StaticCanvas(undefined, {
    width: Math.floor(imageElement.width),
    height: Math.floor(imageElement.height),
  });

  const image = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
  fabricCanvas.add(image);

  image.set({ left: 0, top: 0, selectable: false, evented: false });

  const watermarkImage = await FabricImage.fromURL(watermarkUrl, { crossOrigin: 'anonymous' });
  fabricCanvas.add(watermarkImage);

  // Calculate watermark dimensions
  const aspectRatio = watermarkImage.getScaledWidth() / watermarkImage.getScaledHeight();
  const watermarkHeight = Math.floor(Math.min(imageElement.width, imageElement.height) * (sizePercent / 100));
  const watermarkWidth = Math.floor(watermarkHeight * aspectRatio);

  watermarkImage.scaleToWidth(watermarkWidth);

  const _offsetPercent = offsetPercent / 100;
  const offset = imageElement.width > imageElement.height ? (imageElement.width * _offsetPercent) : (imageElement.height * _offsetPercent);

  // Calculate position based on anchor
  let watermarkX: number;
  let watermarkY: number;

  switch (anchor) {
    case 'center':
      watermarkX = Math.floor((imageElement.width - watermarkImage.getScaledWidth()) / 2);
      watermarkY = Math.floor((imageElement.height - watermarkImage.getScaledHeight()) / 2);
      break;
    case 'bottom-left':
      watermarkX = Math.floor(offset);
      watermarkY = Math.floor(imageElement.height - watermarkImage.getScaledHeight() - offset);
      break;
    case 'top-right':
      watermarkX = Math.floor(imageElement.width - watermarkImage.getScaledWidth() - offset);
      watermarkY = Math.floor(offset);
      break;
    case 'top-left':
      watermarkX = Math.floor(offset);
      watermarkY = Math.floor(offset);
      break;
    case 'bottom-center':
      watermarkX = Math.floor((imageElement.width - watermarkImage.getScaledWidth()) / 2);
      watermarkY = Math.floor(imageElement.height - watermarkImage.getScaledHeight() - offset);
      break;
    case 'top-center':
      watermarkX = Math.floor((imageElement.width - watermarkImage.getScaledWidth()) / 2);
      watermarkY = Math.floor(offset);
      break;
    case 'bottom-right':
    default:
      watermarkX = Math.floor(imageElement.width - watermarkImage.getScaledWidth() - offset);
      watermarkY = Math.floor(imageElement.height - watermarkImage.getScaledHeight() - offset);
      break;
  }

  watermarkImage.set({
    left: watermarkX,
    top: watermarkY,
    opacity: opacity,
    selectable: false,
    evented: false
  });

  fabricCanvas.renderAll();

  return fabricCanvas.toDataURL({ format: 'webp', quality: 1, multiplier: 1 });
};

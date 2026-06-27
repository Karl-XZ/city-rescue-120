const THREE_TEXTURE_ASSETS_INTERNAL = [
  'assets/characters/bystander_01_phone.png',
  'assets/characters/bystander_02_aed_pointer.png',
  'assets/characters/bystander_03_elder.png',
  'assets/characters/medic_01_bag.png',
  'assets/characters/medic_02_aed_assist.png',
  'assets/characters/patient_02_collapsed.png',
  'assets/characters/patient_03_cpr.png',
  'assets/characters/patient_03_cpr_open.png',
  'assets/characters/patient_04_recovery.png',
  'assets/characters/patient_05_aed_pads.png',
  'assets/characters/prop_01_aed_cabinet.png',
  'assets/characters/prop_02_aed_open.png',
  'assets/characters/prop_03_phone.png',
  'assets/characters/prop_04_first_aid_kit.png',
  'assets/characters/prop_05_ambulance.png',
  'assets/characters/prop_06_marker.png',
  'assets/characters/prop_07_blanket.png',
] as const;

export const THREE_TEXTURE_ASSETS = THREE_TEXTURE_ASSETS_INTERNAL;
export const GAME_IMAGE_ASSETS = THREE_TEXTURE_ASSETS_INTERNAL;

export function gameAssetUrl(path: string): string {
  const normalized = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${normalized}`;
}

export function gameImageAssetUrls(): string[] {
  return GAME_IMAGE_ASSETS.map(gameAssetUrl);
}

export function gameTextureAssetUrls(): string[] {
  return THREE_TEXTURE_ASSETS.map(gameAssetUrl);
}

function shouldDecodeAsImage(url: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(url.split('?')[0]);
}

async function preloadDownloadedAsset(url: string): Promise<void> {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  await response.arrayBuffer();
}

function preloadDecodedImage(url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = async () => {
      try {
        await image.decode?.();
      } catch {
        // The image finished loading; decode() is only an extra browser hint.
      }
      resolve();
    };
    image.onerror = () => reject(new Error(`Failed to load ${url}`));
    image.src = url;
  });
}

export async function preloadGameImages(
  onProgress?: (loaded: number, total: number, url: string) => void,
): Promise<void> {
  const urls = gameImageAssetUrls();
  let loaded = 0;

  await Promise.all(urls.map(async (url) => {
    try {
      if (shouldDecodeAsImage(url)) {
        await preloadDecodedImage(url);
      } else {
        await preloadDownloadedAsset(url);
      }
      loaded += 1;
      onProgress?.(loaded, urls.length, url);
    } catch (error) {
      throw error instanceof Error ? error : new Error(`Failed to load ${url}`);
    }
  }));
}

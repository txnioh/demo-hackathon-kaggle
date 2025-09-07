
export interface Photo {
  id: string;
  originalSrc: string; // data URL
  enhancedSrc?: string; // data URL
  file: File | null;
}

export interface Background {
  id: string;
  src: string; // URL
  prompt: string;
  isDefault?: boolean;
}

export interface ProductDetails {
    title: string;
    description: string;
    price: string;
}

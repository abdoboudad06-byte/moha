
export interface Photo {
  id: string;
  url: string;
  title: string;
  titleAr?: string;
  titleFr?: string;
  description: string;
  descriptionAr?: string;
  descriptionFr?: string;
  locationName: string;
  coords: [number, number];
  price?: number; // Added price for commercial use
}

export interface City {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  center: [number, number];
  zoom: number;
  photos: Photo[];
}

export type Language = 'en' | 'ar' | 'fr';

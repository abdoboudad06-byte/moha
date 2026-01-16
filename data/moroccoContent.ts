
import { City } from '../types';

export const MOROCCO_CITIES: City[] = [
  {
    id: 'marrakech',
    name: 'Marrakech',
    nameAr: 'مراكش',
    nameFr: 'Marrakech',
    description: 'The Red City, home to the vibrant Jemaa el-Fnaa and majestic palaces.',
    descriptionAr: 'المدينة الحمراء، موطن ساحة جامع الفناء النابضة بالحياة والقصور المهيبة.',
    descriptionFr: 'La Ville Rouge, abritant la vibrante place Jemaa el-Fna et des palais majestueux.',
    center: [31.6295, -7.9811],
    zoom: 12,
    photos: [] // Removed broken default photo
  },
  {
    id: 'chefchaouen',
    name: 'Chefchaouen',
    nameAr: 'شفشاون',
    nameFr: 'Chefchaouen',
    description: 'The Blue Pearl of the Rif Mountains.',
    descriptionAr: 'الجوهرة الزرقاء في جبال الريف.',
    descriptionFr: 'La Perle Bleue des montagnes du Rif.',
    center: [35.1688, -5.2636],
    zoom: 14,
    photos: []
  },
  {
    id: 'merzouga',
    name: 'Merzouga',
    nameAr: 'مرزوكة',
    nameFr: 'Merzouga',
    description: 'Gateway to the Erg Chebbi dunes and the vast Sahara Desert.',
    descriptionAr: 'بوابة عروق الشبي والصحراء الكبرى الشاسعة.',
    descriptionFr: 'Porte des dunes de l\'Erg Chebbi et du vaste désert du Sahara.',
    center: [31.0983, -3.9840],
    zoom: 10,
    photos: []
  }
];

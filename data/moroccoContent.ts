
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
    photos: [
      {
        id: 'm1',
        url: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&q=80&w=1200',
        title: 'Koutoubia Dusk',
        titleAr: 'الكتبية وقت الغروب',
        titleFr: 'Koutoubia au Crépuscule',
        description: 'The golden hour lighting hitting the minaret.',
        locationName: 'Marrakech',
        coords: [31.6237, -7.9936]
      },
      {
        id: 'm2',
        url: 'https://images.unsplash.com/photo-1539667468225-8df6675ca531?auto=format&fit=crop&q=80&w=1200',
        title: 'Traditional Tanjiya',
        titleAr: 'طباخ الطنجية التقليدي',
        titleFr: 'Cuisinier de Tanjiya',
        description: 'Traditional cooking in the heart of Marrakech Medina.',
        locationName: 'Marrakech',
        coords: [31.6260, -7.9890]
      }
    ]
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
    photos: [
      {
        id: 'c1',
        url: 'https://images.unsplash.com/photo-1543310321-72f122558661?auto=format&fit=crop&q=80&w=1200',
        title: 'Blue Alleyway',
        titleAr: 'زقاق أزرق',
        titleFr: 'Ruelle Bleue',
        description: 'Traditional steps leading into the heart of the Medina.',
        locationName: 'Chefchaouen',
        coords: [35.1691, -5.2625]
      }
    ]
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
    photos: [
      {
        id: 's1',
        url: 'https://images.unsplash.com/photo-1489493585363-d69421e0dee3?auto=format&fit=crop&q=80&w=1200',
        title: 'Dunes at Dawn',
        titleAr: 'كثبان الفجر',
        titleFr: 'Dunes à l\'Aube',
        description: 'Shadows playing across the crest of Erg Chebbi.',
        locationName: 'Sahara Desert',
        coords: [31.1044, -3.9612]
      }
    ]
  }
];

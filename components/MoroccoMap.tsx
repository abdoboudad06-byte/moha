
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { MOROCCO_CITIES } from '../data/moroccoContent';
import { City, Photo } from '../types';

// Custom Marker Icons
const cityIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const photoIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3342/3342137.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const customPhotoIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/10431/10431661.png', 
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const MOROCCO_BOUNDS: L.LatLngBoundsExpression = [
  [20.0, -18.0], 
  [36.5, -0.5]    
];

interface MoroccoMapProps {
  selectedCity: City | null;
  customPhotos: Photo[];
  deletedDefaultIds: Set<string>;
  onSelectCity: (city: City) => void;
  onSelectPhoto: (photo: Photo) => void;
}

const isValidCoords = (coords: any): coords is [number, number] => {
  return Array.isArray(coords) && 
         coords.length === 2 && 
         typeof coords[0] === 'number' && !isNaN(coords[0]) &&
         typeof coords[1] === 'number' && !isNaN(coords[1]);
};

const MapUpdater = ({ center, zoom, bounds }: { center?: [number, number], zoom?: number, bounds?: L.LatLngBoundsExpression }) => {
  const map = useMap();
  useEffect(() => {
    if (center && zoom && isValidCoords(center)) {
      map.flyTo(center, zoom, { duration: 1.5 });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [center, zoom, bounds, map]);
  return null;
};

const MoroccoMap: React.FC<MoroccoMapProps> = ({ selectedCity, customPhotos, deletedDefaultIds, onSelectCity, onSelectPhoto }) => {
  const defaultCenter: [number, number] = [28.8, -9.5]; 
  const defaultZoom = 5.5; 

  const allRelevantPhotos = selectedCity 
    ? [
        ...selectedCity.photos.filter(p => !deletedDefaultIds.has(p.id) && isValidCoords(p.coords)), 
        ...customPhotos.filter(p => p.locationName === selectedCity.name && isValidCoords(p.coords))
      ]
    : [];

  return (
    <div className="w-full h-full relative z-0 bg-stone-900">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        zoomControl={false}
        className="w-full h-full"
        maxBounds={MOROCCO_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={5}
        maxZoom={16}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <ZoomControl position="bottomright" />
        
        {selectedCity ? (
          <MapUpdater center={selectedCity.center} zoom={selectedCity.zoom} />
        ) : (
          <MapUpdater bounds={MOROCCO_BOUNDS} />
        )}

        {MOROCCO_CITIES.map((city) => (
          <Marker 
            key={city.id} 
            position={city.center} 
            icon={cityIcon}
            eventHandlers={{ click: () => onSelectCity(city) }}
          >
            <Popup className="custom-map-popup">
              <div className="text-center p-2 min-w-[140px]">
                <h3 className="font-bold text-lg font-serif mb-2 text-stone-900">{city.nameAr}</h3>
                <button 
                  onClick={() => onSelectCity(city)}
                  className="w-full bg-stone-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition shadow-md"
                >
                  استكشاف الموقع
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {allRelevantPhotos.map((photo) => (
          <Marker 
            key={photo.id} 
            position={photo.coords} 
            icon={photo.id.startsWith('custom') ? customPhotoIcon : photoIcon}
          >
            <Popup>
              <div className="w-56 text-stone-900 p-1">
                <div className="relative h-32 mb-3 rounded-xl overflow-hidden shadow-sm">
                   <img src={photo.url} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-sm mb-3 px-1">{photo.title}</h4>
                <button 
                  onClick={() => onSelectPhoto(photo)}
                  className="w-full bg-amber-600 text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-900 transition"
                >
                  عرض التفاصيل
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute inset-0 pointer-events-none border-[60px] border-stone-950/20 rounded-[2.5rem]"></div>
    </div>
  );
};

export default MoroccoMap;


import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { MOROCCO_CITIES } from '../data/moroccoContent';
import { City, Photo } from '../types';

// Custom Marker Icon for Cities
const cityIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom Marker Icon for Default Photos
const photoIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3342/3342137.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

// Special Gold Marker Icon for User's Custom Photos
const customPhotoIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/10431/10431661.png', // A gold/star marker icon
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

interface MoroccoMapProps {
  selectedCity: City | null;
  customPhotos: Photo[];
  onSelectCity: (city: City) => void;
  onSelectPhoto: (photo: Photo) => void;
}

const MapUpdater = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

const MoroccoMap: React.FC<MoroccoMapProps> = ({ selectedCity, customPhotos, onSelectCity, onSelectPhoto }) => {
  const defaultCenter: [number, number] = [31.7917, -7.0926];
  const defaultZoom = 6;

  // Filter custom photos that belong to the currently selected city (if any)
  const currentCityCustomPhotos = selectedCity 
    ? customPhotos.filter(p => p.locationName === selectedCity.name)
    : [];

  // All photos to show for the current context
  const displayedPhotos = selectedCity 
    ? [...selectedCity.photos, ...currentCityCustomPhotos]
    : [];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        zoomControl={false}
        className="w-full h-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <ZoomControl position="bottomright" />
        
        {selectedCity ? (
          <MapUpdater center={selectedCity.center} zoom={selectedCity.zoom} />
        ) : (
          <MapUpdater center={defaultCenter} zoom={defaultZoom} />
        )}

        {MOROCCO_CITIES.map((city) => (
          <Marker 
            key={city.id} 
            position={city.center} 
            icon={cityIcon}
            eventHandlers={{
              click: () => onSelectCity(city),
            }}
          >
            <Popup>
              <div className="text-center p-1 text-stone-900">
                <h3 className="font-bold text-lg">{city.nameAr}</h3>
                <p className="text-sm text-stone-600">{city.name}</p>
                <button 
                  onClick={() => onSelectCity(city)}
                  className="mt-2 bg-stone-900 text-white px-3 py-1 rounded text-xs hover:bg-stone-700 transition"
                >
                  استعراض الصور
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {displayedPhotos.map((photo) => {
          const isCustom = photo.id.startsWith('custom');
          // Add a tiny random jitter to coordinates so overlapping markers are slightly offset
          const jitter: [number, number] = isCustom 
            ? [photo.coords[0] + (Math.random() - 0.5) * 0.005, photo.coords[1] + (Math.random() - 0.5) * 0.005]
            : photo.coords;

          return (
            <Marker 
              key={photo.id} 
              position={jitter} 
              icon={isCustom ? customPhotoIcon : photoIcon}
            >
              <Popup>
                <div className="w-48 text-stone-900">
                  <div className="relative">
                    <img src={photo.url} alt={photo.title} className="w-full h-24 object-cover rounded mb-2" />
                    {isCustom && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] px-1 rounded font-bold uppercase">تـصويري</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm">{photo.title}</h4>
                  <p className="text-xs text-stone-500 mb-2">{photo.locationName}</p>
                  <button 
                    onClick={() => onSelectPhoto(photo)}
                    className="w-full bg-amber-600 text-white py-1 rounded text-xs hover:bg-amber-700 transition"
                  >
                    عرض كامل
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MoroccoMap;

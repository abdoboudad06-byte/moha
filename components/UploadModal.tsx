
import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Photo } from '../types';
import { MOROCCO_CITIES } from '../data/moroccoContent';

// Custom Marker for Location Picking
const pickerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

interface UploadModalProps {
  onClose: () => void;
  onUpload: (photo: Photo) => void;
}

// Internal component to handle map clicks and auto-centering
const LocationSelector = ({ onLocationSelect, center }: { 
  onLocationSelect: (latlng: [number, number]) => void,
  center: [number, number] 
}) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, map.getZoom() < 10 ? 12 : map.getZoom());
  }, [center, map]);

  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
};

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [cityId, setCityId] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.7917, -7.0926]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas context not available');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleFile = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsProcessing(true);
      try {
        const compressed = await compressImage(file);
        setImagePreview(compressed);
      } catch (error) {
        alert("خطأ في معالجة الصورة.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCityChange = (id: string) => {
    setCityId(id);
    const city = MOROCCO_CITIES.find(c => c.id === id);
    if (city) {
      setMapCenter(city.center);
      // Default coords to city center if not picked yet
      if (!selectedCoords) setSelectedCoords(city.center);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview || !selectedCoords) return;

    const selectedCity = MOROCCO_CITIES.find(c => c.id === cityId);
    
    const newPhoto: Photo = {
      id: `custom-${Date.now()}`,
      url: imagePreview,
      title: title || "بدون عنوان",
      description: "صورة احترافية من تصوير محمد الحباسي",
      locationName: selectedCity?.name || "المغرب",
      coords: selectedCoords
    };

    onUpload(newPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl overflow-y-auto">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 my-8">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-900">إضافة عمل جديد للمعرض</h2>
            <p className="text-stone-400 text-xs uppercase tracking-widest mt-1">حدد تفاصيل الصورة وموقعها الجغرافي بدقة</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side: Photo & Info */}
          <div className="p-8 space-y-6 border-r border-stone-100">
            <div className="relative h-64 border-2 border-dashed border-stone-200 rounded-[2rem] bg-stone-50 overflow-hidden flex flex-col items-center justify-center group">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={40} className="animate-spin text-amber-600" />
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">جاري المعالجة...</p>
                </div>
              ) : imagePreview ? (
                <>
                  <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setImagePreview(null)} className="bg-white text-stone-900 px-4 py-2 rounded-full text-xs font-bold shadow-xl">تغيير الصورة</button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <Upload className="mx-auto text-amber-600 mb-4" size={40} />
                  <p className="text-stone-500 font-medium mb-2">اسحب الصورة هنا</p>
                  <p className="text-stone-300 text-[10px] uppercase font-bold tracking-widest">JPG, PNG - Max 10MB</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">عنوان العمل الفني</label>
                <input 
                  type="text" 
                  placeholder="مثال: سحر الرمال في مرزوكة"
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none font-medium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">اختيار المدينة</label>
                <select 
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 transition-all outline-none cursor-pointer appearance-none"
                  value={cityId}
                  onChange={(e) => handleCityChange(e.target.value)}
                >
                  <option value="">اختر المدينة لتحديد الموقع...</option>
                  {MOROCCO_CITIES.map(city => (
                    <option key={city.id} value={city.id}>{city.nameAr} - {city.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Side: Map Location Picker */}
          <div className="p-8 flex flex-col">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 flex justify-between items-center">
              <span>تحديد الموقع الدقيق على الخريطة</span>
              {selectedCoords && <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={12}/> تم تحديد الموقع</span>}
            </label>
            
            <div className="flex-grow h-80 lg:h-full rounded-[2.5rem] overflow-hidden border-4 border-stone-100 shadow-inner relative group">
              <MapContainer 
                center={mapCenter} 
                zoom={6} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <LocationSelector onLocationSelect={setSelectedCoords} center={mapCenter} />
                {selectedCoords && <Marker position={selectedCoords} icon={pickerIcon} />}
              </MapContainer>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl text-[10px] font-bold text-stone-500 text-center shadow-lg border border-stone-100 opacity-0 group-hover:opacity-100 transition-opacity">
                انقر على الخريطة لتغيير مكان "دبوس" الصورة
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={!imagePreview || !selectedCoords || isProcessing}
              className="mt-8 w-full bg-stone-900 text-white py-5 rounded-[1.5rem] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
            >
              <MapPin size={18} /> نشر في المعرض التفاعلي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;

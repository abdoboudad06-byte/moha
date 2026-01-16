
import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Photo } from '../types';
import { MOROCCO_CITIES } from '../data/moroccoContent';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (photo: Photo) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [cityId, setCityId] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to compress image before saving to overcome LocalStorage limits
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Optimized dimensions for web storage (1280px is enough for high-quality display)
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas context not available');
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Quality 0.7 offers the best balance between size and professional look
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFile = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsProcessing(true);
      try {
        const compressed = await compressImage(file);
        setImagePreview(compressed);
      } catch (error) {
        console.error("Compression failed", error);
        alert("فشل في معالجة الصورة. يرجى التأكد من أن الملف صالح.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) return;

    const selectedCity = MOROCCO_CITIES.find(c => c.id === cityId);
    
    const newPhoto: Photo = {
      id: `custom-${Date.now()}`,
      url: imagePreview,
      title: title || "بدون عنوان",
      description: "Custom uploaded photo",
      locationName: selectedCity?.name || "Morocco",
      coords: selectedCity?.center || [31.7917, -7.0926]
    };

    onUpload(newPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-bold">إضافة صورة احترافية</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            className={`relative h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-stone-50 hover:bg-stone-100'}`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="animate-spin text-amber-600" />
                <p className="text-stone-500 font-bold text-xs uppercase tracking-widest">جاري معالجة الصورة...</p>
              </div>
            ) : imagePreview ? (
              <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover rounded-[1.4rem]" alt="Preview" />
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                  <Upload className="text-amber-600" size={28} />
                </div>
                <p className="text-stone-500 font-medium text-center px-4">اسحب الصورة الاحترافية هنا (مهما كان حجمها)</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">عنوان الصورة</label>
              <input 
                type="text" 
                placeholder="مثلاً: غروب الشمس في الصويرة"
                className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">المدينة / الموقع</label>
              <select 
                className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition cursor-pointer"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
              >
                <option value="">تحديد الموقع لاحقاً</option>
                {MOROCCO_CITIES.map(city => (
                  <option key={city.id} value={city.id}>{city.nameAr} - {city.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={!imagePreview || isProcessing}
            className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-amber-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            نشر في المعرض
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;

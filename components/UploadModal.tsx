
import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, MapPin } from 'lucide-react';
import { Photo } from '../types';
import { MOROCCO_CITIES } from '../data/moroccoContent';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (photo: Photo) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [cityId, setCityId] = useState(''); // Default to empty for optional
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) return;

    const selectedCity = MOROCCO_CITIES.find(c => c.id === cityId);
    
    const newPhoto: Photo = {
      id: `custom-${Date.now()}`,
      url: imagePreview,
      title: title || "Untitled",
      description: "Custom uploaded photo",
      locationName: selectedCity?.name || "Morocco",
      coords: selectedCity?.center || [31.7917, -7.0926] // Default to center of Morocco
    };

    onUpload(newPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-bold">إضافة صورة جديدة</h2>
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
            {imagePreview ? (
              <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover rounded-[1.4rem]" alt="Preview" />
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                  <Upload className="text-amber-600" size={28} />
                </div>
                <p className="text-stone-500 font-medium text-center px-4">اسحب الصورة هنا أو اضغط للاختيار</p>
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
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">اسم الصورة (اختياري)</label>
              <input 
                type="text" 
                placeholder="مثلاً: هدوء الصحراء"
                className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">المدينة / الموقع (اختياري)</label>
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
            disabled={!imagePreview}
            className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-amber-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            حفظ في المعرض
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;

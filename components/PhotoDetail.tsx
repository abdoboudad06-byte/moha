
import React, { useEffect, useState } from 'react';
import { Photo, Language } from '../types';
import { getArtisticDescription } from '../services/geminiService';
import { X, MapPin, Sparkles, Download, Lock, Unlock, CreditCard, CheckCircle2, Trash2 } from 'lucide-react';
import { translations } from '../data/translations';

interface PhotoDetailProps {
  photo: Photo;
  lang: Language;
  onClose: () => void;
  isPurchased: boolean;
  onPurchase: (photoId: string) => void;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

const PhotoDetail: React.FC<PhotoDetailProps> = ({ photo, lang, onClose, isPurchased, onPurchase, isAdmin, onDelete }) => {
  const [aiText, setAiText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [imgSrc, setImgSrc] = useState(photo.url);
  const t = translations[lang];

  useEffect(() => {
    const fetchAiText = async () => {
      setLoading(true);
      const description = await getArtisticDescription(photo.title, photo.locationName, lang);
      setAiText(description);
      setLoading(false);
    };
    fetchAiText();
    setImgSrc(photo.url);
  }, [photo, lang]);

  const handleBuy = () => {
    setBuying(true);
    setTimeout(() => {
      onPurchase(photo.id);
      setBuying(false);
    }, 2000);
  };

  const handleDownload = () => {
    if (!isPurchased) return;
    const link = document.createElement('a');
    link.href = imgSrc;
    link.download = `Mohamed_El_Habassi_${photo.title || 'photo'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
        {isAdmin && onDelete && (
          <button 
            onClick={() => { if(window.confirm(lang === 'ar' ? 'حذف؟' : 'Delete?')) { onDelete(photo.id); onClose(); } }}
            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-xl"
            title="Delete Photo"
          >
            <Trash2 size={24} />
          </button>
        )}
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 text-white hover:bg-white/20 rounded-full transition"
        >
          <X size={32} />
        </button>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="h-[40vh] md:h-full relative overflow-hidden bg-stone-100 group">
          <img 
            src={imgSrc} 
            alt={photo.title} 
            className="w-full h-full object-cover select-none"
            onError={() => setImgSrc('https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&q=80&w=1200')}
          />
          
          {!isPurchased && (
            <div className="absolute inset-0 pointer-events-none z-10 opacity-30 select-none overflow-hidden" 
                 style={{ 
                   backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 150px, rgba(255,255,255,0.4) 150px, rgba(255,255,255,0.4) 151px)',
                   display: 'flex',
                   flexWrap: 'wrap',
                   justifyContent: 'center',
                   alignItems: 'center'
                 }}>
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="text-[12px] font-bold uppercase tracking-[0.5em] text-stone-900 m-8 -rotate-45 whitespace-nowrap">
                  Mohamed El Habassi
                </div>
              ))}
            </div>
          )}

          <div className="absolute bottom-6 left-6 z-20">
            <span className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md ${isPurchased ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
              {isPurchased ? <><Unlock size={12} /> {t.unlocked}</> : <><Lock size={12} /> {t.locked}</>}
            </span>
          </div>
        </div>
        
        <div className="p-8 md:p-14 flex flex-col justify-center bg-white max-h-[60vh] md:max-h-full overflow-y-auto">
          <div className="flex items-center gap-2 text-amber-600 mb-4 font-bold uppercase tracking-widest text-[10px]">
            <MapPin size={14} />
            <span>{photo.locationName}</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
            {lang === 'ar' ? photo.titleAr || photo.title : lang === 'fr' ? photo.titleFr || photo.title : photo.title}
          </h2>
          
          <div className="relative p-8 bg-stone-50 rounded-[2rem] border-l-4 border-amber-500 italic text-lg text-stone-700 leading-relaxed mb-10">
            <div className="flex items-center gap-2 text-stone-400 mb-4 not-italic">
              <Sparkles size={18} />
              <span className="text-[10px] font-black uppercase tracking-tighter">AI Curator</span>
            </div>
            {loading ? (
              <div className="h-16 flex items-center justify-center">
                <div className="animate-pulse text-stone-300 text-sm font-bold uppercase tracking-widest">{t.pondering}</div>
              </div>
            ) : (
              <p className="whitespace-pre-line text-base font-medium">{aiText}</p>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-auto">
            {!isPurchased ? (
              <button 
                onClick={handleBuy}
                disabled={buying}
                className="w-full bg-stone-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-amber-600 transition shadow-2xl flex items-center justify-center gap-4 group"
              >
                {buying ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><CreditCard size={18} className="group-hover:scale-110 transition" /> {t.license} - 19.99 MAD</>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-green-600 font-bold text-xs uppercase tracking-widest bg-green-50 p-4 rounded-xl border border-green-100">
                  <CheckCircle2 size={20} /> {t.purchaseSuccess}
                </div>
                <button 
                  onClick={handleDownload}
                  className="w-full bg-stone-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition shadow-2xl flex items-center justify-center gap-4 group"
                >
                  <Download size={18} className="group-hover:-translate-y-1 transition" /> {t.download}
                </button>
              </div>
            )}
            
            <button className="w-full border-2 border-stone-100 py-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-stone-50 transition text-stone-400">
              {t.share}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;

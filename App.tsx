
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MOROCCO_CITIES } from './data/moroccoContent';
import { City, Photo, Language } from './types';
import { translations } from './data/translations';
import MoroccoMap from './components/MoroccoMap';
import PhotoDetail from './components/PhotoDetail';
import UploadModal from './components/UploadModal';
import LoginModal from './components/LoginModal';
import { 
  Camera, Map as MapIcon, ChevronDown, Instagram, Mail, LayoutGrid, Award, MapPin, 
  ArrowRight, Lock, Unlock, Plus, Trash2, ArrowLeft, Filter, Image as ImageIcon, 
  Sparkle, LogOut, Settings, Globe, Facebook, MessageCircle, Eraser, AlertCircle, X, User 
} from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [view, setView] = useState<'landing' | 'portfolio'>('landing');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [customPhotos, setCustomPhotos] = useState<Photo[]>([]);
  const [deletedDefaultIds, setDeletedDefaultIds] = useState<string[]>([]);
  const [purchasedPhotoIds, setPurchasedPhotoIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filterCity, setFilterCity] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = translations[lang];
  const isRtl = lang === 'ar';

  useEffect(() => {
    const savedLang = localStorage.getItem('el_habassi_lang') as Language;
    if (savedLang) setLang(savedLang);

    try {
      const savedPhotosRaw = localStorage.getItem('el_habassi_custom_photos');
      if (savedPhotosRaw) {
        const parsed = JSON.parse(savedPhotosRaw);
        if (Array.isArray(parsed)) {
          const validPhotos = parsed.filter(p => p && p.url && Array.isArray(p.coords));
          setCustomPhotos(validPhotos);
        }
      }
      
      const savedPurchases = localStorage.getItem('el_habassi_purchases');
      if (savedPurchases) setPurchasedPhotoIds(JSON.parse(savedPurchases));

      const savedDeletedIds = localStorage.getItem('el_habassi_deleted_defaults');
      if (savedDeletedIds) setDeletedDefaultIds(JSON.parse(savedDeletedIds));
    } catch (e) {
      console.warn("Storage retrieval error.");
    }

    const adminStatus = localStorage.getItem('el_habassi_admin_auth');
    if (adminStatus === 'true') setIsAdmin(true);
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('el_habassi_lang', newLang);
  };

  const handlePurchase = (id: string) => {
    setPurchasedPhotoIds(prev => {
      const updated = [...prev, id];
      localStorage.setItem('el_habassi_purchases', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpload = (newPhoto: Photo) => {
    setCustomPhotos(prev => {
      const updated = [newPhoto, ...prev];
      try {
        localStorage.setItem('el_habassi_custom_photos', JSON.stringify(updated));
        setErrorMsg(null);
      } catch (e) {
        setErrorMsg(isRtl ? "الذاكرة ممتلئة." : "Storage full.");
        return prev;
      }
      return updated;
    });
    setView('portfolio');
  };

  const deletePhoto = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!isAdmin) return;
    if (!window.confirm(isRtl ? "حذف؟" : "Delete?")) return;

    if (id.startsWith('custom')) {
      setCustomPhotos(prev => {
        const updated = prev.filter(p => p.id !== id);
        localStorage.setItem('el_habassi_custom_photos', JSON.stringify(updated));
        return updated;
      });
    } else {
      setDeletedDefaultIds(prev => {
        const updated = [...prev, id];
        localStorage.setItem('el_habassi_deleted_defaults', JSON.stringify(updated));
        return updated;
      });
    }
    setSelectedPhoto(null);
  }, [isAdmin, isRtl]);

  const onAdminLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('el_habassi_admin_auth', 'true');
    setShowLogin(false);
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      if (window.confirm(isRtl ? "هل تريد الخروج؟" : "Logout?")) {
        setIsAdmin(false);
        localStorage.removeItem('el_habassi_admin_auth');
      }
    } else {
      setShowLogin(true);
    }
  };

  const allPhotos = useMemo(() => [
    ...customPhotos, 
    ...MOROCCO_CITIES.flatMap(city => city.photos).filter(p => !deletedDefaultIds.includes(p.id))
  ], [customPhotos, deletedDefaultIds]);

  const filteredPhotos = useMemo(() => 
    filterCity === 'all' ? allPhotos : allPhotos.filter(p => p.locationName === filterCity),
    [allPhotos, filterCity]
  );

  const scrollToMap = (e: React.MouseEvent) => {
    e.preventDefault();
    if (view !== 'landing') setView('landing');
    setTimeout(() => {
      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className={`min-h-screen bg-[#FCFBF7] text-stone-900 font-sans selection:bg-amber-200`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Admin Status Bar - More prominent */}
      {isAdmin && (
        <div className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-3 text-center fixed top-0 w-full z-[110] flex items-center justify-between px-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <Settings size={14} className="animate-spin-slow" /> 
            <span className="hidden md:inline">{t.adminPortal}</span>
            <span className="md:hidden">وضع المصور</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowUpload(true)} 
              className="bg-stone-900 px-6 py-1.5 rounded-full text-white flex items-center gap-2 hover:bg-stone-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg border border-white/10"
            >
              <Plus size={14} /> {t.addWork}
            </button>
            <button onClick={handleAdminToggle} className="text-white/80 hover:text-white transition">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isAdmin ? 'mt-11' : ''} ${scrolled || view === 'portfolio' ? 'bg-white/95 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
            <div className={`p-2.5 rounded-2xl transition-all group-hover:rotate-12 ${(scrolled || view === 'portfolio') ? 'bg-stone-900 text-white' : 'bg-white/20 text-white backdrop-blur-md'}`}>
              <Camera size={22} />
            </div>
            <div>
               <h1 className={`text-xl md:text-2xl font-serif font-bold leading-none ${(scrolled || view === 'portfolio') ? 'text-stone-900' : 'text-white'}`}>
                M. El Habassi
              </h1>
              <span className={`text-[8px] uppercase tracking-[0.3em] font-black ${(scrolled || view === 'portfolio') ? 'text-amber-600' : 'text-amber-200'}`}>Professional Photographer</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest">
            <button onClick={() => setView('landing')} className={`${(scrolled || view === 'portfolio') ? 'text-stone-500' : 'text-white/80'} hover:text-amber-500 transition-colors`}>{t.home}</button>
            <button onClick={() => setView('portfolio')} className={`${(scrolled || view === 'portfolio') ? 'text-stone-500' : 'text-white/80'} hover:text-amber-500 transition-colors`}>{t.portfolio}</button>
            <button onClick={scrollToMap} className={`${(scrolled || view === 'portfolio') ? 'text-stone-500' : 'text-white/80'} hover:text-amber-500 flex items-center gap-2 transition-colors`}>
              <MapIcon size={14} /> {t.interactiveMap}
            </button>
            
            <button onClick={handleAdminToggle} className={`${(scrolled || view === 'portfolio') ? 'bg-stone-100 text-stone-900 border-stone-200' : 'bg-white/10 text-white border-white/30'} px-5 py-2.5 rounded-full border hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all flex items-center gap-2 font-black`}>
              {isAdmin ? <LogOut size={16} /> : <User size={16} />}
              {isAdmin ? t.exitAdmin : t.ownerLogin}
            </button>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${(scrolled || view === 'portfolio') ? 'text-stone-400 border-stone-200' : 'text-white border-white/20'}`}>
              <Globe size={14} />
              <button onClick={() => changeLanguage('ar')} className={`px-1.5 transition-colors ${lang === 'ar' ? 'text-amber-500 font-black' : 'hover:text-amber-500'}`}>AR</button>
              <button onClick={() => changeLanguage('en')} className={`px-1.5 transition-colors ${lang === 'en' ? 'text-amber-500 font-black' : 'hover:text-amber-500'}`}>EN</button>
            </div>
          </div>
        </div>
      </nav>

      {view === 'landing' ? (
        <>
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover scale-105 animate-slow-zoom" />
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
            <div className="relative z-10 text-center text-white px-4 max-w-4xl fade-in-section">
              <h2 className="text-5xl md:text-8xl font-serif mb-8 leading-tight">
                {lang === 'ar' ? 'المغرب بعدستي' : 'Morocco Through'} <br/> 
                <span className="italic text-amber-200">{lang === 'ar' ? 'بلمسة احترافية' : 'My Lens'}</span>
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
                <button onClick={() => setView('portfolio')} className="w-full md:w-auto bg-white text-stone-900 px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-50 transition shadow-2xl flex items-center justify-center gap-3 group">
                  {t.explorePortfolio} <ArrowRight size={18} className={`${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                </button>
                <button onClick={scrollToMap} className="w-full md:w-auto bg-white/10 backdrop-blur-md border border-white/30 text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition flex items-center justify-center gap-3">
                  <MapIcon size={18} /> {t.interactiveMap}
                </button>
              </div>
            </div>
          </section>

          <section id="map" className="py-24 bg-stone-950 text-white scroll-mt-20">
            <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="space-y-4">
                <span className="text-amber-500 font-bold uppercase tracking-[0.4em] text-[10px] block">{t.interactiveJourney}</span>
                <h3 className="text-4xl md:text-6xl font-serif text-white">{lang === 'ar' ? 'خريطة المملكة المغربية' : 'Map of Morocco'}</h3>
              </div>
              <p className="text-stone-400 text-sm md:text-base max-w-md leading-relaxed border-l border-stone-800 pl-6">
                {lang === 'ar' 
                  ? 'استكشف جمال وتنوع المناظر الطبيعية في المملكة المغربية كاملة من طنجة شمالاً إلى الكويرة جنوباً عبر هذه الخريطة التفاعلية الحصرية.' 
                  : 'Explore the beauty and diversity of the entire Kingdom of Morocco, from Tangier in the North to Lagouira in the South, through this exclusive interactive map.'}
              </p>
            </div>
            <div className="px-6 max-w-[1500px] mx-auto">
              <div className="h-[800px] w-full rounded-[3.5rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.8)] border-[6px] border-stone-900/40 relative">
                <MoroccoMap selectedCity={selectedCity} customPhotos={customPhotos} deletedDefaultIds={new Set(deletedDefaultIds)} onSelectCity={setSelectedCity} onSelectPhoto={setSelectedPhoto} />
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="pt-40 pb-32 px-6 max-w-7xl mx-auto">
          <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone-100 pb-12 gap-8">
            <div className="space-y-6">
              <button onClick={() => setView('landing')} className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors font-black text-[10px] uppercase tracking-widest">
                 <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''} /> {t.backHome}
              </button>
              <h2 className="text-5xl md:text-8xl font-serif">{t.completePortfolio}</h2>
            </div>
            <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-3xl border border-stone-100 shadow-sm">
              <Filter size={18} className="text-stone-400" />
              <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="bg-transparent text-xs font-black uppercase tracking-widest focus:outline-none cursor-pointer pr-4">
                <option value="all">{t.allLocations}</option>
                {MOROCCO_CITIES.map(c => <option key={c.id} value={c.name}>{isRtl ? c.nameAr : c.name}</option>)}
              </select>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Direct Upload Card for Admins */}
            {isAdmin && (
              <div 
                onClick={() => setShowUpload(true)}
                className="group cursor-pointer relative flex flex-col items-center justify-center border-4 border-dashed border-amber-500/30 rounded-[2.5rem] p-12 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-500 transition-all aspect-[4/5] text-center"
              >
                <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <Plus size={40} />
                </div>
                <h4 className="text-2xl font-serif font-bold text-stone-900 mb-2">إضافة عمل فني جديد</h4>
                <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">انقر هنا لرفع صورة جديدة وتحديد موقعها</p>
              </div>
            )}

            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="group cursor-pointer relative overflow-hidden rounded-[2.5rem] shadow-xl transition-all hover:-translate-y-2 aspect-[4/5] bg-stone-100" onClick={() => setSelectedPhoto(photo)}>
                <img src={photo.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin size={12} /> {photo.locationName}
                  </span>
                  <h4 className="text-2xl font-serif text-white mb-6 leading-tight">{photo.title}</h4>
                  <div className="flex items-center justify-between">
                    <button className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/30 hover:bg-white hover:text-stone-900 transition-all">
                       {lang === 'ar' ? 'عرض العمل' : 'View Work'}
                    </button>
                    {isAdmin && (
                      <button onClick={(e) => deletePhoto(photo.id, e)} className="p-3 bg-red-500/80 rounded-full hover:bg-red-600 transition shadow-lg text-white">
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="bg-stone-50 py-24 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col items-center gap-8">
            <div className="p-4 bg-stone-900 text-white rounded-full">
               <Camera size={32} />
            </div>
            <h4 className="text-4xl md:text-5xl font-serif italic">Mohamed El Habassi</h4>
            <div className="flex justify-center gap-8 my-8">
              <a href="#" className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100 text-stone-400 hover:text-amber-600 hover:shadow-md transition-all"><Instagram size={24}/></a>
              <a href="#" className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100 text-stone-400 hover:text-amber-600 hover:shadow-md transition-all"><Facebook size={24}/></a>
              <a href="#" className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100 text-stone-400 hover:text-green-600 hover:shadow-md transition-all"><MessageCircle size={24}/></a>
              <a href="mailto:contact@habassi.com" className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100 text-stone-400 hover:text-amber-600 hover:shadow-md transition-all"><Mail size={24}/></a>
            </div>
            <div className="pt-12 border-t border-stone-200 w-full flex flex-col md:flex-row justify-between items-center gap-6">
               <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.4em]">© 2024 Moroccan Visuals - Mohamed El Habassi</p>
               <button onClick={handleAdminToggle} className="text-[10px] text-stone-300 hover:text-stone-900 font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-2">
                 <Lock size={12} /> {isAdmin ? t.exitAdmin : t.ownerLogin}
               </button>
            </div>
          </div>
        </div>
      </footer>

      {selectedPhoto && <PhotoDetail photo={selectedPhoto} lang={lang} onClose={() => setSelectedPhoto(null)} isPurchased={purchasedPhotoIds.includes(selectedPhoto.id)} onPurchase={handlePurchase} isAdmin={isAdmin} onDelete={(id) => deletePhoto(id)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={onAdminLoginSuccess} />}
    </div>
  );
};

export default App;

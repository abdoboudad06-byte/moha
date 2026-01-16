
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MOROCCO_CITIES } from './data/moroccoContent';
import { City, Photo, Language } from './types';
import { translations } from './data/translations';
import MoroccoMap from './components/MoroccoMap';
import PhotoDetail from './components/PhotoDetail';
import UploadModal from './components/UploadModal';
import LoginModal from './components/LoginModal';
// Added X to the lucide-react imports
import { Camera, Map as MapIcon, ChevronDown, Instagram, Mail, LayoutGrid, Award, MapPin, ArrowRight, Lock, Unlock, Plus, Trash2, ArrowLeft, Filter, Image as ImageIcon, Sparkle, LogOut, Settings, Globe, Facebook, MessageCircle, Eraser, AlertCircle, X } from 'lucide-react';

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

    // Initial load from localStorage
    try {
      const savedPhotosRaw = localStorage.getItem('el_habassi_custom_photos');
      if (savedPhotosRaw) {
        const parsed = JSON.parse(savedPhotosRaw);
        // Validate each photo has coordinates to avoid NaN errors on map
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
      console.warn("Storage data corrupted, resetting.");
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
      try {
        localStorage.setItem('el_habassi_purchases', JSON.stringify(updated));
      } catch(e) {}
      return updated;
    });
  };

  const handleUpload = (newPhoto: Photo) => {
    // Validate coordinates are numbers before uploading
    if (!Array.isArray(newPhoto.coords) || isNaN(newPhoto.coords[0]) || isNaN(newPhoto.coords[1])) {
      setErrorMsg(isRtl ? "حدث خطأ في تحديد الموقع الجغرافي." : "Geolocation error.");
      return;
    }

    setCustomPhotos(prev => {
      const updated = [newPhoto, ...prev];
      try {
        localStorage.setItem('el_habassi_custom_photos', JSON.stringify(updated));
        setErrorMsg(null);
      } catch (e) {
        // Updated error message to be more descriptive about storage limits
        setErrorMsg(isRtl 
          ? "الذاكرة ممتلئة. يرجى حذف بعض الصور القديمة لتتمكن من إضافة المزيد." 
          : "Storage full. Please delete some old photos to add new ones.");
        return prev; // Revert if failed
      }
      return updated;
    });
    if (!errorMsg) setView('portfolio');
  };

  const deletePhoto = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAdmin) return;
    
    const confirmMsg = isRtl ? "هل أنت متأكد من حذف هذه الصورة؟" : "Are you sure you want to delete this photo?";
    if (!window.confirm(confirmMsg)) return;

    if (id.startsWith('custom')) {
      setCustomPhotos(prev => {
        const updated = prev.filter(p => p.id !== id);
        localStorage.setItem('el_habassi_custom_photos', JSON.stringify(updated));
        return updated;
      });
    } else {
      setDeletedDefaultIds(prev => {
        if (prev.includes(id)) return prev;
        const updated = [...prev, id];
        localStorage.setItem('el_habassi_deleted_defaults', JSON.stringify(updated));
        return updated;
      });
    }
    
    setSelectedPhoto(prev => (prev?.id === id ? null : prev));
  }, [isAdmin, isRtl]);

  const clearAllDefaults = () => {
    if (!isAdmin) return;
    const confirmMsg = isRtl ? "هل أنت متأكد من حذف جميع صور النظام والابقاء فقط على أعمالك الخاصة؟" : "Are you sure you want to clear all system photos and show only your work?";
    if (!window.confirm(confirmMsg)) return;

    const allDefaultIds = MOROCCO_CITIES.flatMap(city => city.photos.map(p => p.id));
    setDeletedDefaultIds(allDefaultIds);
    localStorage.setItem('el_habassi_deleted_defaults', JSON.stringify(allDefaultIds));
  };

  const onAdminLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('el_habassi_admin_auth', 'true');
    setShowLogin(false);
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      if (window.confirm(isRtl ? "هل تريد الخروج؟" : "Do you want to logout?")) {
        setIsAdmin(false);
        localStorage.removeItem('el_habassi_admin_auth');
      }
    } else {
      setShowLogin(true);
    }
  };

  const activeDefaultPhotos = useMemo(() => 
    MOROCCO_CITIES.flatMap(city => city.photos)
      .filter(p => !deletedDefaultIds.includes(p.id)),
    [deletedDefaultIds]
  );

  const allPhotos = useMemo(() => [...customPhotos, ...activeDefaultPhotos], [customPhotos, activeDefaultPhotos]);

  const filteredPhotos = useMemo(() => 
    filterCity === 'all' 
      ? allPhotos 
      : allPhotos.filter(p => p.locationName === filterCity),
    [allPhotos, filterCity]
  );

  const navigateToPortfolio = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setView('portfolio');
    window.scrollTo(0, 0);
  };

  const navigateToHome = () => {
    setView('landing');
    window.scrollTo(0, 0);
  };

  const scrollToMap = (e: React.MouseEvent) => {
    e.preventDefault();
    const mapSection = document.getElementById('map');
    if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-[#FCFBF7] text-stone-900 font-sans selection:bg-amber-200 transition-all duration-300`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Admin Status Bar */}
      {isAdmin && (
        <div className="bg-stone-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-2 text-center fixed top-0 w-full z-[110] flex items-center justify-between px-6 shadow-lg border-b border-white/10">
          <div className="flex items-center gap-2">
            <Settings size={12} className="text-amber-500 animate-spin-slow" /> {t.adminPortal} - Mohamed El Habassi
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={clearAllDefaults}
              className="flex items-center gap-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1 rounded transition border border-red-500/30"
            >
              <Eraser size={12} /> {t.clearDefaults}
            </button>
            <button onClick={() => setShowUpload(true)} className="bg-amber-600 px-3 py-1 rounded text-white flex items-center gap-1 hover:bg-amber-500 transition">
              <Plus size={12} /> {t.addWork}
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <span className="font-bold text-sm">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-4 opacity-50 hover:opacity-100"><X size={16} /></button>
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isAdmin ? 'mt-8' : ''} ${scrolled || view === 'portfolio' ? 'bg-white/95 backdrop-blur-md py-4 shadow-sm border-b border-stone-100' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={navigateToHome}>
            <div className={`p-2 rounded-full ${(scrolled || view === 'portfolio') ? 'bg-stone-900 text-white' : 'bg-white/20 text-white backdrop-blur-md'}`}>
              <Camera size={20} />
            </div>
            <h1 className={`text-xl md:text-2xl font-serif font-bold tracking-tight transition-colors ${(scrolled || view === 'portfolio') ? 'text-stone-900' : 'text-white'}`}>
              Mohamed El Habassi
            </h1>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
            <div className={`flex items-center gap-6 ${(scrolled || view === 'portfolio') ? 'text-stone-600' : 'text-white/80'}`}>
              <button onClick={navigateToHome} className="hover:text-amber-600 transition">{t.home}</button>
              <button onClick={navigateToPortfolio} className="hover:text-amber-600 transition">{t.portfolio}</button>
              <button className="hover:text-amber-600 transition">{t.contact}</button>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-current opacity-60 hover:opacity-100 transition ${(scrolled || view === 'portfolio') ? 'text-stone-400 border-stone-200' : 'text-white border-white/20'}`}>
              <Globe size={14} />
              <button onClick={() => changeLanguage('en')} className={`px-1.5 hover:text-amber-500 ${lang === 'en' ? 'text-amber-500 font-black' : ''}`}>EN</button>
              <span className="opacity-20">|</span>
              <button onClick={() => changeLanguage('fr')} className={`px-1.5 hover:text-amber-500 ${lang === 'fr' ? 'text-amber-500 font-black' : ''}`}>FR</button>
              <span className="opacity-20">|</span>
              <button onClick={() => changeLanguage('ar')} className={`px-1.5 hover:text-amber-500 ${lang === 'ar' ? 'text-amber-500 font-black' : ''}`}>AR</button>
            </div>
          </div>
        </div>
      </nav>

      {view === 'landing' ? (
        <>
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&q=80&w=2000" 
                alt="Morocco Architecture" 
                className="w-full h-full object-cover scale-105 animate-slow-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
            </div>
            <div className="relative z-10 text-center text-white px-4 max-w-4xl fade-in-section">
              <span className="text-xs md:text-sm font-bold uppercase tracking-[0.6em] mb-4 block opacity-80">Professional Visual Storyteller</span>
              <h2 className="text-5xl md:text-8xl font-serif mb-6 leading-tight">
                {lang === 'ar' ? 'المغرب بعدستي' : lang === 'fr' ? 'Le Maroc à travers' : 'Morocco Through'} <br/> 
                <span className="italic text-amber-200">{lang === 'ar' ? 'بلمسة احترافية' : lang === 'fr' ? 'Mon Objectif' : 'My Lens'}</span>
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
                <button onClick={navigateToPortfolio} className="group bg-white text-stone-900 px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-50 transition shadow-2xl flex items-center gap-2">
                  {t.explorePortfolio} <ArrowRight size={16} className={`${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                </button>
                <button onClick={scrollToMap} className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition">
                  {t.interactiveMap}
                </button>
              </div>
            </div>
          </section>

          <section id="gallery" className="py-32 px-6 max-w-7xl mx-auto">
            <header className="mb-20 flex justify-between items-end">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-[2px] w-12 bg-amber-600"></div>
                  <span className="text-amber-600 font-bold uppercase tracking-[0.4em] text-xs">{t.highlights}</span>
                </div>
                <h3 className="text-4xl md:text-6xl font-serif">{t.selectedWorks}</h3>
              </div>
              <button onClick={navigateToPortfolio} className="text-stone-400 hover:text-stone-900 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition">
                {t.viewFullPortfolio} <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
              </button>
            </header>

            {allPhotos.length === 0 ? (
              <div className="py-20 text-center bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200">
                <ImageIcon size={48} className="mx-auto text-stone-300 mb-6" />
                <h4 className="text-xl font-serif text-stone-400 mb-2">المعرض فارغ حالياً</h4>
                <p className="text-stone-400 text-sm mb-8 uppercase tracking-widest">قم بإضافة صورك الاحترافية من لوحة التحكم</p>
                {isAdmin && (
                  <button onClick={() => setShowUpload(true)} className="bg-amber-600 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-amber-700 transition shadow-lg">
                    {t.addWork}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allPhotos.slice(0, 6).map((photo) => (
                  <div 
                    key={photo.id} 
                    className="group cursor-pointer relative overflow-hidden rounded-3xl shadow-xl transition-all duration-700 hover:-translate-y-2"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-1000" />
                      {!purchasedPhotoIds.includes(photo.id) && (
                        <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center rotate-[-30deg]">
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2">© El Habassi</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-white">
                      <div className="flex justify-between items-end w-full">
                        <h4 className="text-2xl font-serif">
                          {lang === 'ar' ? photo.titleAr || photo.title : lang === 'fr' ? photo.titleFr || photo.title : photo.title}
                        </h4>
                        {isAdmin && (
                          <button 
                            onClick={(e) => deletePhoto(photo.id, e)}
                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg mb-2 z-20"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section id="map" className="py-32 bg-stone-900 text-white relative">
            <div className="max-w-7xl mx-auto px-6 mb-16">
              <span className="text-amber-500 font-bold uppercase tracking-[0.4em] text-xs mb-4 block">{t.interactiveJourney}</span>
              <h3 className="text-4xl md:text-6xl font-serif">{t.exploreMap}</h3>
            </div>
            <div className="px-6 max-w-7xl mx-auto relative z-10">
              <div className="h-[600px] w-full rounded-[2rem] overflow-hidden shadow-2xl border-8 border-stone-800">
                <MoroccoMap 
                  selectedCity={selectedCity} 
                  customPhotos={customPhotos}
                  deletedDefaultIds={new Set(deletedDefaultIds)}
                  onSelectCity={setSelectedCity} 
                  onSelectPhoto={setSelectedPhoto} 
                />
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="pt-40 pb-32 px-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="mb-16 border-b border-stone-100 pb-12">
            <button onClick={navigateToHome} className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition font-bold text-xs uppercase tracking-widest mb-12">
              <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''} /> {t.backHome}
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <h2 className="text-5xl md:text-7xl font-serif mb-4">{t.completePortfolio}</h2>
                <p className="text-stone-400 text-lg">{t.desc}</p>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
                  <Filter size={14} className="text-stone-400" />
                  <select 
                    value={filterCity} 
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="bg-transparent text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
                  >
                    <option value="all">{t.allLocations}</option>
                    {MOROCCO_CITIES.map(c => <option key={c.id} value={c.name}>{isRtl ? c.nameAr : lang === 'fr' ? c.nameFr : c.name}</option>)}
                  </select>
                </div>
                {isAdmin && (
                  <button onClick={() => setShowUpload(true)} className="bg-amber-600 text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg">
                    <Plus size={16} /> {t.addWork}
                  </button>
                )}
              </div>
            </div>
          </header>

          {filteredPhotos.length === 0 ? (
            <div className="py-40 text-center">
               <ImageIcon size={64} className="mx-auto text-stone-200 mb-6" />
               <p className="text-stone-400 font-serif text-2xl tracking-widest">لا توجد صور في هذا القسم بعد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredPhotos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="group cursor-pointer relative overflow-hidden rounded-[2rem] shadow-lg transition-all duration-500 hover:shadow-2xl aspect-[4/5]"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-8 flex flex-col justify-end">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-serif text-white">
                          {lang === 'ar' ? photo.titleAr || photo.title : lang === 'fr' ? photo.titleFr || photo.title : photo.title}
                        </h4>
                      </div>
                      {isAdmin && (
                        <button 
                          onClick={(e) => deletePhoto(photo.id, e)} 
                          className="p-3 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition shadow-lg z-20"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <footer className="bg-stone-50 border-t border-stone-200 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-4xl font-serif mb-6">Mohamed El Habassi</h4>
              <p className="text-stone-400 text-lg max-w-xl leading-relaxed mb-8">{t.desc}</p>
              <div className="flex gap-6">
                <a href="#" className="p-3 bg-white rounded-xl text-stone-400 hover:text-amber-600 border border-stone-100 shadow-sm transition"><Instagram size={20} /></a>
                <a href="#" className="p-3 bg-white rounded-xl text-stone-400 hover:text-amber-600 border border-stone-100 shadow-sm transition"><Facebook size={20} /></a>
                <a href="#" className="p-3 bg-white rounded-xl text-stone-400 hover:text-amber-600 border border-stone-100 shadow-sm transition"><MessageCircle size={20} /></a>
                <a href="#" className="p-3 bg-white rounded-xl text-stone-400 hover:text-amber-600 border border-stone-100 shadow-sm transition"><Mail size={20} /></a>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-xl shadow-stone-900/5">
              <h5 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 mb-6 flex items-center gap-2">
                <Settings size={14} /> {t.photographerAccess}
              </h5>
              <button 
                onClick={handleAdminToggle} 
                className={`w-full p-6 rounded-[1.5rem] transition-all duration-300 flex items-center justify-center gap-3 font-bold uppercase tracking-[0.1em] text-sm
                  ${isAdmin ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-stone-900 text-white hover:bg-amber-600 shadow-2xl shadow-stone-900/20'}`}
              >
                {isAdmin ? <><LogOut size={20} /> {t.exitAdmin}</> : <><Lock size={20} /> {t.ownerLogin}</>}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {selectedPhoto && (
        <PhotoDetail 
          photo={selectedPhoto} 
          lang={lang} 
          onClose={() => setSelectedPhoto(null)} 
          isPurchased={purchasedPhotoIds.includes(selectedPhoto.id)}
          onPurchase={handlePurchase}
          isAdmin={isAdmin}
          onDelete={(id) => deletePhoto(id)}
        />
      )}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={onAdminLoginSuccess} />}

      <style>{`
        @keyframes slow-zoom { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
        .animate-slow-zoom { animation: slow-zoom 20s infinite alternate ease-in-out; }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;

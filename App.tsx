
import React, { useState, useEffect } from 'react';
import { MOROCCO_CITIES } from './data/moroccoContent';
import { City, Photo, Language } from './types';
import { translations } from './data/translations';
import MoroccoMap from './components/MoroccoMap';
import PhotoDetail from './components/PhotoDetail';
import UploadModal from './components/UploadModal';
import LoginModal from './components/LoginModal';
import { Camera, Map as MapIcon, ChevronDown, Instagram, Mail, LayoutGrid, Award, MapPin, ArrowRight, Lock, Unlock, Plus, Trash2, ArrowLeft, Filter, Image as ImageIcon, Sparkle, LogOut, Settings, Globe, Facebook, MessageCircle } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [view, setView] = useState<'landing' | 'portfolio'>('landing');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [customPhotos, setCustomPhotos] = useState<Photo[]>([]);
  const [purchasedPhotoIds, setPurchasedPhotoIds] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filterCity, setFilterCity] = useState<string>('all');

  const t = translations[lang];
  const isRtl = lang === 'ar';

  useEffect(() => {
    const savedLang = localStorage.getItem('el_habassi_lang') as Language;
    if (savedLang) setLang(savedLang);

    const savedPhotos = localStorage.getItem('el_habassi_custom_photos');
    if (savedPhotos) {
      try {
        setCustomPhotos(JSON.parse(savedPhotos));
      } catch (e) {
        console.error("Failed to load local photos");
      }
    }

    const savedPurchases = localStorage.getItem('el_habassi_purchases');
    if (savedPurchases) {
      try {
        setPurchasedPhotoIds(new Set(JSON.parse(savedPurchases)));
      } catch (e) {
        console.error("Failed to load purchases");
      }
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
    const newPurchases = new Set(purchasedPhotoIds);
    newPurchases.add(id);
    setPurchasedPhotoIds(newPurchases);
    localStorage.setItem('el_habassi_purchases', JSON.stringify(Array.from(newPurchases)));
  };

  const handleUpload = (newPhoto: Photo) => {
    const updated = [newPhoto, ...customPhotos];
    setCustomPhotos(updated);
    localStorage.setItem('el_habassi_custom_photos', JSON.stringify(updated));
    setView('portfolio');
  };

  const deletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    const updated = customPhotos.filter(p => p.id !== id);
    setCustomPhotos(updated);
    localStorage.setItem('el_habassi_custom_photos', JSON.stringify(updated));
  };

  const onAdminLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('el_habassi_admin_auth', 'true');
    setShowLogin(false);
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      if (window.confirm("هل تريد الخروج؟")) {
        setIsAdmin(false);
        localStorage.removeItem('el_habassi_admin_auth');
      }
    } else {
      setShowLogin(true);
    }
  };

  const allPhotos = [
    ...customPhotos,
    ...MOROCCO_CITIES.flatMap(city => city.photos)
  ];

  const filteredPhotos = filterCity === 'all' 
    ? allPhotos 
    : allPhotos.filter(p => p.locationName === filterCity);

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
        <div className="bg-amber-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-2 text-center fixed top-0 w-full z-[110] flex items-center justify-center gap-2 shadow-lg">
          <Settings size={12} className="animate-spin-slow" /> Management Mode Active - Mohamed El Habassi
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isAdmin ? 'mt-8' : ''} ${scrolled || view === 'portfolio' ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm border-b border-stone-100' : 'bg-transparent py-6'}`}>
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

            {isAdmin && (
              <button 
                onClick={() => setShowUpload(true)}
                className="bg-amber-600 text-white px-5 py-2 rounded-full flex items-center gap-2 hover:bg-amber-700 transition shadow-xl"
              >
                <Plus size={16} /> {t.addWork}
              </button>
            )}
          </div>
        </div>
      </nav>

      {view === 'landing' ? (
        <>
          {/* Hero Section */}
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

          {/* Social Media Highlight Section */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-amber-600 mb-8">Connect With Mohamed</h3>
              <div className="flex justify-center gap-12">
                <a href="#" className="flex flex-col items-center gap-3 group">
                   <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm"><Instagram size={28} /></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-stone-900 transition">Instagram</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-3 group">
                   <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm"><Facebook size={28} /></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-stone-900 transition">Facebook</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-3 group">
                   <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm"><MessageCircle size={28} /></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-stone-900 transition">WhatsApp</span>
                </a>
              </div>
            </div>
          </section>

          {/* Highlights Grid */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allPhotos.slice(0, 6).map((photo) => (
                <div 
                  key={photo.id} 
                  className="group cursor-pointer relative overflow-hidden rounded-3xl shadow-xl transition-all duration-700 hover:-translate-y-2"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-1000" />
                    
                    {/* Watermark in Grid */}
                    {!purchasedPhotoIds.has(photo.id) && (
                      <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center rotate-[-30deg]">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2">© El Habassi</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-white">
                    <h4 className="text-2xl font-serif">
                      {lang === 'ar' ? photo.titleAr || photo.title : lang === 'fr' ? photo.titleFr || photo.title : photo.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Map */}
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
                  onSelectCity={setSelectedCity} 
                  onSelectPhoto={setSelectedPhoto} 
                />
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Full Portfolio Page View - Uniform Grid Layout */
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPhotos.map((photo) => (
              <div 
                key={photo.id} 
                className="group cursor-pointer relative overflow-hidden rounded-[2rem] shadow-lg transition-all duration-500 hover:shadow-2xl aspect-[4/5]"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                
                {/* Watermark in Portfolio Grid */}
                {!purchasedPhotoIds.has(photo.id) && (
                  <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center rotate-[-45deg] overflow-hidden">
                    <span className="text-[14px] font-black uppercase tracking-[1em] whitespace-nowrap">Mohamed El Habassi Mohamed El Habassi</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-8 flex flex-col justify-end">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xl font-serif text-white">
                        {lang === 'ar' ? photo.titleAr || photo.title : lang === 'fr' ? photo.titleFr || photo.title : photo.title}
                      </h4>
                    </div>
                    {isAdmin && photo.id.startsWith('custom') && (
                      <button onClick={(e) => deletePhoto(photo.id, e)} className="p-3 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition shadow-lg">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-stone-50 border-t border-stone-200 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-4xl font-serif mb-6">Mohamed El Habassi</h4>
              <p className="text-stone-400 text-lg max-w-xl leading-relaxed mb-8">
                {t.desc}
              </p>
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
              <p className="mt-6 text-[11px] text-stone-400 text-center uppercase tracking-widest leading-loose">
                {t.protectedArea}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between border-t border-stone-200 pt-12 gap-8">
            <div className="flex gap-4 text-[10px] font-black tracking-widest">
               <button onClick={() => changeLanguage('en')} className={lang === 'en' ? 'text-amber-600' : 'text-stone-300'}>EN</button>
               <button onClick={() => changeLanguage('fr')} className={lang === 'fr' ? 'text-amber-600' : 'text-stone-300'}>FR</button>
               <button onClick={() => changeLanguage('ar')} className={lang === 'ar' ? 'text-amber-600' : 'text-stone-300'}>AR</button>
            </div>
            <div className="text-[10px] text-stone-300 uppercase tracking-[0.5em] text-center md:text-right">
              &copy; {new Date().getFullYear()} Mohamed El Habassi Photography • {t.footerNote}
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedPhoto && (
        <PhotoDetail 
          photo={selectedPhoto} 
          lang={lang} 
          onClose={() => setSelectedPhoto(null)} 
          isPurchased={purchasedPhotoIds.has(selectedPhoto.id)}
          onPurchase={handlePurchase}
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


import React, { useState } from 'react';
import { X, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (password: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') {
      onLogin(password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition text-stone-400 hover:text-stone-900"
        >
          <X size={24} />
        </button>

        <div className="p-10 pt-16 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Lock className="text-amber-600" size={32} />
          </div>
          
          <h2 className="text-3xl font-serif font-bold mb-2">Owner Portal</h2>
          <p className="text-stone-400 text-sm mb-10 uppercase tracking-widest font-bold">Welcome back, Mohamed</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input 
                type="password" 
                autoFocus
                required
                placeholder="Enter Secret Key"
                className={`w-full px-6 py-5 bg-stone-50 border ${error ? 'border-red-500 bg-red-50 animate-shake' : 'border-stone-100'} rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-center text-xl tracking-[0.5em] font-bold`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
              />
              {error && <p className="text-red-500 text-[10px] font-bold uppercase mt-2 tracking-widest">Incorrect Key - Access Denied</p>}
            </div>

            <button 
              type="submit"
              className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-amber-600 transition shadow-xl shadow-stone-900/20 flex items-center justify-center gap-3 group"
            >
              Verify Identity <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 flex items-center justify-center gap-2 text-stone-300">
            <ShieldCheck size={14} />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Secure Access for Mohamed El Habassi</span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default LoginModal;

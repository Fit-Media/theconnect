import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, CheckCircle2, AlertCircle, Chrome } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage({ type: 'success', text: 'Account created successfully!' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage({ type: 'success', text: 'Signed in successfully!' });
      }
      if (onSuccess) setTimeout(onSuccess, 1500);
      setTimeout(onClose, 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setMessage({ type: 'success', text: 'Signed in with Google!' });
      if (onSuccess) setTimeout(onSuccess, 1500);
      setTimeout(onClose, 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-panel relative w-full max-w-md p-8 pt-10 rounded-2xl border-gold/30 shadow-[0_0_40px_rgba(212,175,55,0.15)] overflow-hidden"
          >
            {/* Background Vibe */}
            <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-gold transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8 relative z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gold/20 to-transparent flex items-center justify-center mx-auto mb-4 border border-gold/30">
                <Mail className="text-gold" size={24} />
              </div>
              <h2 className="text-2xl font-serif text-gold tracking-widest uppercase mb-2">
                {isSignUp ? 'Create Account' : 'Claim Your Access'}
              </h2>
              <p className="text-sm text-sand/70">
                {isSignUp 
                  ? 'Sign up to build and save your curated itinerary.' 
                  : 'Sign in to access your curated itinerary.'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 relative z-10">
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/30"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-sand focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/30"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg flex items-start gap-3 text-sm border ${message.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-200' : 'bg-red-900/20 border-red-500/30 text-red-200'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                  <p>{message.text}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || message?.type === 'success'}
                className="w-full bg-gold text-deep font-bold tracking-widest uppercase py-3 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-4 relative z-10">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading || message?.type === 'success'}
                className="w-full border border-white/20 bg-black/40 text-sand font-bold tracking-widest uppercase py-3 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Chrome size={18} />
                Continue with Google
              </button>
            </div>

            <div className="mt-6 text-center relative z-10">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage(null);
                }}
                className="text-white/50 hover:text-gold text-xs tracking-widest uppercase transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>

            <p className="text-center text-[10px] text-white/30 tracking-widest uppercase mt-6 relative z-10">
              Secure authentication via Firebase
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

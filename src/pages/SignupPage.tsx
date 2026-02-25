import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Username rules
const USERNAME_MIN = 3;
const USERNAME_MAX = 20;
const USERNAME_REGEX = /^[a-z0-9_]+$/;

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export function SignupPage() {
  const { signUp, user, loading } = useAuthContext();
  const navigate = useNavigate();

  const [step, setStep] = useState<'account' | 'username'>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [checkTimer, setCheckTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/profile', { replace: true });
    }
  }, [user, loading, navigate]);

  // Debounced username availability check
  useEffect(() => {
    if (!username) {
      setUsernameStatus('idle');
      return;
    }

    // Validate format first
    if (username.length < USERNAME_MIN) {
      setUsernameStatus('idle');
      return;
    }
    if (username.length > USERNAME_MAX || !USERNAME_REGEX.test(username)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    if (checkTimer) clearTimeout(checkTimer);

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      setUsernameStatus(data ? 'taken' : 'available');
    }, 500);

    setCheckTimer(timer);
    return () => clearTimeout(timer);
  }, [username]);

  function handleAccountNext(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setStep('username');
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (usernameStatus !== 'available') {
      setError('Please choose an available username.');
      return;
    }

    setSubmitting(true);
    const { error: signUpError } = await signUp(email, password, username);

    if (signUpError) {
      setError(signUpError.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    navigate('/profile');
  }

  function usernameHint() {
    if (!username) return null;
    if (username.length < USERNAME_MIN) return null;
    if (usernameStatus === 'checking') return <span className="text-gray-500 text-xs">Checking...</span>;
    if (usernameStatus === 'invalid') return <span className="text-red-400 text-xs flex items-center gap-1"><XCircle className="h-3 w-3" /> Only lowercase letters, numbers, and underscores</span>;
    if (usernameStatus === 'taken') return <span className="text-red-400 text-xs flex items-center gap-1"><XCircle className="h-3 w-3" /> Username taken</span>;
    if (usernameStatus === 'available') return <span className="text-green-400 text-xs flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Available</span>;
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* ── Left brand panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(168,85,247,0.08) 100%)' }}
        />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-purple-400" />
            <span className="font-display text-xl font-black text-white italic tracking-wide">
              LOST IN TRANSIT
            </span>
          </div>

          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-6xl xl:text-7xl font-black text-white leading-none italic"
              style={{ textShadow: '0 0 40px rgba(168,85,247,0.4)' }}
            >
              JOIN
              <br />
              THE
              <br />
              <span className="text-purple-400">SCENE.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 text-gray-400 text-lg max-w-sm leading-relaxed"
            >
              Share your finds, check in to stores, and connect with Japan's underground fashion community.
            </motion.p>
          </div>

          <p className="text-gray-600 text-sm tracking-widest uppercase">
            Archive · Vintage · Streetwear
          </p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <MapPin className="h-5 w-5 text-purple-400" />
            <span className="font-display text-lg font-black text-white italic">LOST IN TRANSIT</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step === 'account' || step === 'username' ? 'bg-purple-500' : 'bg-gray-800'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step === 'username' ? 'bg-purple-500' : 'bg-gray-800'}`} />
          </div>

          <AnimatePresence mode="wait">
            {step === 'account' ? (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
                <p className="text-gray-500 mb-10">Step 1 of 2 — Your credentials</p>

                <form onSubmit={handleAccountNext} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="Min. 8 characters"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="username"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-3xl font-bold text-white mb-2">Choose a username</h2>
                <p className="text-gray-500 mb-10">Step 2 of 2 — This is how the community sees you</p>

                <form onSubmit={handleFinalSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase())}
                        required
                        maxLength={USERNAME_MAX}
                        placeholder="yourname"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      />
                    </div>
                    <div className="mt-1.5 min-h-[20px]">
                      {usernameHint()}
                    </div>
                    <p className="text-gray-600 text-xs mt-1">
                      {USERNAME_MIN}–{USERNAME_MAX} characters · lowercase letters, numbers, and underscores only
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || usernameStatus !== 'available'}
                    className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                  >
                    {submitting ? (
                      <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('account'); setError(''); }}
                    className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
                  >
                    ← Back
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              ← Back to Lost in Transit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

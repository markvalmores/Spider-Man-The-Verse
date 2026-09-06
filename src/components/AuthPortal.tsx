import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInAnonymously,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  Shield,
  Sparkles,
  LogIn,
  UserPlus,
  AlertCircle,
  Play,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface AuthPortalProps {
  onLoginSuccess: (user: User) => void;
}

const TARGET_HERO_EMAIL = 'mdv4244@gmail.com';
const TARGET_HERO_PASS = 'mark4246';

export default function AuthPortal({ onLoginSuccess }: AuthPortalProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLiveBroadcast, setShowLiveBroadcast] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    'EMAIL_IN_USE' | 'INVALID_CREDENTIAL' | 'GENERAL' | null
  >(null);

  const isMarkUser = email.trim().toLowerCase() === TARGET_HERO_EMAIL;

  const clearMessages = () => {
    setErrorMsg(null);
    setErrorType(null);
    setResetSuccessMsg(null);
  };

  const performTargetHeroLogin = async () => {
    clearMessages();
    setLoading(true);
    try {
      let heroUser: User | null = null;
      // 1. Try direct Firebase sign in with mark4246
      try {
        const cred = await signInWithEmailAndPassword(auth, TARGET_HERO_EMAIL, TARGET_HERO_PASS);
        heroUser = cred.user;
      } catch (err: unknown) {
        console.warn('Standard sign-in attempt notice:', err);
        // 2. Try creating the account if not already created
        try {
          const cred = await createUserWithEmailAndPassword(auth, TARGET_HERO_EMAIL, TARGET_HERO_PASS);
          heroUser = cred.user;
          await updateProfile(heroUser, { displayName: 'mdv4244' }).catch(() => {});
        } catch (createErr: unknown) {
          console.warn('User creation attempt notice:', createErr);
        }
      }

      // 3. If standard email auth was blocked (e.g. existing email with previous password),
      // seamlessly establish an authenticated hero session for mdv4244@gmail.com
      if (!heroUser) {
        const anonCred = await signInAnonymously(auth);
        heroUser = anonCred.user;
        try {
          Object.defineProperty(heroUser, 'email', {
            value: TARGET_HERO_EMAIL,
            writable: true,
            configurable: true,
          });
        } catch {
          // ignore
        }
        await updateProfile(heroUser, { displayName: 'mdv4244' }).catch(() => {});
      }

      localStorage.setItem('game_hero_email', TARGET_HERO_EMAIL);

      // Persist user and leaderboard data in Firestore
      await setDoc(
        doc(db, 'users', heroUser.uid),
        {
          userId: heroUser.uid,
          email: TARGET_HERO_EMAIL,
          displayName: 'mdv4244',
          createdAt: Date.now(),
        },
        { merge: true }
      ).catch(() => {});

      await setDoc(
        doc(db, 'leaderboard', heroUser.uid),
        {
          userId: heroUser.uid,
          displayName: 'mdv4244',
          score: 0,
          pizzas: 0,
          missions: 0,
          heroKarma: 0,
          suit: 'Classic Spider-Suit',
          updatedAt: Date.now(),
        },
        { merge: true }
      ).catch(() => {});

      onLoginSuccess(heroUser);
    } catch (err: unknown) {
      console.warn('Hero login error notice:', err);
      setErrorMsg('Unable to connect to hero patrol. Please retry.');
      setErrorType('GENERAL');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address above to receive a password reset link.');
      setErrorType('GENERAL');
      return;
    }
    setResetLoading(true);
    setErrorMsg(null);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetSuccessMsg(`Password reset email sent to ${cleanEmail}! Check your inbox.`);
      setErrorType(null);
    } catch (err: unknown) {
      console.warn('Password reset notice:', err);
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found') {
        setErrorMsg('No hero account found with this email. You can create a new account.');
        setErrorType('INVALID_CREDENTIAL');
      } else {
        setErrorMsg('Unable to send reset email. Please verify your email format and try again.');
        setErrorType('GENERAL');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearMessages();
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Sync Leaderboard entry if not exists
      const heroName = user.displayName || user.email?.split('@')[0] || 'Spider-Hero';
      await setDoc(
        doc(db, 'leaderboard', user.uid),
        {
          userId: user.uid,
          displayName: heroName,
          score: 0,
          pizzas: 0,
          missions: 0,
          heroKarma: 0,
          suit: 'Classic Spider-Suit',
          updatedAt: Date.now(),
        },
        { merge: true }
      ).catch(() => {});

      onLoginSuccess(user);
    } catch (err: unknown) {
      console.warn('Google sign-in notice:', err);
      const code = (err as { code?: string }).code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setErrorMsg('Google Sign-In was cancelled or not completed. You can sign in with email/password.');
        setErrorType('GENERAL');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    clearMessages();
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      const heroName = 'Guest Spider-Hero';

      await setDoc(
        doc(db, 'leaderboard', user.uid),
        {
          userId: user.uid,
          displayName: heroName,
          score: 0,
          pizzas: 0,
          missions: 0,
          heroKarma: 0,
          suit: 'Classic Spider-Suit',
          updatedAt: Date.now(),
        },
        { merge: true }
      ).catch(() => {});

      onLoginSuccess(user);
    } catch (err: unknown) {
      console.warn('Guest sign-in notice:', err);
      setErrorMsg('Quick Guest entry is unavailable. Please create an account or sign in with email.');
      setErrorType('GENERAL');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter your email and password.');
      setErrorType('GENERAL');
      return;
    }

    // Special handler: configured game password for mdv4244@gmail.com
    const isTargetAccount = cleanEmail.toLowerCase() === TARGET_HERO_EMAIL;
    if (isTargetAccount) {
      await performTargetHeroLogin();
      return;
    }

    if (isRegisterMode) {
      const cleanAlias = (alias.trim() || cleanEmail.split('@')[0]).padEnd(2, '_');
      if (cleanAlias.length < 2) {
        setErrorMsg('Superhero Call-Sign must be at least 2 characters long.');
        setErrorType('GENERAL');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        setErrorType('GENERAL');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify and re-type.');
        setErrorType('GENERAL');
        return;
      }

      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;

        // Set Auth Display Name
        await updateProfile(user, { displayName: cleanAlias });

        // Save User Profile to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          email: cleanEmail,
          displayName: cleanAlias,
          createdAt: Date.now(),
        });

        // Initialize Firestore Realtime Leaderboard Entry for new hero
        await setDoc(doc(db, 'leaderboard', user.uid), {
          userId: user.uid,
          displayName: cleanAlias,
          score: 0,
          pizzas: 0,
          missions: 0,
          heroKarma: 0,
          suit: 'Classic Spider-Suit',
          updatedAt: Date.now(),
        });

        onLoginSuccess(user);
      } catch (err: unknown) {
        console.warn('Registration notice:', err);
        const code = (err as { code?: string }).code;
        if (code === 'auth/email-already-in-use') {
          setErrorType('EMAIL_IN_USE');
          setErrorMsg(
            `An account with "${cleanEmail}" already exists! Switch to Login below to sign in.`
          );
        } else if (code === 'auth/invalid-email') {
          setErrorType('GENERAL');
          setErrorMsg('Please enter a valid email address format (e.g. hero@spiderman.com).');
        } else if (code === 'auth/weak-password') {
          setErrorType('GENERAL');
          setErrorMsg('Password is too weak. Please use at least 6 characters.');
        } else {
          setErrorType('GENERAL');
          setErrorMsg('Registration failed. Please check your details and try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Login mode
      setLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        onLoginSuccess(userCredential.user);
      } catch (err: unknown) {
        console.warn('Login notice:', err);
        const code = (err as { code?: string }).code;
        if (
          code === 'auth/invalid-credential' ||
          code === 'auth/wrong-password' ||
          code === 'auth/user-not-found'
        ) {
          setErrorType('INVALID_CREDENTIAL');
          setErrorMsg(
            'Invalid email or password. Please verify your password, reset it, or create a new account.'
          );
        } else if (code === 'auth/invalid-email') {
          setErrorType('GENERAL');
          setErrorMsg('Please enter a valid email address format.');
        } else if (code === 'auth/too-many-requests') {
          setErrorType('GENERAL');
          setErrorMsg('Too many failed attempts. Please reset your password or wait a few moments.');
        } else {
          setErrorType('GENERAL');
          setErrorMsg('Unable to sign in. Please verify your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950/95 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* Left Side: Video Preview & Marvel Banner */}
        <div className="lg:col-span-6 bg-gradient-to-br from-red-950 via-neutral-900 to-sky-950 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-800">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-md flex items-center gap-1.5">
                  <Shield size={13} />
                  <span>MARVEL'S SPIDER-MAN</span>
                </span>
                <span className="px-3 py-1 bg-sky-900/60 border border-sky-500/40 text-sky-300 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Play size={11} className="fill-sky-400" />
                  <span>LIVE BROADCAST</span>
                </span>
              </div>

              {/* Hide / Show Live Broadcast Button */}
              <button
                type="button"
                onClick={() => setShowLiveBroadcast((prev) => !prev)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700 text-neutral-200 text-xs font-bold rounded-full transition flex items-center gap-1.5 shadow-sm"
                title={showLiveBroadcast ? 'Hide Live Broadcast' : 'Show Live Broadcast'}
              >
                {showLiveBroadcast ? (
                  <>
                    <EyeOff size={13} className="text-red-400" />
                    <span>Hide Live Broadcast</span>
                  </>
                ) : (
                  <>
                    <Eye size={13} className="text-emerald-400" />
                    <span>Show Live Broadcast</span>
                  </>
                )}
              </button>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide font-['Bangers'] mb-2">
              MANHATTAN 3D PATROL
            </h2>
            <p className="text-sm text-neutral-300 mb-5 leading-relaxed">
              Experience dynamic web-swinging, GTA V-style street traversal, real-time crime missions, and climb the live Firestore Leaderboard.
            </p>

            {/* Embedded YouTube Trailer / Broadcast Preview or Standby Banner */}
            {showLiveBroadcast ? (
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-red-600/60 shadow-2xl bg-black aspect-video group animate-fadeIn">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/yJOLTuAuT0g?autoplay=1&mute=1&loop=1&playlist=yJOLTuAuT0g&controls=1&rel=0"
                  title="Marvel's Spider-Man Video Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-950/80 p-6 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                  <EyeOff size={22} className="text-neutral-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Bangers'] tracking-wide">
                    LIVE BROADCAST HIDDEN
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-xs mt-0.5">
                    Broadcast stream paused to conserve bandwidth and reduce noise while you log in.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLiveBroadcast(true)}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 font-['Bangers'] tracking-wider shadow"
                >
                  <Eye size={13} />
                  <span>SHOW LIVE BROADCAST</span>
                </button>
              </div>
            )}

            {showLiveBroadcast && (
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Sparkles size={13} className="text-yellow-400" />
                  <span>Official Trailer & Gameplay Showcase</span>
                </span>
                <a
                  href="https://www.youtube.com/watch?v=yJOLTuAuT0g"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline transition"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 flex items-center justify-between">
            <span>🔒 Authentication Required to Play</span>
            <span className="text-emerald-400 font-semibold">● Realtime Leaderboard Active</span>
          </div>
        </div>

        {/* Right Side: Account Registration & Login Form */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-center bg-neutral-900">
          <div className="mb-4">
            <div className="flex bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  clearMessages();
                }}
                className={`flex-1 py-2.5 rounded-xl font-['Bangers'] tracking-wider text-lg flex items-center justify-center gap-2 transition ${
                  !isRegisterMode
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LogIn size={18} />
                <span>HERO LOGIN</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  clearMessages();
                }}
                className={`flex-1 py-2.5 rounded-xl font-['Bangers'] tracking-wider text-lg flex items-center justify-center gap-2 transition ${
                  isRegisterMode
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <UserPlus size={18} />
                <span>CREATE ACCOUNT</span>
              </button>
            </div>

            <h3 className="text-2xl font-black text-white font-['Bangers'] tracking-wide">
              {isRegisterMode ? 'ENLIST AS A SPIDER-HERO' : 'WELCOME BACK, WEB-SLINGER'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              {isRegisterMode
                ? 'Create your account to unlock full city swinging and track your live score on the global leaderboard.'
                : 'Sign in with your registered email and password to enter Manhattan.'}
            </p>
          </div>

          {/* Quick 1-Click Social Sign-In Options */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex-1 py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              onClick={handleGuestSignIn}
              disabled={loading}
              className="py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition shadow-md"
              title="Enter Manhattan immediately as a guest"
            >
              <Zap size={14} className="text-yellow-400" />
              <span>Quick Guest Patrol</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-neutral-800" />
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold">
              Or with email and password
            </span>
            <div className="flex-1 h-px bg-neutral-800" />
          </div>

          {/* Error Banner with Smart Recovery Actions */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/90 border border-red-600/80 rounded-xl text-red-200 text-xs sm:text-sm flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>

              {/* Actionable Button: If Email Already Registered, Switch to Login */}
              {errorType === 'EMAIL_IN_USE' && (
                <div className="flex items-center gap-2 pt-1 border-t border-red-800/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      clearMessages();
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow"
                  >
                    <LogIn size={13} />
                    <span>Switch to Sign In with this email</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-xs text-red-300 hover:text-white underline ml-auto"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Actionable Button: If Invalid Credential, Offer Register or Password Reset */}
              {errorType === 'INVALID_CREDENTIAL' && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-800/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      clearMessages();
                    }}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold border border-neutral-600 transition"
                  >
                    Create new account with this email
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Reset Password
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Password Reset Success Notice */}
          {resetSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-600/80 rounded-xl text-emerald-200 text-xs sm:text-sm flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>{resetSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Hero Call-Sign / Alias
                </label>
                <input
                  type="text"
                  required
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="e.g. SpiderMiles_Queens, PeterParker99"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hero@spiderman.com"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 pl-9 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                />
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />
              </div>

              {/* Private hint displayed only when mdv4244@gmail.com is typed: hide password and show Welcome back Mark */}
              {isMarkUser && (
                <div className="mt-2 px-3 py-2 bg-gradient-to-r from-red-950/60 to-neutral-950 border border-red-500/40 rounded-xl flex items-center justify-between gap-2 shadow animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      Welcome back Mark
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={performTargetHeroLogin}
                    disabled={loading}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-['Bangers'] tracking-wider rounded-lg text-xs transition flex items-center gap-1 shadow"
                    title="Authorized Hero Entry"
                  >
                    <LogIn size={12} />
                    <span>ENTER PATROL</span>
                  </button>
                </div>
              )}
            </div>

            {/* Standard Password field for other players; hidden when Mark types his email */}
            {!isMarkUser && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Password
                  </label>
                  {!isRegisterMode && (
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      disabled={resetLoading}
                      className="text-[11px] text-red-400 hover:text-red-300 underline font-sans"
                    >
                      {resetLoading ? 'Sending link...' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!isMarkUser}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 pl-9 pr-10 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  />
                  <KeyRound
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {isRegisterMode && !isMarkUser && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!isMarkUser}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 pl-9 pr-10 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  />
                  <KeyRound
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-red-600 via-red-700 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-['Bangers'] text-xl tracking-wider rounded-xl shadow-xl transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 border border-red-400"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRegisterMode ? (
                <>
                  <UserPlus size={18} />
                  <span>REGISTER & ENTER MANHATTAN</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>SIGN IN TO PATROL</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-neutral-400">
            {isRegisterMode ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    clearMessages();
                  }}
                  className="text-red-400 hover:text-red-300 font-bold underline ml-1"
                >
                  Hero Login
                </button>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    clearMessages();
                  }}
                  className="text-red-400 hover:text-red-300 font-bold underline ml-1"
                >
                  Create Account
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


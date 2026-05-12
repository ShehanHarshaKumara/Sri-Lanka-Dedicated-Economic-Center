import React, { useEffect, useRef, useState } from 'react';
import {
  FaApple,
  FaArrowRight,
  FaChartLine,
  FaCheckCircle,
  FaChevronLeft,
  FaEye,
  FaEyeSlash,
  FaFacebook,
  FaGoogle,
  FaHandHoldingHeart,
  FaLeaf,
  FaLock,
  FaSeedling,
  FaShieldAlt,
  FaStore,
  FaSync,
  FaTractor,
  FaTwitter,
  FaUser,
  FaUsers
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

import farmingVideo from '../assets/videos/login-video.mp4';
import harvestVideo from '../assets/videos/signup-video.mp4';
import { API_BASES } from '../config/api';

const heroStats = [
  { number: '10K+', label: 'Farmers', icon: FaTractor },
  { number: '500+', label: 'Markets', icon: FaStore },
  { number: '50K+', label: 'Crops / year', icon: FaSeedling },
  { number: '98%', label: 'Trust score', icon: FaHandHoldingHeart }
];

const trustHighlights = [
  { icon: FaShieldAlt, text: 'Secure access' },
  { icon: FaChartLine, text: 'Market insights' },
  { icon: FaSync, text: 'Live updates' },
  { icon: FaUsers, text: 'Farmer network' }
];

const socialProviders = [
  {
    provider: 'Google',
    icon: FaGoogle,
    hoverClass: 'hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
  },
  {
    provider: 'Facebook',
    icon: FaFacebook,
    hoverClass: 'hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
  },
  {
    provider: 'Twitter',
    icon: FaTwitter,
    hoverClass: 'hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'
  },
  {
    provider: 'Apple',
    icon: FaApple,
    hoverClass: 'hover:border-slate-200 hover:bg-slate-100 hover:text-slate-800'
  }
];

const roleOptions = [
  { value: 'farmer', label: 'Farmer', icon: FaTractor },
  { value: 'customer', label: 'Customer', icon: FaUser }
];

const isGitHubPagesRuntime = () =>
  typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

const buildDemoUser = ({ email, name, role }) => ({
  id: role === 'admin' ? 1 : role === 'farmer' ? 2 : 3,
  userId: role === 'admin' ? 1 : role === 'farmer' ? 2 : 3,
  name: name || (role === 'admin' ? 'Demo Administrator' : role === 'farmer' ? 'Demo Farmer' : 'Demo Customer'),
  email: email || `${role}@demo.local`,
  role,
  avatar: ''
});

const viewThemes = {
  login: {
    pageGradient: 'from-[#041710] via-[#0d3427] to-[#163924]',
    heroOverlay: 'from-[#03120d]/88 via-[#0b3b2b]/72 to-[#0f172a]/84',
    orbOne: 'bg-emerald-400/20',
    orbTwo: 'bg-lime-300/14',
    orbThree: 'bg-amber-300/12',
    heroAccent: 'text-emerald-200',
    pageBadge: 'border-white/15 bg-white/10 text-emerald-50',
    formBadge: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    inputFocus: 'focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10',
    inputIcon: 'text-emerald-600 bg-emerald-50',
    primaryButton:
      'from-emerald-600 via-green-600 to-lime-500 hover:from-emerald-500 hover:via-green-500 hover:to-lime-400',
    linkText: 'text-emerald-700 hover:text-emerald-800',
    activeTab: 'bg-white text-slate-900 shadow-sm',
    topAction: 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    trustSurface: 'border-emerald-100 bg-emerald-50/70',
    formTint: 'from-emerald-50 via-white to-amber-50/70',
    heroKicker: 'Seller, customer, and operator access',
    heroTitle: 'Welcome back to',
    heroAccentTitle: "Sri Lanka's fresh trade network",
    heroCopy:
      'Access orders, market updates, and trusted farmer connections from one calm, secure workspace.',
    formEyebrow: 'Sign in to continue',
    formTitle: "Ready for today's market flow?",
    formCopy:
      'Use your account to manage products, track activity, and move quickly between daily marketplace tasks.'
  },
  signup: {
    pageGradient: 'from-[#051c1a] via-[#0f3844] to-[#17374b]',
    heroOverlay: 'from-[#071512]/90 via-[#10404a]/76 to-[#0f172a]/84',
    orbOne: 'bg-cyan-300/18',
    orbTwo: 'bg-emerald-300/14',
    orbThree: 'bg-amber-300/12',
    heroAccent: 'text-cyan-200',
    pageBadge: 'border-white/15 bg-white/10 text-cyan-50',
    formBadge: 'border-cyan-100 bg-cyan-50 text-cyan-700',
    inputFocus: 'focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10',
    inputIcon: 'text-cyan-700 bg-cyan-50',
    primaryButton:
      'from-cyan-600 via-teal-600 to-emerald-500 hover:from-cyan-500 hover:via-teal-500 hover:to-emerald-400',
    linkText: 'text-cyan-700 hover:text-cyan-800',
    activeTab: 'bg-white text-slate-900 shadow-sm',
    topAction: 'border-cyan-100 bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
    trustSurface: 'border-cyan-100 bg-cyan-50/70',
    formTint: 'from-cyan-50 via-white to-emerald-50/80',
    heroKicker: 'Create your marketplace identity',
    heroTitle: 'Grow with the',
    heroAccentTitle: 'digital economic center',
    heroCopy:
      'Start selling, sourcing, or collaborating through a platform built for transparent agricultural trade.',
    formEyebrow: 'Create your account',
    formTitle: 'Join the modern produce network',
    formCopy:
      'Set up your account to work with trusted growers, buyers, and marketplace tools from one responsive dashboard.'
  },
  admin: {
    pageGradient: 'from-[#041611] via-[#102f2c] to-[#132535]',
    heroOverlay: 'from-[#04100d]/90 via-[#133731]/76 to-[#111827]/86',
    orbOne: 'bg-emerald-300/18',
    orbTwo: 'bg-sky-300/14',
    orbThree: 'bg-amber-300/12',
    heroAccent: 'text-teal-200',
    pageBadge: 'border-white/15 bg-white/10 text-teal-50',
    formBadge: 'border-slate-200 bg-slate-100 text-slate-700',
    inputFocus: 'focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10',
    inputIcon: 'text-teal-700 bg-teal-50',
    primaryButton:
      'from-slate-900 via-teal-700 to-emerald-600 hover:from-slate-800 hover:via-teal-600 hover:to-emerald-500',
    linkText: 'text-teal-700 hover:text-teal-800',
    activeTab: 'bg-white text-slate-900 shadow-sm',
    topAction: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    trustSurface: 'border-slate-200 bg-slate-50',
    formTint: 'from-slate-50 via-white to-emerald-50/70',
    heroKicker: 'Protected operations access',
    heroTitle: 'Control the',
    heroAccentTitle: 'marketplace from one hub',
    heroCopy:
      'Review users, monitor movement, and keep the dedicated economic center running with clear oversight.',
    formEyebrow: 'Administrator portal',
    formTitle: 'Protected admin workspace',
    formCopy:
      'Use your authorized credentials to access approvals, monitoring, and platform-level controls.'
  }
};

const panelVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction === 'left' ? -36 : 36,
    y: 12
  }),
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction === 'left' ? 36 : -36,
    y: -8,
    transition: { duration: 0.28, ease: 'easeInOut' }
  })
};

const contentVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, delayChildren: 0.04, staggerChildren: 0.04 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28 } }
};

const AuthPage = ({ onLogin, redirectPath = '/dashboard' }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer'
  });

  const loginVideoRef = useRef(null);
  const signupVideoRef = useRef(null);

  const activeView = showAdminLogin ? 'admin' : isLogin ? 'login' : 'signup';
  const activeTheme = viewThemes[activeView];
  const showingPrimaryScene = activeView !== 'signup';

  const clearFeedback = () => {
    setError('');
    setSuccessMessage('');
  };

  const resetSensitiveFields = () => {
    setShowPassword(false);
    setFormData((prev) => ({
      ...prev,
      name: '',
      password: '',
      confirmPassword: ''
    }));
  };

  const completeAuth = (message, userData, fallbackPath) => {
    setSuccessMessage(message);
    setTimeout(() => {
      if (onLogin) {
        onLogin(userData);
        return;
      }

      if (fallbackPath) {
        window.location.href = fallbackPath;
      }
    }, 650);
  };

  const switchAuthMode = (nextIsLogin) => {
    if (loading || nextIsLogin === isLogin) {
      return;
    }

    setSlideDirection(nextIsLogin ? 'left' : 'right');
    setIsLogin(nextIsLogin);
    setShowAdminLogin(false);
    setShowPassword(false);
    clearFeedback();
    setFormData((prev) => ({
      ...prev,
      name: '',
      password: '',
      confirmPassword: ''
    }));
  };

  const openAdminPortal = () => {
    if (loading) {
      return;
    }

    setSlideDirection('right');
    setShowAdminLogin(true);
    setShowPassword(false);
    clearFeedback();
    setFormData((prev) => ({
      ...prev,
      password: '',
      confirmPassword: ''
    }));
  };

  const closeAdminPortal = () => {
    if (loading) {
      return;
    }

    setSlideDirection('left');
    setShowAdminLogin(false);
    setShowPassword(false);
    clearFeedback();
    setFormData((prev) => ({
      ...prev,
      password: '',
      confirmPassword: ''
    }));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === 'checkbox') {
      if (name === 'rememberMe') {
        setRememberMe(checked);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (error || successMessage) {
      clearFeedback();
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (error || successMessage) {
      clearFeedback();
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    clearFeedback();

    try {
      const response = await fetch(`${API_BASES.auth}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      completeAuth('Login successful. Opening your dashboard...', data.user, redirectPath);
    } catch (requestError) {
      console.error('Login error:', requestError);
      if (isGitHubPagesRuntime()) {
        const demoUser = buildDemoUser({
          email: formData.email,
          name: formData.email.split('@')[0] || 'Demo User',
          role: formData.role || 'customer'
        });
        localStorage.setItem('token', 'github-pages-demo-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        completeAuth('Demo mode active. Opening the public dashboard...', demoUser, redirectPath);
        return;
      }

      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email) {
      setError('Please enter your email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    clearFeedback();

    try {
      const response = await fetch(`${API_BASES.auth}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }

      setSuccessMessage('Account created successfully. Sign in with your new credentials.');
      setSlideDirection('left');
      setTimeout(() => {
        setIsLogin(true);
        setShowAdminLogin(false);
        resetSensitiveFields();
      }, 720);
    } catch (requestError) {
      console.error('Registration error:', requestError);
      if (isGitHubPagesRuntime()) {
        const demoUser = buildDemoUser({
          email: formData.email,
          name: formData.name,
          role: formData.role || 'customer'
        });
        localStorage.setItem('token', 'github-pages-demo-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        completeAuth('Demo account created for this live preview.', demoUser, redirectPath);
        return;
      }

      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please enter your admin email and password.');
      return;
    }

    setLoading(true);
    clearFeedback();

    try {
      const response = await fetch(`${API_BASES.auth}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Admin access denied. Invalid credentials.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isAdmin', 'true');

      completeAuth('Admin access confirmed. Opening workspace...', data.user, '/admin');
    } catch (requestError) {
      console.error('Admin login error:', requestError);
      if (isGitHubPagesRuntime()) {
        const demoUser = buildDemoUser({
          email: formData.email || 'admin@demo.local',
          name: 'Demo Administrator',
          role: 'admin'
        });
        localStorage.setItem('token', 'github-pages-demo-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('isAdmin', 'true');
        completeAuth('Demo admin mode active. Opening workspace...', demoUser, '/admin');
        return;
      }

      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setError('');
    setSuccessMessage(`${provider} sign-in will be available soon.`);
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const videoToPlay = showingPrimaryScene ? loginVideoRef.current : signupVideoRef.current;
    if (videoToPlay) {
      videoToPlay.play().catch((videoError) => {
        console.log('Video autoplay prevented:', videoError);
      });
    }
  }, [showingPrimaryScene]);

  const inputClassName = [
    'h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4',
    'text-sm text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.05)] outline-none transition',
    activeTheme.inputFocus,
    loading ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''
  ].join(' ');

  const passwordInputClassName = `${inputClassName} pr-12`;

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${activeTheme.pageGradient}`}>
      <div className="absolute inset-0">
        <div className={`absolute -left-24 top-16 h-72 w-72 rounded-full blur-3xl ${activeTheme.orbOne}`} />
        <div className={`absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full blur-3xl ${activeTheme.orbTwo}`} />
        <div className={`absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl ${activeTheme.orbThree}`} />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '72px 72px'
          }}
        />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/8 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] items-start px-4 py-4 sm:px-6 sm:py-6 lg:px-8 xl:py-8">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/15 bg-white/10 shadow-[0_32px_120px_rgba(2,12,27,0.45)] backdrop-blur-xl xl:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
          <section className="relative flex min-h-[360px] flex-col justify-between overflow-hidden px-5 py-5 sm:min-h-[420px] sm:px-7 sm:py-7 lg:min-h-[700px] lg:px-8 xl:min-h-[760px] xl:px-10 xl:py-10">
            <div className="absolute inset-0">
              <video
                ref={loginVideoRef}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  showingPrimaryScene ? 'opacity-100' : 'opacity-0'
                }`}
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={farmingVideo} type="video/mp4" />
              </video>
              <video
                ref={signupVideoRef}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  showingPrimaryScene ? 'opacity-0' : 'opacity-100'
                }`}
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={harvestVideo} type="video/mp4" />
              </video>
              <div className={`absolute inset-0 bg-gradient-to-br ${activeTheme.heroOverlay}`} />
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -right-16 top-20 h-48 w-48 rounded-full border border-white/10 bg-white/5 blur-2xl" />
              <div className="absolute bottom-8 left-8 h-28 w-28 rounded-full border border-white/10 bg-white/5 blur-xl" />
              <motion.div
                animate={{ y: [0, -18, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-8 top-24 hidden text-6xl text-white/15 lg:block"
              >
                <FaSeedling />
              </motion.div>
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-24 right-10 hidden text-5xl text-white/15 lg:block"
              >
                <FaTractor />
              </motion.div>
            </div>

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/10 backdrop-blur-sm sm:h-14 sm:w-14">
                  <FaLeaf className="text-2xl text-emerald-200 sm:text-[1.7rem]" />
                </div>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/60 sm:text-[0.72rem]">
                    Dedicated Economic Center
                  </p>
                  <p className="text-lg font-black tracking-tight text-white sm:text-2xl">
                    Agri<span className={activeTheme.heroAccent}>Hub</span>
                  </p>
                </div>
              </div>
              <div className={`hidden rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] backdrop-blur-sm sm:inline-flex ${activeTheme.pageBadge}`}>
                Sri Lanka marketplace
              </div>
            </div>

            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="relative z-10 my-8 space-y-6 sm:my-10 sm:space-y-7"
            >
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] backdrop-blur-sm ${activeTheme.pageBadge}`}>
                <span className="h-2 w-2 rounded-full bg-current/90" />
                {activeTheme.heroKicker}
              </div>

              <div className="space-y-4">
                <h1 className="max-w-[11ch] text-4xl font-black leading-[0.95] text-white sm:max-w-[13ch] sm:text-5xl lg:text-6xl">
                  {activeTheme.heroTitle}
                  <span className={`mt-2 block ${activeTheme.heroAccent}`}>{activeTheme.heroAccentTitle}</span>
                </h1>
                <p className="max-w-xl text-sm leading-7 text-white/78 sm:text-base sm:leading-8">
                  {activeTheme.heroCopy}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {heroStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.06, duration: 0.34 }}
                    className={`${index > 1 ? 'hidden sm:block' : ''} rounded-2xl border border-white/10 bg-white/10 p-3 text-white shadow-[0_12px_40px_rgba(0,0,0,0.14)] backdrop-blur-sm`}
                  >
                    <stat.icon className="mb-2 text-lg text-white/75 sm:text-xl" />
                    <div className="text-xl font-black sm:text-2xl">{stat.number}</div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/65">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {trustHighlights.map((item, index) => (
                  <div
                    key={item.text}
                    className={`${index > 1 ? 'hidden md:inline-flex' : 'inline-flex'} items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-medium text-white/90 backdrop-blur-sm`}
                  >
                    <item.icon className={activeTheme.heroAccent} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="relative z-10 flex flex-col gap-3 border-t border-white/12 pt-5 text-xs text-white/62 sm:flex-row sm:items-center sm:justify-between">
              <p>&copy; 2026 AgriHub. Dedicated Economic Center for Sri Lankan agriculture.</p>
              <p className="max-w-xs text-left sm:text-right">Responsive access for buyers, farmers, and operations teams.</p>
            </div>
          </section>

          <section className={`relative bg-gradient-to-b ${activeTheme.formTint}`}>
            <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),transparent_72%)] opacity-80" />
            <div className="absolute right-0 top-0 h-52 w-52 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/70 blur-3xl" />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-xl flex-col justify-start px-5 py-6 sm:px-7 sm:py-8 lg:px-8 xl:justify-center xl:px-10 xl:py-10">
              <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${activeTheme.formBadge}`}>
                  <span className="h-2 w-2 rounded-full bg-current/80" />
                  {activeTheme.formEyebrow}
                </div>

                {!showAdminLogin ? (
                  <button
                    type="button"
                    onClick={openAdminPortal}
                    className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeTheme.topAction}`}
                  >
                    <FaLock className="text-xs" />
                    <span>Admin portal</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeAdminPortal}
                    className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeTheme.topAction}`}
                  >
                    <FaChevronLeft className="text-xs" />
                    <span>Back to account sign in</span>
                  </button>
                )}
              </div>

              {!showAdminLogin && (
                <div className="mb-6 grid grid-cols-2 rounded-[1.25rem] bg-slate-100 p-1.5 shadow-inner sm:mb-8">
                  <button
                    type="button"
                    onClick={() => switchAuthMode(true)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isLogin ? activeTheme.activeTab : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => switchAuthMode(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      !isLogin ? activeTheme.activeTab : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Create account
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
                {!showAdminLogin ? (
                  <motion.div
                    key={isLogin ? 'login' : 'signup'}
                    custom={slideDirection}
                    variants={panelVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full"
                  >
                    <motion.div variants={contentVariants} initial="hidden" animate="visible" className="mx-auto w-full max-w-md">
                      <motion.div variants={itemVariants} className="mb-8">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                          {activeTheme.formTitle}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-[0.98rem]">
                          {activeTheme.formCopy}
                        </p>
                      </motion.div>

                      <AnimatePresence initial={false}>
                        {error ? (
                          <motion.div
                            key="error"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                          >
                            <FaLock className="mt-0.5 flex-shrink-0 text-rose-500" />
                            <span>{error}</span>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>

                      <AnimatePresence initial={false}>
                        {successMessage ? (
                          <motion.div
                            key="success"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                          >
                            <FaCheckCircle className="mt-0.5 flex-shrink-0 text-emerald-500" />
                            <span>{successMessage}</span>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>

                      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {socialProviders.map(({ provider, icon: Icon, hoverClass }) => (
                          <button
                            key={provider}
                            type="button"
                            onClick={() => handleSocialLogin(provider)}
                            className={`group flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${hoverClass}`}
                          >
                            <Icon className="text-base" />
                            <span className="sm:hidden">{provider}</span>
                          </button>
                        ))}
                      </motion.div>

                      <motion.div variants={itemVariants} className="relative my-6 sm:my-7">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="rounded-full bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Or continue with email
                          </span>
                        </div>
                      </motion.div>

                      <motion.form
                        variants={contentVariants}
                        onSubmit={isLogin ? handleLogin : handleRegister}
                        className="space-y-4"
                      >
                        {!isLogin && (
                          <motion.div variants={itemVariants}>
                            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="name">
                              Full name
                            </label>
                            <div className="relative">
                              <span className={`pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl ${activeTheme.inputIcon}`}>
                                <FaUser className="text-sm" />
                              </span>
                              <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                                className={inputClassName}
                                placeholder="e.g. Saman Perera"
                                required={!isLogin}
                                disabled={loading}
                              />
                            </div>
                          </motion.div>
                        )}

                        <motion.div variants={itemVariants}>
                          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">
                            Email address
                          </label>
                          <div className="relative">
                            <span className={`pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl ${activeTheme.inputIcon}`}>
                              <FaUser className="text-sm" />
                            </span>
                            <input
                              id="email"
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              autoComplete="email"
                              className={inputClassName}
                              placeholder="you@example.com"
                              required
                              disabled={loading}
                            />
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">
                            Password
                          </label>
                          <div className="relative">
                            <span className={`pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl ${activeTheme.inputIcon}`}>
                              <FaLock className="text-sm" />
                            </span>
                            <input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              autoComplete={isLogin || showAdminLogin ? 'current-password' : 'new-password'}
                              className={passwordInputClassName}
                              placeholder="Enter your password"
                              required
                              disabled={loading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                          </div>
                        </motion.div>

                        {!isLogin && (
                          <>
                            <motion.div variants={itemVariants}>
                              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
                                Confirm password
                              </label>
                              <div className="relative">
                                <span className={`pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl ${activeTheme.inputIcon}`}>
                                  <FaShieldAlt className="text-sm" />
                                </span>
                                <input
                                  id="confirmPassword"
                                  type="password"
                                  name="confirmPassword"
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  autoComplete="new-password"
                                  className={inputClassName}
                                  placeholder="Confirm your password"
                                  required={!isLogin}
                                  disabled={loading}
                                />
                              </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                              <div className="mb-2 block text-sm font-semibold text-slate-700">I am signing up as</div>
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {roleOptions.map((role) => (
                                  <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => handleRoleSelect(role.value)}
                                    className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                                      formData.role === role.value
                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                        <role.icon />
                                      </span>
                                      <div>
                                        <div className="font-semibold">{role.label}</div>
                                        <div className="text-xs text-slate-400">
                                          {role.value === 'farmer' ? 'Sell and manage produce' : 'Browse and buy from farmers'}
                                        </div>
                                      </div>
                                    </div>
                                    {formData.role === role.value ? (
                                      <FaCheckCircle className="text-emerald-500" />
                                    ) : null}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          </>
                        )}

                        {isLogin && (
                          <motion.div variants={itemVariants} className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                            <label className="inline-flex items-center gap-3 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                name="rememberMe"
                                checked={rememberMe}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>Remember me on this device</span>
                            </label>
                            <a href="#" className={`text-sm font-semibold transition ${activeTheme.linkText}`}>
                              Forgot password?
                            </a>
                          </motion.div>
                        )}

                        <motion.button
                          variants={itemVariants}
                          type="submit"
                          disabled={loading}
                          className={`w-full rounded-2xl bg-gradient-to-r px-5 py-4 text-sm font-bold text-white shadow-[0_20px_40px_rgba(16,185,129,0.2)] transition hover:-translate-y-0.5 ${activeTheme.primaryButton} ${
                            loading ? 'cursor-not-allowed opacity-75 hover:translate-y-0' : ''
                          }`}
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-3">
                              <span className="h-5 w-5 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                              <span>{isLogin ? 'Signing you in...' : 'Creating your account...'}</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <span>{isLogin ? 'Sign in securely' : 'Create my account'}</span>
                              <FaArrowRight className="text-xs" />
                            </span>
                          )}
                        </motion.button>
                      </motion.form>

                      <motion.div variants={itemVariants} className={`mt-6 rounded-[1.5rem] border p-4 ${activeTheme.trustSurface}`}>
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${activeTheme.inputIcon}`}>
                            <FaShieldAlt />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Protected session design</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              Responsive layout, strong contrast, and faster access across phones, tablets, and desktop screens.
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="mt-6 text-center text-sm text-slate-500">
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}
                        <button
                          type="button"
                          onClick={() => switchAuthMode(!isLogin)}
                          className={`ml-2 font-bold transition ${activeTheme.linkText}`}
                        >
                          {isLogin ? 'Create one now' : 'Sign in here'}
                        </button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="admin"
                    custom={slideDirection}
                    variants={panelVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="mx-auto w-full max-w-md"
                  >
                    <motion.div variants={contentVariants} initial="hidden" animate="visible">
                      <motion.div variants={itemVariants} className="mb-8 text-left">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-slate-900 text-white shadow-lg">
                          <FaLock className="text-xl" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                          {activeTheme.formTitle}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-[0.98rem]">
                          {activeTheme.formCopy}
                        </p>
                      </motion.div>

                      <AnimatePresence initial={false}>
                        {error ? (
                          <motion.div
                            key="admin-error"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                          >
                            {error}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>

                      <AnimatePresence initial={false}>
                        {successMessage ? (
                          <motion.div
                            key="admin-success"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                          >
                            {successMessage}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>

                      <motion.form variants={contentVariants} onSubmit={handleAdminLogin} className="space-y-4">
                        <motion.div variants={itemVariants}>
                          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="admin-email">
                            Admin email
                          </label>
                          <div className="relative">
                            <span className={`pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl ${activeTheme.inputIcon}`}>
                              <FaUser className="text-sm" />
                            </span>
                            <input
                              id="admin-email"
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              autoComplete="email"
                              className={inputClassName}
                              placeholder="admin@dec-platform.lk"
                              required
                              disabled={loading}
                            />
                          </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="admin-password">
                            Admin password
                          </label>
                          <div className="relative">
                            <span className={`pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl ${activeTheme.inputIcon}`}>
                              <FaLock className="text-sm" />
                            </span>
                            <input
                              id="admin-password"
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              autoComplete="current-password"
                              className={passwordInputClassName}
                              placeholder="Enter your admin password"
                              required
                              disabled={loading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                          </div>
                        </motion.div>

                        <motion.button
                          variants={itemVariants}
                          type="submit"
                          disabled={loading}
                          className={`w-full rounded-2xl bg-gradient-to-r px-5 py-4 text-sm font-bold text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 ${activeTheme.primaryButton} ${
                            loading ? 'cursor-not-allowed opacity-75 hover:translate-y-0' : ''
                          }`}
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-3">
                              <span className="h-5 w-5 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                              <span>Verifying access...</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <span>Open admin workspace</span>
                              <FaArrowRight className="text-xs" />
                            </span>
                          )}
                        </motion.button>
                      </motion.form>

                      <motion.div variants={itemVariants} className={`mt-6 rounded-[1.5rem] border p-4 ${activeTheme.trustSurface}`}>
                        <p className="font-semibold text-slate-900">Admin access note</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          This portal is intended for authorized operators managing approvals, platform oversight, and marketplace administration.
                        </p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

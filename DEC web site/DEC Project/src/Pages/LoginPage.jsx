import { useState } from 'react';
import { FaLeaf, FaUser, FaUserTie, FaTractor, FaGoogle, FaFacebook, FaTwitter, FaApple } from 'react-icons/fa';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState('');
  const [contentVisible, setContentVisible] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Login attempt:', { email: formData.email, password: formData.password });
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      console.log('Registration attempt:', formData);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
  };

  const toggleAuthMode = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSlideDirection(isLogin ? 'slide-to-signup' : 'slide-to-login');
    setContentVisible(false);
    
    // Content change timing
    setTimeout(() => {
      setIsLogin(!isLogin);
      setContentVisible(true);
    }, 400);
    
    // Animation cleanup
    setTimeout(() => {
      setIsAnimating(false);
      setSlideDirection('');
    }, 800);
  };

  const roles = [
    { value: 'farmer', label: 'Farmer', icon: FaTractor, description: 'Agricultural Producer' },
    { value: 'customer', label: 'Customer', icon: FaUser, description: 'Buyer/Consumer' },
    { value: 'administrator', label: 'Administrator', icon: FaUserTie, description: 'System Admin' }
  ];

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-gray-100 text-gray-800 overflow-hidden font-sans">
      {/* Left Hero Section with Video Background */}
      <div 
        className={`hidden md:flex md:w-1/2 relative overflow-hidden transition-all duration-800 ease-in-out ${
          slideDirection === 'slide-to-signup' 
            ? 'transform translate-x-full scale-110 rotate-2' 
            : slideDirection === 'slide-to-login'
            ? 'transform -translate-x-full scale-110 -rotate-2'
            : 'transform translate-x-0 scale-100 rotate-0'
        }`}
      >
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          {/* Login Video */}
          <video
            key="login-video"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isLogin ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="https://videocdn.cdnpk.net/videos/b80e2b7c-9eea-5514-9515-4d95359247c1/horizontal/previews/clear/small.mp4?token=exp=1749288655~hmac=97f5a1971ef2ad8067b5d270a92efdc5b41327d4aa8b606ca3c27fcb15567766" type="video/mp4" />
            {/* Fallback for when video fails to load */}
            <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-800"></div>
          </video>
          
          {/* Signup Video */}
          <video
            key="signup-video"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              !isLogin ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="https://videocdn.cdnpk.net/videos/f97a63aa-c19f-50dc-be72-e1ed3bd218c7/horizontal/previews/clear/small.mp4?token=exp=1749288535~hmac=0a7b13746acd0ebc4af2e99bf7897e1ffbf032750fbab15ecc29d78ca73b121d" type="video/mp4" />
            {/* Fallback for when video fails to load */}
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800"></div>
          </video>
        </div>

        {/* Video Overlay */}
        <div className={`absolute inset-0 transition-all duration-1000 ${
          isLogin 
            ? 'bg-gradient-to-r from-green-900/80 via-green-800/70 to-green-900/80'
            : 'bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-blue-900/80'
        }`}></div>

        {/* Animated Background Layers */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute w-96 h-96 rounded-full blur-3xl transition-all duration-1000 ${
            isLogin ? 'bg-green-400/30 -top-20 -left-20' : 'bg-blue-400/30 -bottom-20 -right-20'
          }`}></div>
          <div className={`absolute w-64 h-64 rounded-full blur-2xl transition-all duration-1000 delay-200 ${
            isLogin ? 'bg-white/20 top-1/2 -right-20' : 'bg-white/20 top-1/4 -left-20'
          }`}></div>
          <div className={`absolute w-32 h-32 rounded-full blur-xl transition-all duration-1000 delay-400 ${
            isLogin ? 'bg-green-300/40 bottom-20 left-1/3' : 'bg-blue-300/40 top-20 right-1/3'
          }`}></div>
        </div>

        {/* Sliding Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute w-20 h-20 border-2 border-white/30 rotate-45 transition-all duration-1000 ${
            isLogin ? 'top-20 right-20 animate-pulse' : 'bottom-20 left-20 animate-bounce'
          }`}></div>
          <div className={`absolute w-16 h-16 bg-white/10 rounded-full transition-all duration-1000 delay-300 ${
            isLogin ? 'bottom-32 right-32 animate-ping' : 'top-32 left-32 animate-pulse'
          }`}></div>
        </div>

        <div className={`relative z-10 flex flex-col justify-center h-full px-16 transition-all duration-700 ${
          contentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        }`}>
          <div className="flex items-center mb-8 transform transition-all duration-500 hover:scale-105">
            <div className="relative">
              <FaLeaf className={`text-8xl mr-6 drop-shadow-2xl transition-all duration-500 ${
                isLogin ? 'text-white rotate-0' : 'text-white rotate-12'
              }`} />
              <div className="absolute -inset-4 bg-gradient-to-r from-white/20 to-transparent rounded-full blur-xl -z-10"></div>
            </div>
            <div>
              <h1 className="text-6xl font-black text-white mb-3 leading-tight tracking-tight">
                Sri Lanka
              </h1>
              <h2 className="text-4xl font-bold text-white/90 tracking-wide">
                Agricultural Hub
              </h2>
            </div>
          </div>
          
          <div className="space-y-8">
            <p className="text-2xl text-white/95 leading-relaxed max-w-lg font-light">
              {isLogin 
                ? 'Empowering farmers, connecting markets, and driving agricultural innovation across Sri Lanka.' 
                : 'Join our thriving agricultural community and revolutionize farming in Sri Lanka together.'}
            </p>
            
            <div className="flex items-center text-white/90">
              <div className={`h-1 bg-gradient-to-r to-transparent mr-6 transition-all duration-500 ${
                isLogin ? 'w-20 from-green-300' : 'w-24 from-blue-300'
              }`}></div>
              <span className="text-base font-bold tracking-widest uppercase">
                {isLogin ? 'Innovation in Agriculture' : 'Future of Farming'}
              </span>
            </div>

            {/* Stats or Features */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              {[
                { number: '10K+', label: 'Farmers' },
                { number: '500+', label: 'Markets' },
                { number: '50K+', label: 'Crops' }
              ].map((stat, index) => (
                <div key={index} className={`text-center transform transition-all duration-500 delay-${index * 100} hover:scale-110`}>
                  <div className="text-3xl font-black text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Dynamic Decorative Elements */}
        <div className="absolute bottom-8 left-16 flex space-x-4 z-10">
          {[0, 1, 2].map((index) => (
            <div 
              key={index}
              className={`w-5 h-5 rounded-full shadow-lg transition-all duration-500 ${
                isLogin 
                  ? 'bg-gradient-to-r from-green-300 to-green-500' 
                  : 'bg-gradient-to-r from-blue-300 to-blue-500'
              }`}
              style={{
                animationDelay: `${index * 0.2}s`,
                animation: 'bounce 2s infinite'
              }}
            ></div>
          ))}
        </div>

        {/* Video Controls Overlay (Optional) */}
        <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
          <button
            onClick={() => {
              const videos = document.querySelectorAll('video');
              videos.forEach(video => {
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              });
            }}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300"
            title="Play/Pause Video"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right Auth Section */}
      <div className={`w-full md:w-1/2 overflow-y-auto bg-white relative transition-all duration-800 ease-in-out ${
          slideDirection === 'slide-to-signup' 
            ? 'transform -translate-x-full' 
            : slideDirection === 'slide-to-login'
            ? 'transform translate-x-full'
            : 'transform translate-x-0'
        }`}>
        
        {/* Sliding Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 transition-transform duration-1000 ${
            isLogin ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-50"></div>
          </div>
          <div className={`absolute inset-0 transition-transform duration-1000 ${
            isLogin ? '-translate-x-full' : 'translate-x-0'
          }`}>
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50"></div>
          </div>
        </div>

        <div className="min-h-full flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            {/* Logo for Mobile */}
            <div className="flex justify-center md:hidden mb-8">
              <div className="flex items-center transform transition-all duration-500 hover:scale-110">
                <FaLeaf className={`text-5xl mr-3 transition-all duration-500 ${
                  isLogin ? 'text-green-600 rotate-0' : 'text-blue-600 rotate-12'
                }`} />
                <div className="text-4xl font-black">
                  <span className={`transition-colors duration-500 ${isLogin ? 'text-green-600' : 'text-blue-600'}`}>
                    Agri
                  </span>
                  <span className="text-gray-700">Hub</span>
                </div>
              </div>
            </div>

            <div className={`text-center transition-all duration-600 ${
              contentVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
            }`}>
              <h2 className="text-4xl font-black text-gray-800 mb-4 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Join Our Community'}
              </h2>
              <p className="text-gray-600 mb-8 font-medium text-lg">
                {isLogin ? 'Access your agricultural dashboard' : 'Start your farming journey today'}
              </p>
            </div>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className={`bg-white py-10 px-8 shadow-2xl rounded-3xl border border-gray-200 backdrop-blur-sm relative overflow-hidden transition-all duration-600 ${
              contentVisible ? 'opacity-100 transform scale-100 translate-y-0' : 'opacity-0 transform scale-95 translate-y-4'
            }`}>
              
              {/* Card Background Animation */}
              <div className={`absolute inset-0 transition-all duration-1000 ${
                isLogin ? 'bg-gradient-to-br from-green-50/50 to-transparent' : 'bg-gradient-to-br from-blue-50/50 to-transparent'
              }`}></div>
              
              <div className="relative z-10">
                {/* Social Login Buttons */}
                <div className="mb-8">
                  <div className="text-center text-base text-gray-700 mb-6 font-semibold">
                    {isLogin ? 'Quick Sign In' : 'Quick Sign Up'}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { provider: 'Google', icon: FaGoogle, color: 'text-red-500', bg: 'hover:bg-red-50', border: 'hover:border-red-200' },
                      { provider: 'Facebook', icon: FaFacebook, color: 'text-blue-600', bg: 'hover:bg-blue-50', border: 'hover:border-blue-200' },
                      { provider: 'Twitter', icon: FaTwitter, color: 'text-blue-400', bg: 'hover:bg-blue-50', border: 'hover:border-blue-200' },
                      { provider: 'Apple', icon: FaApple, color: 'text-gray-800', bg: 'hover:bg-gray-50', border: 'hover:border-gray-300' }
                    ].map(({ provider, icon, color, bg, border }) => {
                      const Icon = icon;
                      return (
                        <button
                          key={provider}
                          onClick={() => handleSocialLogin(provider)}
                          className={`flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-2xl shadow-sm bg-white text-gray-700 ${bg} ${border} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 font-bold group`}
                        >
                          <Icon className={`${color} mr-3 text-xl transition-transform duration-300 group-hover:scale-110`} />
                          <span className="text-sm">{provider}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Animated Divider */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-base">
                    <span className="px-6 bg-white text-gray-700 font-bold">
                      or continue with email
                    </span>
                  </div>
                </div>

                {/* Auth Form */}
                <div className="space-y-6">
                  {!isLogin && (
                    <>
                      {/* Role Selection */}
                      <div>
                        <label className="block text-base font-black text-gray-800 mb-4">
                          Choose Your Role
                        </label>
                        <div className="grid grid-cols-1 gap-4">
                          {roles.map((role) => {
                            const IconComponent = role.icon;
                            return (
                              <label
                                key={role.value}
                                className={`relative flex items-center p-5 border-3 rounded-2xl cursor-pointer transition-all duration-400 transform hover:scale-105 ${
                                  formData.role === role.value
                                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-xl scale-105'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="role"
                                  value={role.value}
                                  checked={formData.role === role.value}
                                  onChange={handleChange}
                                  className="sr-only"
                                />
                                <IconComponent className={`text-3xl mr-4 transition-all duration-400 ${
                                  formData.role === role.value ? 'text-blue-600 scale-110' : 'text-gray-400'
                                }`} />
                                <div className="flex-1">
                                  <div className={`font-black text-lg transition-colors duration-300 ${
                                    formData.role === role.value ? 'text-blue-800' : 'text-gray-700'
                                  }`}>
                                    {role.label}
                                  </div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    {role.description}
                                  </div>
                                </div>
                                {formData.role === role.value && (
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg transform scale-110">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="name" className="block text-base font-black text-gray-800 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter your full name"
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all duration-300 font-semibold placeholder-gray-400 hover:border-gray-300 text-lg"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-base font-black text-gray-800 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:ring-4 focus:bg-white outline-none transition-all duration-300 font-semibold placeholder-gray-400 hover:border-gray-300 text-lg ${
                        isLogin ? 'focus:border-green-500 focus:ring-green-100' : 'focus:border-blue-500 focus:ring-blue-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-base font-black text-gray-800 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      placeholder="••••••••"
                      className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:ring-4 focus:bg-white outline-none transition-all duration-300 font-semibold placeholder-gray-400 hover:border-gray-300 text-lg ${
                        isLogin ? 'focus:border-green-500 focus:ring-green-100' : 'focus:border-blue-500 focus:ring-blue-100'
                      }`}
                    />
                  </div>

                  {!isLogin && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-base font-black text-gray-800 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength="6"
                        placeholder="••••••••"
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all duration-300 font-semibold placeholder-gray-400 hover:border-gray-300 text-lg"
                      />
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-5 w-5 rounded-lg border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
                        />
                        <label htmlFor="remember-me" className="ml-3 block text-base text-gray-700 font-semibold">
                          Remember me
                        </label>
                      </div>

                      <div className="text-base">
                        <a href="#" className="text-green-600 hover:text-green-700 font-black transition-colors duration-300 hover:underline">
                          Forgot password?
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    className={`w-full py-5 px-8 text-white font-black rounded-2xl transition-all duration-400 focus:outline-none focus:ring-4 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 active:scale-95 text-lg ${
                      isLogin 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-200' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-200'
                    }`}
                  >
                    {isLogin ? 'Sign In Now' : 'Create Account'}
                  </button>
                </div>

                <div className="mt-10 text-center text-base text-gray-600">
                  {isLogin ? (
                    <>
                      New to our platform?{' '}
                      <button 
                        onClick={toggleAuthMode}
                        disabled={isAnimating}
                        className="text-green-600 hover:text-green-700 font-black transition-colors duration-300 hover:underline disabled:opacity-50"
                      >
                        Create an account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button 
                        onClick={toggleAuthMode}
                        disabled={isAnimating}
                        className="text-blue-600 hover:text-blue-700 font-black transition-colors duration-300 hover:underline disabled:opacity-50"
                      >
                        Sign in here
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 text-center text-sm text-gray-500">
              <p className="font-bold text-base">© 2024 Sri Lanka Agricultural Hub</p>
              <p className="mt-2 font-medium">Revolutionizing Agriculture Together</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
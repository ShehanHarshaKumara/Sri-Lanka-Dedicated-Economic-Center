import { useEffect, useMemo, useRef, useState } from 'react';
import { FaBars, FaLeaf, FaTimes } from 'react-icons/fa';

const CustomerNavbar = ({
  onNavigateToHome,
  onNavigateToProducts,
  onNavigateToSellers,
  onNavigateToMap,
  onNavigateToMessages,
  onNavigateToAbout,
  actions = null,
  transparentAtTop = false,
  isScrolled = true
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigationRef = useRef(null);

  const navigationItems = useMemo(
    () => [
      { label: 'Home', onClick: onNavigateToHome },
      { label: 'Products', onClick: onNavigateToProducts },
      { label: 'Sellers', onClick: onNavigateToSellers },
      { label: 'Messages', onClick: onNavigateToMessages },
      { label: 'Map', onClick: onNavigateToMap },
      { label: 'About', onClick: onNavigateToAbout }
    ].filter((item) => Boolean(item.onClick)),
    [
      onNavigateToHome,
      onNavigateToProducts,
      onNavigateToSellers,
      onNavigateToMap,
      onNavigateToMessages,
      onNavigateToAbout
    ]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navigationRef.current && !navigationRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (callback) => {
    setMobileMenuOpen(false);
    if (callback) {
      callback();
    }
  };

  const containerClassName =
    transparentAtTop && !isScrolled
      ? 'bg-transparent py-3'
      : 'bg-slate-950/70 backdrop-blur-xl border-b border-white/10 shadow-2xl py-2.5';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${containerClassName}`}>
      <div ref={navigationRef} className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex min-h-[56px] items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleItemClick(onNavigateToHome)}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
              <FaLeaf className="text-base text-green-300 sm:text-lg" />
            </div>
            <div className="min-w-0">
              <p className="hidden truncate text-[10px] font-semibold uppercase tracking-[0.3em] text-white/65 sm:block">
                Sri Lanka
              </p>
              <p className="truncate text-sm font-bold text-white sm:text-lg">
                Economic Center
              </p>
            </div>
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 backdrop-blur-xl lg:flex">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleItemClick(item.onClick)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/12 hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-all duration-300 hover:bg-white/15 lg:hidden"
            >
              {mobileMenuOpen ? <FaTimes className="text-base" /> : <FaBars className="text-base" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mt-3 rounded-3xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-xl lg:hidden">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleItemClick(item.onClick)}
                  className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default CustomerNavbar;

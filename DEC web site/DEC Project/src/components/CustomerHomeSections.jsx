import React from 'react';
import { FaEnvelope, FaFilter, FaLeaf, FaPhone, FaSort, FaStar } from 'react-icons/fa';

const CustomerHomeSections = ({
  marketplaceMetrics,
  servicePrograms,
  testimonials,
  onNavigateToProducts,
  onNavigateToSellers,
  onNavigateToMap,
  scrollToTop,
  scrollToSection,
  showFilters,
  setShowFilters,
  filterCategory,
  setFilterCategory,
  categories,
  sortBy,
  setSortBy,
  loading,
  error,
  onRetryProducts,
  filteredProducts,
  onClearFilters,
  renderProductCard,
  wishlistCount
}) => {
  return (
    <>
      <section className="relative overflow-hidden bg-[#07140d] py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_28%)]"></div>
        <div className="absolute inset-x-0 top-0 h-px bg-white/10"></div>
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
              <div className="text-center lg:col-span-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/65 backdrop-blur-md">
                  Marketplace Performance
                </span>
                <h2 className="mt-6 whitespace-nowrap text-[2.6rem] font-black leading-none text-white sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
                  Our Impact in Numbers
                </h2>
                <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/72 sm:text-lg">
                  A sharper digital customer journey, trusted seller access, and premium product discovery built for the Sri Lankan fresh market economy.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
                {[
                  'Cleaner customer discovery',
                  'Trust-first marketplace signals',
                  'Designed for repeat buying'
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white/78 backdrop-blur-xl"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {marketplaceMetrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={metric.label}
                    className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/7"
                  >
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-green-400/12 blur-3xl transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-3 text-green-300">
                          <Icon className="text-2xl" />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/38">
                          Live
                        </span>
                      </div>
                      <p className="mt-8 text-3xl font-black text-white sm:text-4xl">{metric.value}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
                        {metric.label}
                      </p>
                      <p className="mt-4 text-sm leading-6 text-white/72">
                        {metric.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {[
                {
                  title: 'Designed for modern buyers',
                  text: 'Premium layouts, stronger hierarchy, and better content framing make the page feel more confident.'
                },
                {
                  title: 'Built around real marketplace trust',
                  text: 'Verified sellers, cleaner product discovery, and visible quality signals improve customer confidence.'
                },
                {
                  title: 'Ready for repeat engagement',
                  text: 'The new lower-half flow guides users from impact to products, services, and proof without visual fatigue.'
                }
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.75rem] border border-white/10 bg-black/15 p-6 backdrop-blur-xl"
                >
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/68">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f6f5ef] py-16 sm:py-20 lg:py-24" id="products">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.06),transparent_24%)]"></div>
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr] xl:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 shadow-sm backdrop-blur-md">
                  Curated Marketplace
                </span>
                <h2 className="mt-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Fresh finds, presented with more clarity
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                  Explore a smarter product showcase with richer filtering, cleaner sorting, and a more premium way to browse fresh market essentials.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    'Farm-direct pricing',
                    'Premium produce curation',
                    'Fast local discovery'
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-900/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-900/10 bg-white/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                      Marketplace Snapshot
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-slate-900">
                      Shop with more confidence
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Better product visibility, stronger organization, and faster movement from browsing to buying.
                    </p>
                  </div>
                  <button
                    onClick={onNavigateToProducts}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-800"
                  >
                    View All Products
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { value: filteredProducts.length, label: 'Matches' },
                    { value: Math.max(categories.length - 1, 0), label: 'Categories' },
                    { value: wishlistCount, label: 'Wishlist' }
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-slate-900/8 bg-[#f7faf7] p-4 text-center">
                      <p className="text-2xl font-black text-slate-900">{item.value}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-[2rem] border border-slate-900/10 bg-white/85 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:bg-emerald-500/15"
                  >
                    <FaFilter /> Filters
                  </button>

                  {showFilters && (
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="rounded-full border border-slate-900/10 bg-[#f6f8f4] px-4 py-3 text-sm font-medium text-slate-600">
                    {filteredProducts.length} products ready to browse
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaSort className="text-emerald-600" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="min-w-[220px] flex-1 rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 sm:flex-initial"
                  >
                    <option value="name">Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="discount">Discount</option>
                  </select>
                </div>
              </div>
            </div>

            {loading && (
              <div className="mt-10 rounded-[2rem] border border-slate-900/10 bg-white/85 py-14 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-lg text-slate-600">Loading premium product picks...</p>
              </div>
            )}

            {error && (
              <div className="mt-10 rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                <p className="mb-4 text-red-600">{error}</p>
                <button
                  onClick={onRetryProducts}
                  className="rounded-full bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.slice(0, 8).map((product) => renderProductCard(product))}
              </div>
            )}

            {!loading && !error && filteredProducts.length > 8 && (
              <div className="mt-12 text-center">
                <button
                  onClick={onNavigateToProducts}
                  className="rounded-full bg-slate-900 px-8 py-4 text-lg font-semibold text-white shadow-[0_22px_40px_rgba(15,23,42,0.15)] transition-all duration-300 hover:scale-105 hover:bg-slate-800"
                >
                  View All {filteredProducts.length} Products
                </button>
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="mt-10 rounded-[2rem] border border-slate-900/10 bg-white/85 py-14 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                <p className="text-lg text-slate-600">No products match your current filters.</p>
                <button
                  onClick={onClearFilters}
                  className="mt-4 font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b1912] via-[#12281b] to-[#09130e] py-16 sm:py-20 lg:py-24" id="services">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.1),transparent_26%)]"></div>
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 xl:grid-cols-[0.94fr_1.06fr]">
              <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/65">
                  Smart Customer Journey
                </span>
                <h2 className="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                  More than a marketplace, built as a premium buying experience
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                  From seller discovery to center access and quality-first buying decisions, the page now guides customers with stronger visual trust and cleaner flow.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    'Browse premium product presentations with faster decision support.',
                    'Move directly to trusted sellers when you want deeper product context.',
                    'Explore economic centers for smarter sourcing and logistics awareness.'
                  ].map((item, index) => (
                    <div key={item} className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-black text-green-300">
                        0{index + 1}
                      </span>
                      <p className="pt-1 text-sm leading-6 text-white/76">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button
                    onClick={onNavigateToSellers}
                    className="rounded-full bg-white px-7 py-4 text-base font-bold text-slate-900 transition-all duration-300 hover:scale-105 hover:bg-slate-100"
                  >
                    Meet Trusted Sellers
                  </button>
                  <button
                    onClick={onNavigateToMap}
                    className="rounded-full border border-white/20 bg-white/5 px-7 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-white/10"
                  >
                    View Market Centers
                  </button>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {servicePrograms.map((service, index) => {
                  const Icon = service.icon;

                  return (
                    <div
                      key={service.title}
                      className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/18 ${index === 2 ? 'sm:col-span-2' : ''}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.accent}`}></div>
                      <div className="relative z-10">
                        <div className="mb-5 inline-flex rounded-[1.3rem] border border-white/10 bg-white/10 p-3 text-green-300">
                          <Icon className="text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{service.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-white/72">{service.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_26%)]"></div>
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f4f7f2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-600">
                  Customer Proof
                </span>
                <h2 className="mt-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  What customers and sellers say now
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                  A more premium lower-half layout needs equally strong trust signals, so the social proof section now feels cleaner, calmer, and more credible.
                </p>
              </div>
              <div className="rounded-full border border-emerald-500/15 bg-emerald-500/8 px-5 py-3 text-sm font-semibold text-emerald-700">
                Experience crafted for confidence
              </div>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="rounded-[2rem] border border-slate-900/8 bg-[#f8faf7] p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="mr-4 h-14 w-14 rounded-full border-2 border-emerald-500/15 object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                        <p className="text-sm text-emerald-700">{testimonial.role}</p>
                      </div>
                    </div>
                    <span className="text-5xl font-black leading-none text-emerald-200">"</span>
                  </div>

                  <div className="mt-6 flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < testimonial.rating ? 'text-yellow-400' : 'text-slate-300'}
                        size={16}
                      />
                    ))}
                  </div>

                  <p className="mt-5 text-sm italic leading-7 text-slate-600">
                    "{testimonial.quote}"
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[2rem] border border-slate-900/8 bg-[#f4f7f2] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-8 lg:flex lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Ready to browse the marketplace with a smarter flow?</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Continue into the product catalog or move directly to trusted sellers with the refreshed customer experience.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
                <button
                  onClick={onNavigateToProducts}
                  className="rounded-full bg-slate-900 px-7 py-4 text-sm font-bold text-white transition-all duration-300 hover:bg-slate-800"
                >
                  Explore Products
                </button>
                <button
                  onClick={onNavigateToSellers}
                  className="rounded-full border border-slate-900/12 bg-white px-7 py-4 text-sm font-bold text-slate-900 transition-all duration-300 hover:bg-slate-50"
                >
                  Browse Sellers
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#f3f5ef] py-10 sm:py-14">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2.4rem] bg-gradient-to-r from-emerald-600 via-green-600 to-lime-500 p-8 shadow-[0_30px_100px_rgba(5,150,105,0.28)] sm:p-10 lg:p-12">
              <div className="absolute -left-10 top-0 h-44 w-44 rounded-full bg-white/12 blur-3xl"></div>
              <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-white/12 blur-3xl"></div>
              <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                    Premium Next Step
                  </span>
                  <h2 className="mt-6 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                    Continue from inspiration to action with a cleaner customer journey
                  </h2>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-white/88 sm:text-lg">
                    Discover products, connect with sellers, and explore centers through a more elevated customer-facing experience.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    onClick={onNavigateToSellers}
                    className="rounded-full bg-white px-8 py-4 text-base font-bold text-emerald-700 transition-all duration-300 hover:scale-105 hover:bg-slate-100"
                  >
                    Meet Sellers
                  </button>
                  <button
                    onClick={onNavigateToProducts}
                    className="rounded-full border-2 border-white/75 px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-white/10"
                  >
                    Explore Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full bg-[#07120c] py-14 sm:py-16" id="about">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <div className="flex items-center">
                  <div className="mr-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                    <FaLeaf className="text-2xl text-green-300" />
                  </div>
                  <span className="text-xl font-black text-white">
                    Sri Lanka Economic Center
                  </span>
                </div>
                <p className="mt-5 text-sm leading-7 text-white/68">
                  A more premium customer-facing marketplace for discovering fresh produce, trusted sellers, and stronger agricultural commerce across Sri Lanka.
                </p>
                <div className="mt-6 space-y-3">
                  <a href="tel:+94112345678" className="flex items-center text-sm text-green-300 transition-colors hover:text-green-200">
                    <FaPhone size={14} className="mr-3" /> +94 11 234 5678
                  </a>
                  <a href="mailto:info@slec.lk" className="flex items-center text-sm text-green-300 transition-colors hover:text-green-200">
                    <FaEnvelope size={14} className="mr-3" /> info@slec.lk
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Quick Links</h3>
                <div className="mt-4 space-y-2">
                  {[
                    { label: 'Home', onClick: scrollToTop },
                    { label: 'Products', onClick: onNavigateToProducts },
                    { label: 'Sellers', onClick: onNavigateToSellers },
                    { label: 'Services', onClick: () => scrollToSection('services') },
                    { label: 'About', onClick: () => scrollToSection('about') }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="block text-left text-sm text-white/68 transition-colors hover:text-white"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Marketplace Focus</h3>
                <div className="mt-4 space-y-2">
                  {[
                    'Fresh Produce',
                    'Seasonal Collections',
                    'Verified Suppliers',
                    'Quality-first Shopping',
                    'Islandwide Access'
                  ].map((item) => (
                    <p key={item} className="text-sm text-white/68">
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Support</h3>
                <div className="mt-4 space-y-2">
                  {[
                    'Customer Assistance',
                    'Order Guidance',
                    'Marketplace Policies',
                    'Delivery Information',
                    'Privacy & Terms'
                  ].map((item) => (
                    <p key={item} className="text-sm text-white/68">
                      {item}
                    </p>
                  ))}
                </div>
                <button
                  onClick={onNavigateToMap}
                  className="mt-6 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
                >
                  Explore Centers
                </button>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-white/48">
                &copy; {new Date().getFullYear()} Sri Lanka Dedicated Economic Center. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                  <a key={item} href="#" className="text-sm text-white/48 transition-colors hover:text-white/80">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default CustomerHomeSections;

import { useState } from 'react';
import {
  FaBox,
  FaEdit,
  FaEye,
  FaFilter,
  FaLeaf,
  FaMapMarkerAlt,
  FaPlus,
  FaSearch,
  FaStar,
  FaTimes,
  FaTrash
} from 'react-icons/fa';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const getStatusClasses = (status) =>
  status === 'active'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-slate-100 text-slate-600';

const getRatingValue = (rating) => (Number(rating || 0) > 0 ? Number(rating).toFixed(1) : '4.5');

const FarmerProductListPage = ({
  products = [],
  filteredProducts = [],
  isLoading = false,
  categories = [],
  searchQuery = '',
  setSearchQuery,
  filterCategory = 'all',
  setFilterCategory,
  sortBy = 'newest',
  setSortBy,
  onCreateProduct,
  onEditProduct,
  onToggleProductStatus,
  onDeleteProduct,
  productsError = ''
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const activeCount = products.filter((product) => product.status === 'active').length;
  const inactiveCount = products.filter((product) => product.status === 'inactive').length;
  const lowStockCount = products.filter((product) => Number(product.quantity || 0) < 25).length;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(236,253,245,0.96)_58%,_rgba(240,253,250,0.96)_100%)] p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              <FaBox className="text-xs" />
              Product Management
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              Product List Page
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
              Manage products in a clear table layout with fast actions for viewing, editing, deleting,
              and updating listing status.
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateProduct}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <FaPlus className="text-xs" />
            Create Product
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total Products</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{products.length}</p>
            <p className="mt-2 text-sm text-slate-500">All products connected to your panel.</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Active Listings</p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">{activeCount}</p>
            <p className="mt-2 text-sm text-slate-500">Products currently visible in your storefront.</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Low Stock</p>
            <p className="mt-3 text-3xl font-bold text-amber-600">{lowStockCount}</p>
            <p className="mt-2 text-sm text-slate-500">Listings that may need fresh stock soon.</p>
          </div>
        </div>
      </section>

      {productsError && (
        <div className="rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {productsError}
        </div>
      )}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <FaFilter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:bg-white lg:min-w-[210px]"
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white lg:min-w-[180px]"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="rounded-full bg-slate-900 px-4 py-2 font-medium text-white">
            {filteredProducts.length} results
          </span>
          <span className="rounded-full bg-emerald-50 px-4 py-2 font-medium text-emerald-700">
            {activeCount} active
          </span>
          <span className="rounded-full bg-slate-100 px-4 py-2">
            {inactiveCount} inactive
          </span>
        </div>
      </section>

      {isLoading ? (
        <div className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-md">
          <span className="text-lg font-semibold text-emerald-600">Loading products...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-md">
          <div className="mx-auto max-w-md">
            <FaBox className="mx-auto mb-4 text-4xl text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900">No products found</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Try a different filter or create a new listing for your farmer panel.
            </p>
            <button
              type="button"
              onClick={onCreateProduct}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              <FaPlus className="text-xs" />
              Create Product
            </button>
          </div>
        </div>
      ) : (
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-bold text-slate-900">Products Table</h2>
            <p className="mt-1 text-sm text-slate-500">
              Use the action buttons to view, edit, delete, or update product status directly from the table.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1080px] w-full">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Performance</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="align-top transition hover:bg-slate-50/80">
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-16 w-16 rounded-2xl object-cover shadow-sm"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold text-slate-900">{product.name}</p>
                            {product.organic && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                <FaLeaf className="text-[10px]" />
                                Organic
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                            Product Listing
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {product.category || 'Uncategorized'}
                        </span>
                        <div className="flex items-start gap-2 text-xs text-slate-500">
                          <FaMapMarkerAlt className="mt-0.5 flex-shrink-0 text-emerald-500" />
                          <span className="max-w-[170px]">
                            {product.address || 'Location not added'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-emerald-700">{formatCurrency(product.price)}</p>
                      <p className="mt-1 text-xs text-slate-500">per {product.unit || 'kg'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-lg font-bold text-slate-900">{product.quantity || 0}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {Number(product.quantity || 0) < 25 ? 'Low stock' : 'Healthy stock'}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <FaStar className="text-amber-400" />
                          <span className="font-semibold text-slate-900">{getRatingValue(product.rating)}</span>
                        </div>
                        <p>Sold: {product.sales || 0}</p>
                        <p>Views: {product.views || 0}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(product.status)}`}>
                        {product.status || 'active'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleProductStatus(product.id)}
                        className="mt-3 block text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
                      >
                        {product.status === 'active' ? 'Set inactive' : 'Set active'}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <FaEye className="text-xs" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditProduct(product)}
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <FaEdit className="text-xs" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(product.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          <FaTrash className="text-xs" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute right-5 top-5 z-10 rounded-full bg-white p-3 text-slate-600 shadow-lg transition hover:bg-slate-50"
            >
              <FaTimes />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-[320px] overflow-hidden bg-slate-900">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.04)_0%,_rgba(15,23,42,0.2)_48%,_rgba(15,23,42,0.84)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">Product View</p>
                  <h2 className="mt-3 text-3xl font-bold">{selectedProduct.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-100/90">
                    Full product details for this farmer listing.
                  </p>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {selectedProduct.category || 'Uncategorized'}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(selectedProduct.status)}`}>
                    {selectedProduct.status || 'active'}
                  </span>
                  {selectedProduct.organic && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Organic
                    </span>
                  )}
                </div>

                <div className="mt-6 rounded-[1.75rem] bg-slate-50 p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Current price</p>
                      <p className="mt-3 text-3xl font-bold text-slate-900">
                        {formatCurrency(selectedProduct.price)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Unit</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{selectedProduct.unit || 'kg'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-slate-900">All Product Details</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">Category</p>
                      <p className="mt-2 text-base font-bold text-slate-900">
                        {selectedProduct.category || 'Uncategorized'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">Unit</p>
                      <p className="mt-2 text-base font-bold text-slate-900">
                        {selectedProduct.unit || 'kg'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">Listing Status</p>
                      <p className="mt-2 text-base font-bold text-slate-900">
                        {selectedProduct.status || 'active'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">Quality Rating</p>
                      <div className="mt-2 flex items-center gap-2 text-base font-bold text-slate-900">
                        <FaStar className="text-amber-400" />
                        {getRatingValue(selectedProduct.rating)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Stock</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">{selectedProduct.quantity || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Sold</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">{selectedProduct.sales || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Views</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">{selectedProduct.views || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Price</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {formatCurrency(selectedProduct.price)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900">Location</p>
                  <div className="mt-2 flex items-start gap-2 text-sm text-emerald-700">
                    <FaMapMarkerAlt className="mt-0.5 flex-shrink-0" />
                    <span>{selectedProduct.address || 'Location not added yet.'}</span>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Description</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {selectedProduct.description || 'No product description added yet.'}
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => onEditProduct(selectedProduct)}
                    className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Edit Product
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(selectedProduct.id)}
                    className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProductListPage;

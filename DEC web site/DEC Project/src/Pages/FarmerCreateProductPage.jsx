import {
  FaArrowLeft,
  FaBoxOpen,
  FaImage,
  FaMapMarkerAlt,
  FaPlus,
  FaRupeeSign,
  FaSave,
  FaSpinner,
  FaTimes,
  FaUpload
} from 'react-icons/fa';

const FarmerCreateProductPage = ({
  editingProduct,
  productForm,
  setProductForm,
  categories = [],
  units = [],
  previewImages = [],
  isUploading = false,
  formError = '',
  onSubmit,
  onImageUpload,
  onRemoveImage,
  onCancel,
  onOpenProductList
}) => {
  const isEditMode = Boolean(editingProduct);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(240,253,250,0.98)_58%,_rgba(236,253,245,0.96)_100%)] p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              <FaPlus className="text-xs" />
              Product Management
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              {isEditMode ? 'Update Product Page' : 'Create Product Page'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
              {isEditMode
                ? 'Edit product details, update the listing status, and keep your product information fresh.'
                : 'Create a new farmer listing with product details, pricing, stock, and images in one modern page.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onOpenProductList}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FaArrowLeft className="text-xs" />
              Product List
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              {isEditMode ? 'Start New Product' : 'Reset Form'}
            </button>
          </div>
        </div>
      </section>

      {formError && (
        <div className="rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {formError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)] lg:p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Product Name</span>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                  placeholder="e.g. Premium Green Chillies"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Price (Rs.)</span>
                <div className="relative">
                  <FaRupeeSign className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Stock Quantity</span>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                  placeholder="Available quantity"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Category</span>
                <select
                  value={productForm.category}
                  onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Unit</span>
                <select
                  value={productForm.unit}
                  onChange={(event) => setProductForm({ ...productForm, unit: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                >
                  <option value="">Select unit</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Pickup / Delivery Address</span>
                <div className="relative">
                  <FaMapMarkerAlt className="pointer-events-none absolute left-4 top-4 text-slate-400" />
                  <input
                    type="text"
                    value={productForm.address || ''}
                    onChange={(event) => setProductForm({ ...productForm, address: event.target.value })}
                    placeholder="e.g. Galle Dedicated Economic Center"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </label>

              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Status</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={`rounded-2xl border px-4 py-3 transition ${
                    productForm.status === 'active'
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={productForm.status === 'active'}
                      onChange={(event) => setProductForm({ ...productForm, status: event.target.value })}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold text-slate-900">Active</span>
                    <span className="mt-1 block text-xs text-slate-500">Visible and ready in the shop page.</span>
                  </label>

                  <label className={`rounded-2xl border px-4 py-3 transition ${
                    productForm.status === 'inactive'
                      ? 'border-slate-300 bg-slate-100'
                      : 'border-slate-200 bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={productForm.status === 'inactive'}
                      onChange={(event) => setProductForm({ ...productForm, status: event.target.value })}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold text-slate-900">Inactive</span>
                    <span className="mt-1 block text-xs text-slate-500">Saved but not visible to buyers.</span>
                  </label>
                </div>
              </div>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Description</span>
                <textarea
                  rows="5"
                  value={productForm.description}
                  onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                  placeholder="Describe quality, freshness, sourcing, and delivery details..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </label>

              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Product Images</span>
                <div className="rounded-[1.75rem] border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                    <FaImage className="text-xl" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-800">
                    Upload clear product photos
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    PNG or JPG images help your listing look more professional.
                  </p>
                  <label
                    htmlFor="product-image-upload"
                    className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <FaUpload className="text-xs" />
                    Choose Images
                    <input
                      id="product-image-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*"
                      onChange={onImageUpload}
                    />
                  </label>
                </div>

                {previewImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {previewImages.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                      >
                        <img
                          src={image}
                          alt={`Product preview ${index + 1}`}
                          className="h-28 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveImage(index)}
                          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-slate-600 shadow-sm transition hover:bg-white"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70"
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    Processing...
                  </>
                ) : isEditMode ? (
                  <>
                    <FaSave className="text-xs" />
                    Update Product
                  </>
                ) : (
                  <>
                    <FaUpload className="text-xs" />
                    Upload Product
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                <FaBoxOpen />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isEditMode ? 'Editing existing product' : 'Creating a new product'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isEditMode
                    ? 'Update the listing and save your changes to refresh the product list.'
                    : 'Fill the important fields first, then add good product photos and publish.'}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current Name</p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {productForm.name || 'Product name will appear here'}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current Price</p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {productForm.price ? `Rs. ${productForm.price}` : 'Add pricing details'}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Listing Status</p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {productForm.status === 'inactive' ? 'Inactive Draft' : 'Active Listing'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
            <h3 className="text-lg font-bold text-slate-900">Smart Page Tips</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-[1.5rem] bg-emerald-50 p-4">
                Use a clear product name buyers can scan quickly.
              </div>
              <div className="rounded-[1.5rem] bg-sky-50 p-4">
                Add stock and unit correctly so the product list stays accurate.
              </div>
              <div className="rounded-[1.5rem] bg-amber-50 p-4">
                Good product photos help the storefront and shop page look stronger.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FarmerCreateProductPage;

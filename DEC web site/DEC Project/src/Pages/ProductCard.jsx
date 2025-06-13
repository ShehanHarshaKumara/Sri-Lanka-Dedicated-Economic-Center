import React from 'react';
import { 
  FaHeart, 
  FaEye, 
  FaStar, 
  FaMapMarkerAlt, 
  FaShoppingCart,
  FaLeaf,
  FaTruck
} from 'react-icons/fa';

const ProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  onViewDetails,
  isInWishlist = false,
  variant = 'default' // 'default', 'compact', 'featured'
}) => {
  // Calculate discounted price
  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100)
    : product.price;
  
  const originalPrice = product.discount > 0 
    ? product.price 
    : null;

  // Render star rating
  const renderStars = () => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
        size={variant === 'compact' ? 12 : 14}
      />
    ));
  };

  // Compact variant for grid layouts
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="relative">
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
              -{product.discount}%
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold">
                Out of Stock
              </span>
            </div>
          )}
          <div className="h-48 overflow-hidden">
            <img
              src={product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-2 rounded-full transition-colors ${
                isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white'
              }`}
            >
              <FaHeart size={14} />
            </button>
            <button
              onClick={() => onViewDetails(product)}
              className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-green-500 hover:text-white transition-colors"
            >
              <FaEye size={14} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{product.category}</p>
          
          <div className="flex items-center gap-1 mb-2">
            {renderStars()}
            <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-green-600">
                Rs.{discountedPrice.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-xs text-gray-500 line-through ml-2">
                  Rs.{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={() => onAddToCart(product)}
              disabled={!product.inStock}
              className={`p-2 rounded-lg transition-colors ${
                product.inStock
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Featured variant for highlighting special products
  if (variant === 'featured') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl overflow-hidden border-2 border-green-200">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-1/2">
            {product.featured && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-lg font-bold shadow-lg z-10 flex items-center gap-2">
                <FaStar /> Featured Product
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <span className="bg-gray-800 text-white px-6 py-3 rounded-lg font-bold text-lg">
                  Out of Stock
                </span>
              </div>
            )}
            <img
              src={product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          
          <div className="p-6 md:w-1/2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-sm text-green-600 font-semibold">{product.category}</p>
              </div>
              <button
                onClick={() => onToggleWishlist(product)}
                className={`p-3 rounded-full transition-colors ${
                  isInWishlist
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-red-500 hover:text-white shadow-md'
                }`}
              >
                <FaHeart size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <FaMapMarkerAlt className="mr-2 text-green-500" />
                {product.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FaTruck className="mr-2 text-green-500" />
                Fast delivery available
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FaLeaf className="mr-2 text-green-500" />
                100% Organic & Fresh
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              {renderStars()}
              <span className="text-sm text-gray-500">({product.reviews?.length || 0} reviews)</span>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                {product.discount > 0 && (
                  <span className="text-sm text-red-500 font-bold">Save {product.discount}%</span>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600">
                    Rs.{discountedPrice.toFixed(2)}
                  </span>
                  {originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      Rs.{originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">per {product.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Stock: {product.stock} {product.unit}</p>
                <p className="text-sm text-green-600 font-semibold">
                  {product.sales} sold
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => onAddToCart(product)}
                disabled={!product.inStock}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  product.inStock
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaShoppingCart />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                onClick={() => onViewDetails(product)}
                className="px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-red-500/20 hover:border-red-500/40 shadow-2xl hover:shadow-red-500/10 transition-all duration-300 hover:scale-[1.02] group ${!product.inStock ? 'opacity-75' : ''}`}>
      <div className="relative">
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10">
            -{product.discount}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute top-3 right-3 bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10">
            Out of Stock
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button
            onClick={() => onToggleWishlist(product)}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/20 text-white hover:bg-red-500/50'
            }`}
          >
            <FaHeart size={16} />
          </button>
          <button 
            onClick={() => onViewDetails(product)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <FaEye size={16} />
          </button>
        </div>
        <div className="h-48 sm:h-56 overflow-hidden">
          <img 
            src={product.images?.[0] || '/placeholder.jpg'} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {product.name}
          </h3>
          <span className="bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 px-2 py-1 rounded-lg border border-red-500/30 text-xs">
            {product.category}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <p className="text-gray-400 text-sm mb-4 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-red-400" /> {product.location}
        </p>
        
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400 mr-2">
            {renderStars()}
          </div>
          <span className="text-gray-500 text-sm">
            ({product.rating})
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Rs.{discountedPrice.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="block text-gray-500 line-through text-sm">
                Rs.{originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button 
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base ${
              product.inStock
                ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white hover:shadow-red-500/30'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
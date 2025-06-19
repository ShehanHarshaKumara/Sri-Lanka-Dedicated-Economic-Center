import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const ReviewFeedback = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      rating: 5,
      review: 'Absolutely love this product! Exceeded all my expectations.',
      date: '2023-10-15'
    },
    {
      id: 2,
      name: 'Sarah Miller',
      rating: 4,
      review: 'Great quality and fast delivery. Would recommend to friends.',
      date: '2023-09-28'
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !name || !review) return;

    const newReview = {
      id: reviews.length + 1,
      name,
      rating,
      review,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews([newReview, ...reviews]);
    setSubmitted(true);
    resetForm();
  };

  const resetForm = () => {
    setRating(0);
    setName('');
    setEmail('');
    setReview('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
      
      {/* Average Rating */}
      <div className="flex items-center mb-8">
        <div className="flex items-center mr-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon 
              key={star}
              className={`h-6 w-6 ${star <= calculateAverageRating() ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-gray-700 font-medium">
          {calculateAverageRating().toFixed(1)} out of 5 ({reviews.length} reviews)
        </span>
      </div>

      {/* Review Form */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="mb-10 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Share your experience</h3>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Your Rating</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <StarIcon
                    className={`h-8 w-8 ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">Email (optional)</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="review" className="block text-gray-700 mb-2">Your Review</label>
            <textarea
              id="review"
              rows="4"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Review
          </button>
        </form>
      ) : (
        <div className="mb-10 p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Thank you for your review!</h3>
          <p className="text-green-700">Your feedback has been submitted successfully.</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((item) => (
          <div key={item.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-5 w-5 ${star <= item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">{item.date}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mt-2">{item.review}</p>
          </div>
        ))}
      </div>
    </div>
  );

  function calculateAverageRating() {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / reviews.length;
  }
};

export default ReviewFeedback;
import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { sounds } from '../game/sound';
import { GameReview } from '../types/store';

interface Props {
  gameTitle: string;
  onClose: () => void;
  onSubmit: (review: GameReview) => void;
}

export const ReviewModal: React.FC<Props> = ({ gameTitle, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide your review feedback.');
      return;
    }

    const newRev: GameReview = {
      id: 'rev-' + Date.now(),
      author: author.trim() || 'Verified GGO Player',
      avatarBg: 'bg-emerald-600',
      rating,
      date: 'Just now',
      comment: comment.trim(),
      likes: 1,
    };

    sounds.playClick();
    onSubmit(newRev);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-[#262626] border border-[#3e3e3e] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Write a Review</h3>
        <p className="text-xs text-slate-400 mb-5">Share your experience playing {gameTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Your Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                      setRating(star);
                      sounds.playClick();
                    }}
                    className="p-1 text-slate-600 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        active ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-amber-400 ml-2">
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : 'Needs improvement'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name (Optional)</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Alex Striker"
              className="w-full bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Review</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError('');
              }}
              placeholder="Tell others what you love about the robots, graphics, super moves, or AI tactics..."
              className="w-full bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
            />
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#333333] hover:bg-[#3d3d3d] text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

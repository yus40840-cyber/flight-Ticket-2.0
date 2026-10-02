import React, { useState } from 'react';
import { X, Heart, MessageSquare, Share2, Bookmark, MapPin, Calendar } from 'lucide-react';
import { MomentItem } from '../types';

interface MomentDetailsModalProps {
  moment: MomentItem | null;
  onClose: () => void;
}

export const MomentDetailsModal: React.FC<MomentDetailsModalProps> = ({ moment, onClose }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<string[]>([
    'Such a helpful itinerary! Taking notes for my upcoming Milan vacation in November.',
    'Did you need to reserve the pastry shop in advance or is walk-in okay?',
  ]);
  const [newComment, setNewComment] = useState('');

  if (!moment) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, newComment.trim()]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Cover */}
        <div className="relative h-64 w-full bg-slate-100 overflow-hidden shrink-0">
          <img
            src={moment.coverImage}
            alt={moment.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{moment.location}</span>
              <span>·</span>
              <Calendar className="w-3.5 h-3.5 text-slate-300" />
              <span>{moment.date}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-display tracking-tight leading-snug">
              {moment.title}
            </h2>
          </div>
        </div>

        {/* Story Body & Author */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Author strip */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                {moment.authorAvatar || moment.author.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  {moment.author}
                </div>
                <div className="text-[11px] text-slate-400">Verified Fligh.com Contributor</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  liked
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                <span>{moment.likes + (liked ? 1 : 0)}</span>
              </button>

              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  bookmarked
                    ? 'border-blue-200 bg-blue-50 text-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Full story prose */}
          <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3">
            <p className="font-semibold text-slate-900">{moment.summary}</p>
            <p>{moment.fullStory}</p>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-400">Tags:</span>
            {moment.tags.map((tag, idx) => (
              <span key={idx} className="text-blue-600 hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>

          {/* Comments section */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Traveler Discussion ({comments.length})</span>
            </h4>

            <div className="space-y-2.5 mb-4">
              {comments.map((c, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 mb-0.5">
                    Traveler #{i + 1}
                  </div>
                  <div>{c}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ask a question or leave a tip..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

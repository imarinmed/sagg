'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Lock,
  Unlock,
  Star,
  Upload,
  Users,
  Award,
  Image as ImageIcon,
  Send,
  MoreVertical
} from 'lucide-react';

export type SocialTab = 'feed' | 'upload' | 'rankings' | 'messages';

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  isPremium: boolean;
  tags: string[];
}

export interface SchoolSocialAppProps {
  currentStudentId: string;
  posts: SocialPost[];
  studentRank: number;
  totalStudents: number;
  followerCount: number;
  onUploadPhoto?: () => void;
  onViewPost?: (postId: string) => void;
  onLikePost?: (postId: string) => void;
  className?: string;
}

export function SchoolSocialApp({
  currentStudentId,
  posts,
  studentRank,
  totalStudents,
  followerCount,
  onUploadPhoto,
  onViewPost,
  onLikePost,
  className = ''
}: SchoolSocialAppProps) {
  const [activeTab, setActiveTab] = useState<SocialTab>('feed');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [isPremiumUpload, setIsPremiumUpload] = useState(false);
  const [caption, setCaption] = useState('');

  const handleLike = (postId: string) => {
    if (!likedPosts.has(postId)) {
      setLikedPosts(prev => new Set(prev).add(postId));
      onLikePost?.(postId);
    }
  };

  const renderFeed = () => (
    <div className="space-y-4 pb-20 p-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-[var(--color-bg-secondary)] rounded-xl overflow-hidden shadow-sm border border-[var(--color-border)]"
          onClick={() => onViewPost?.(post.id)}
        >
          <div className="flex items-center gap-3 p-3">
            <img 
              src={post.authorPhoto} 
              alt={post.authorName}
              className="w-8 h-8 rounded-full object-cover border border-[var(--color-border)]"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{post.authorName}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{post.timestamp}</p>
            </div>
            {post.isPremium && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <Lock className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-medium text-amber-400">Premium</span>
              </div>
            )}
          </div>

          <div className="aspect-square bg-black/5 relative">
            <img 
              src={post.imageUrl} 
              alt="Post"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-3">
            <div className="flex items-center gap-4 mb-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(post.id);
                }}
                className={`flex items-center gap-1 ${
                  likedPosts.has(post.id) ? 'text-rose-400' : 'text-[var(--color-text-muted)]'
                }`}
              >
                <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
              </motion.button>

              <button className="flex items-center gap-1 text-[var(--color-text-muted)]">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.comments}</span>
              </button>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
              <span className="font-medium text-[var(--color-text-primary)] mr-1">{post.authorName}</span>
              {post.caption}
            </p>

            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.map(tag => (
                <span 
                  key={tag}
                  className="text-[10px] text-[var(--color-accent-primary)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderUpload = () => (
    <div className="p-4 space-y-6 h-full overflow-y-auto pb-20">
      <div className="text-center mb-2">
        <h2 className="text-lg font-medium text-[var(--color-text-primary)]">New Post</h2>
        <p className="text-xs text-[var(--color-text-secondary)]">Share your best moments</p>
      </div>

      <div className="aspect-[4/5] rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-colors group">
        <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
          <Camera className="w-8 h-8 text-[var(--color-text-muted)]" />
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">Tap to take photo</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Caption</label>
          <textarea 
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] resize-none h-24"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${isPremiumUpload ? 'bg-amber-500/20 text-amber-400' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'}`}>
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Premium Content</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Exclusive to followers</p>
            </div>
          </div>
          <button 
            onClick={() => setIsPremiumUpload(!isPremiumUpload)}
            className={`w-10 h-6 rounded-full relative transition-colors ${isPremiumUpload ? 'bg-amber-500' : 'bg-[var(--color-bg-tertiary)]'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPremiumUpload ? 'left-5' : 'left-1'}`} />
          </button>
        </div>

        <button 
          onClick={onUploadPhoto}
          className="w-full py-3 bg-[var(--color-accent-primary)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Share Post
        </button>
      </div>
    </div>
  );

  const renderRankings = () => (
    <div className="p-4 space-y-4 pb-20 overflow-y-auto h-full">
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4 shadow-lg shadow-amber-500/20 relative"
        >
          <span className="text-4xl font-bold text-white">#{studentRank}</span>
          <div className="absolute -bottom-2 bg-[var(--color-bg-primary)] px-3 py-1 rounded-full border border-[var(--color-border)] shadow-sm">
            <span className="text-xs font-medium text-[var(--color-text-primary)]">Top 10%</span>
          </div>
        </motion.div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mt-2">
          Your Ranking
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Out of {totalStudents} students
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 text-center border border-[var(--color-border)]">
          <Users className="w-5 h-5 mx-auto mb-2 text-[var(--color-accent-primary)]" />
          <p className="text-xl font-bold text-[var(--color-text-primary)]">{followerCount}</p>
          <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider">Followers</p>
        </div>

        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 text-center border border-[var(--color-border)]">
          <Star className="w-5 h-5 mx-auto mb-2 text-amber-400" />
          <p className="text-xl font-bold text-[var(--color-text-primary)]">{posts.filter(p => p.isPremium).length}</p>
          <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider">Premium Posts</p>
        </div>
      </div>

      <div className="bg-[var(--color-bg-secondary)] rounded-xl p-5 border border-[var(--color-border)]">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[var(--color-accent-primary)]" />
          Performance Metrics
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Photo Quality', value: 85, color: 'from-blue-400 to-blue-600' },
            { label: 'Engagement', value: 72, color: 'from-rose-400 to-rose-600' },
            { label: 'Consistency', value: 90, color: 'from-emerald-400 to-emerald-600' },
            { label: 'Premium Ratio', value: 45, color: 'from-amber-400 to-amber-600' }
          ].map((factor, i) => (
            <div key={factor.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--color-text-secondary)]">{factor.label}</span>
                <span className="font-medium text-[var(--color-text-primary)]">{factor.value}%</span>
              </div>
              <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.value}%` }}
                  transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                  className={`h-full bg-gradient-to-r ${factor.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="flex flex-col h-full pb-20">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-lg font-medium text-[var(--color-text-primary)]">Messages</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i}
            className="flex items-center gap-3 p-4 hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer border-b border-[var(--color-border)]/50"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
              {i < 3 && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--color-bg-primary)]" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">Student Name {i}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">1{i}m</p>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] truncate">
                {i === 1 ? 'Loved your latest photo! 😍' : 'Are you going to the event tonight?'}
              </p>
            </div>
            
            {i === 1 && (
              <div className="w-5 h-5 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">1</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col bg-[var(--color-bg-primary)] ${className}`}>
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'feed' && renderFeed()}
            {activeTab === 'upload' && renderUpload()}
            {activeTab === 'rankings' && renderRankings()}
            {activeTab === 'messages' && renderMessages()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/80 backdrop-blur-md absolute bottom-0 w-full z-10">
        <div className="flex items-center justify-around p-2">
          {[
            { id: 'feed', icon: Camera, label: 'Feed' },
            { id: 'upload', icon: Upload, label: 'Upload' },
            { id: 'rankings', icon: TrendingUp, label: 'Rank' },
            { id: 'messages', icon: MessageCircle, label: 'Chat' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SocialTab)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' 
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SchoolSocialApp;

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
  Award
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

  const handleLike = (postId: string) => {
    if (!likedPosts.has(postId)) {
      setLikedPosts(prev => new Set(prev).add(postId));
      onLikePost?.(postId);
    }
  };

  const renderFeed = () => (
    <div className="space-y-4 pb-20">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-[var(--color-bg-secondary)] rounded-xl overflow-hidden"
          onClick={() => onViewPost?.(post.id)}
        >
          <div className="flex items-center gap-3 p-3">
            <img 
              src={post.authorPhoto} 
              alt={post.authorName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{post.authorName}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{post.timestamp}</p>
            </div>
            {post.isPremium && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-full">
                <Lock className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-amber-400">Premium</span>
              </div>
            )}
          </div>

          <div className="aspect-square">
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

            <p className="text-sm text-[var(--color-text-secondary)]">
              <span className="font-medium text-[var(--color-text-primary)]">{post.authorName} </span>
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

  const renderRankings = () => (
    <div className="p-4 space-y-4">
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4"
        >
          <span className="text-3xl font-bold text-white">#{studentRank}</span>
        </motion.div>
        <p className="text-lg font-medium text-[var(--color-text-primary)]">
          Your Rank
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Out of {totalStudents} students
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-[var(--color-accent-primary)]" />
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{followerCount}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Followers</p>
        </div>

        <div className="glass rounded-xl p-4 text-center">
          <Star className="w-6 h-6 mx-auto mb-2 text-amber-400" />
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{posts.filter(p => p.isPremium).length}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Premium Posts</p>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
          Ranking Factors
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Photo Quality', value: 85 },
            { label: 'Engagement', value: 72 },
            { label: 'Consistency', value: 90 },
            { label: 'Premium Content', value: 45 }
          ].map((factor) => (
            <div key={factor.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-text-secondary)]">{factor.label}</span>
                <span className="text-[var(--color-text-primary)]">{factor.value}%</span>
              </div>
              <div className="h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.value}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-[var(--color-accent-primary)] to-amber-400 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col bg-[var(--color-bg-primary)] ${className}`}>
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {activeTab === 'feed' && renderFeed()}
            {activeTab === 'rankings' && renderRankings()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2">
        <div className="flex items-center justify-around">
          {[
            { id: 'feed', icon: Camera, label: 'Feed' },
            { id: 'upload', icon: Upload, label: 'Upload' },
            { id: 'rankings', icon: TrendingUp, label: 'Rank' },
            { id: 'messages', icon: MessageCircle, label: 'Chat' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'upload') {
                  onUploadPhoto?.();
                } else {
                  setActiveTab(tab.id as SocialTab);
                }
              }}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'text-[var(--color-accent-primary)]' 
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'fill-current' : ''}`} />
              <span className="text-[10px]">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SchoolSocialApp;

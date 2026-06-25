/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, Share2, Send, Plus, Image as ImageIcon, ThumbsUp, MessageCircle, ArrowLeft, Video } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { AppState, Post } from '../types';
import { dbService } from '../dbService';

export default function CommunityScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser!;
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setIsPosting(true);
    try {
      await dbService.createPost({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: newPost,
        type: 'text'
      });
      setNewPost('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-[#37474F]" />
        </button>
        <h1 className="text-xl font-black text-[#37474F] uppercase tracking-tight">Social Feed</h1>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Create Post Card */}
        <Card className="p-4 space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-[#FFC107] rounded-full flex items-center justify-center font-black text-white shrink-0 overflow-hidden">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name[0]}
            </div>
            <textarea
              placeholder="What's on your mind? Share your earnings or review users!"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 ring-[#FFC107] resize-none h-24"
            />
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-400 hover:text-[#FFC107] transition-colors">
                <ImageIcon size={20} />
                <span className="text-[10px] font-black uppercase">Add Photo</span>
              </button>
              <button 
                onClick={() => navigate('/my-shop/add-product')}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
              >
                <ImageIcon size={20} />
                <span className="text-[10px] font-black uppercase">Post Product</span>
              </button>
            </div>
            <Button 
              onClick={handleCreatePost} 
              disabled={isPosting || !newPost.trim()}
              className="h-10 px-6 rounded-full"
            >
              {isPosting ? 'Posting...' : 'Post Now'}
            </Button>
          </div>
        </Card>

        {/* Feed */}
        <div className="space-y-4">
          {state.posts && state.posts.length > 0 ? (
            state.posts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((post) => (
              <Card key={post.id} className="p-0 overflow-hidden border-none shadow-md">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-[#FFC107] overflow-hidden border border-gray-100">
                        {(post.userId === user.id || user.isAdmin) && post.userAvatar ? (
                          <img src={post.userAvatar} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center"><ThumbsUp size={16} className="text-gray-200" /></div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#37474F]">
                          {post.userId === user.id || user.isAdmin 
                            ? (post.userName || 'Unknown Operative') 
                            : (post.userName || 'Unknown Operative').split(' ').map((n, i) => i === 0 ? n[0] + '***' : n).join(' ')
                          }
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#37474F] leading-relaxed">{post.content}</p>
                  {post.mediaUrl && post.type === 'image' && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-gray-100">
                      <img src={post.mediaUrl} alt="PostContent" className="w-full h-auto" />
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 bg-gray-50/50 flex items-center gap-6 border-t border-gray-50">
                  <button 
                    onClick={() => dbService.reactToPost(post.id, user.id, 'like')}
                    className={`flex items-center gap-2 transition-colors ${post.reactions?.[user.id] === 'like' ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    <Heart size={18} fill={post.reactions?.[user.id] === 'like' ? 'currentColor' : 'none'} />
                    <span className="text-xs font-black">{Object.keys(post.reactions || {}).length}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400">
                    <MessageCircle size={18} />
                    <span className="text-xs font-black">{post.comments?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 ml-auto">
                    <Share2 size={18} />
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <MessageSquare size={32} className="text-gray-200" />
               </div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No posts yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

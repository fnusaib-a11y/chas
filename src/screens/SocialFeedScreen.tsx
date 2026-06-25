import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, MessageCircle, Heart, Share2, MoreHorizontal, 
  ImageIcon, ShoppingBag, Zap, Flame, Camera, 
  TrendingUp, Users, Smile, Send, Bookmark, UserPlus, X,
  HeartIcon, ThumbsUp, Laugh, Star, Ghost
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/UI';
import { AppState, Post, User, SocialStory } from '../types';
import { dbService } from '../dbService';

const REACTIONS = [
  { type: 'like', icon: Heart, color: 'text-pink-500', emoji: '❤️' },
  { type: 'wow', icon: Zap, color: 'text-yellow-500', emoji: '😮' },
  { type: 'lol', icon: Laugh, color: 'text-orange-500', emoji: '😂' },
  { type: 'cool', icon: Star, color: 'text-blue-500', emoji: '😎' },
  { type: 'spooky', icon: Ghost, color: 'text-purple-500', emoji: '👻' },
];

function StoryViewer({ state, story, onClose }: { state: AppState, story: SocialStory, onClose: () => void }) {
  const user = state.users.find(u => u.id === story.userId) || { name: story.userName, avatar: story.userAvatar };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-3xl"
    >
      <div className="absolute top-8 left-0 right-0 p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border-2 border-indigo-500 overflow-hidden bg-white/5">
            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black">{user.name[0]}</div>}
          </div>
          <div>
            <p className="text-white font-black text-sm">{user.name}</p>
            <p className="text-white/40 text-[9px] uppercase tracking-widest">2h ago</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-2xl text-white"><X size={20} /></button>
      </div>

      <div className="w-full max-w-sm aspect-[9/16] rounded-[40px] overflow-hidden border border-white/10 relative shadow-2xl shadow-indigo-500/20 bg-black">
        <img src={story.url} className="w-full h-full object-cover" />
      </div>
    </motion.div>
  );
}

function ReactionPicker({ onSelect }: { onSelect: (type: string) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute bottom-full mb-4 left-0 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[28px] p-2 flex gap-1 shadow-2xl"
    >
      {REACTIONS.map(r => (
        <button
          key={r.type}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(r.type);
          }}
          className="w-10 h-10 rounded-2xl hover:bg-white/10 flex items-center justify-center active:scale-90 transition-all text-xl"
        >
          {r.emoji}
        </button>
      ))}
    </motion.div>
  );
}

export default function SocialFeedScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const currentUser = state.currentUser!;
  const [postContent, setPostContent] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products'>('all');
  const [activeReactionPost, setActiveReactionPost] = useState<string | null>(null);
  const [viewingStory, setViewingStory] = useState<SocialStory | null>(null);
  const [expandCreatePost, setExpandCreatePost] = useState(false);
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postType, setPostType] = useState<'text' | 'image'>('text');
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isPostingStory, setIsPostingStory] = useState(false);
  const [storyUrl, setStoryUrl] = useState('');

  const handlePost = async () => {
    if (!postContent.trim()) return;

    try {
      await dbService.createPost({
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        content: postContent,
        type: postMediaUrl ? 'image' : 'text',
        mediaUrl: postMediaUrl || undefined,
      });
      setPostContent('');
      setPostMediaUrl('');
      setPostType('text');
      setExpandCreatePost(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostStory = async () => {
    if (!storyUrl.trim()) return;
    try {
      await dbService.createStory(currentUser.id, 'image', storyUrl);
      setStoryUrl('');
      setIsPostingStory(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    try {
      await dbService.addComment(postId, commentText, currentUser);
      setCommentText('');
    } catch (e) {
      console.error(e);
    }
  };

  const socialActions = [
    { icon: ImageIcon, label: 'Media', color: 'text-blue-400', bg: 'bg-blue-50', action: () => { setPostType('image'); setExpandCreatePost(true); } },
    { icon: ShoppingBag, label: 'Sale', color: 'text-emerald-400', bg: 'bg-emerald-50', action: () => navigate('/my-shop/add-product') },
    { icon: Camera, label: 'Story', color: 'text-pink-500', bg: 'bg-pink-50', action: () => setIsPostingStory(true) },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Futuristic Header */}
      <div className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-white/20">
              <Zap size={22} className="text-white fill-white" />
           </div>
           <h1 className="text-xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Circle</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white/5 rounded-2xl border border-white/10 relative hover:bg-white/10 transition-all shadow-inner group">
             <Search size={20} className="text-white/40 group-hover:text-white transition-colors" />
          </button>
          <button onClick={() => navigate('/chat')} className="p-2.5 bg-white/5 rounded-2xl border border-white/10 relative hover:bg-white/10 transition-all shadow-inner group">
             <MessageCircle size={20} className="text-white/40 group-hover:text-white transition-colors" />
             <div className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full ring-4 ring-[#020617]" />
          </button>
        </div>
      </div>

      <div className="pb-32">
        {/* Stories Section */}
        <div className="p-4 flex gap-4 overflow-x-auto no-scrollbar py-6 relative">
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none z-10" />
          
          {/* Add Story Button */}
          <div 
            onClick={() => setIsPostingStory(true)}
            className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
          >
             <div className="w-16 h-16 rounded-[24px] p-0.5 bg-white/10 group-hover:bg-indigo-500/50 transition-all">
                <div className="w-full h-full rounded-[22px] border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-transparent relative">
                   <Plus size={24} className="text-white/40 group-hover:text-white transition-colors" />
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full border-4 border-[#020617] flex items-center justify-center">
                      <Camera size={10} className="text-white" />
                   </div>
                </div>
             </div>
             <span className="text-[9px] font-black uppercase text-white/40 tracking-tighter group-hover:text-white">Relay</span>
          </div>

          {[...new Set(state.posts.map(p => p.userId))].slice(0, 8).map(uid => {
            const user = state.users.find(u => u.id === uid) || { name: 'User', avatar: '' };
            const story = state.socialStories.find(s => s.userId === uid);
            return (
              <div 
                key={uid} 
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
                onClick={() => story && setViewingStory(story)}
              >
                <div className="w-16 h-16 rounded-[24px] p-0.5 bg-gradient-to-tr from-[#FFC107] via-pink-500 to-indigo-500 shadow-lg active:scale-95 transition-transform">
                  <div className="w-full h-full rounded-[22px] border-2 border-[#0F172A] overflow-hidden bg-[#1E293B]">
                     {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm font-black uppercase text-white/50">{user.name[0]}</div>}
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-white/60 truncate w-14 text-center tracking-tighter">{user.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>

        {/* Create Post Card */}
        <div className="px-4 mb-8">
           <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[32px] shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px]" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-[80px]" />
              
              <div className="flex gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
                    {currentUser.avatar && <img src={currentUser.avatar} className="w-full h-full object-cover" />}
                 </div>
                 <div className="flex-1 space-y-3">
                   <textarea 
                      placeholder="Share your thoughts with the Circle..."
                      value={postContent}
                      onChange={(e) => {
                        setPostContent(e.target.value);
                        if (!expandCreatePost) setExpandCreatePost(true);
                      }}
                      className="w-full bg-transparent border-none outline-none text-sm font-medium resize-none pt-2 text-white placeholder:text-white/20 h-20"
                   />
                   
                   <AnimatePresence>
                     {expandCreatePost && (
                       <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                       >
                         <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-3 border border-white/5">
                            <ImageIcon size={18} className="text-white/20" />
                            <input 
                              type="text" 
                              placeholder="Paste Image URL..." 
                              value={postMediaUrl}
                              onChange={(e) => setPostMediaUrl(e.target.value)}
                              className="bg-transparent border-none outline-none text-xs flex-1 text-white/80"
                            />
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
              </div>

              <div className="h-px bg-white/5 my-4 relative z-10" />
              <div className="flex justify-between items-center relative z-10">
                 <div className="flex gap-2">
                    {socialActions.map((item, i) => (
                      <button 
                        key={i} 
                        onClick={item.action}
                        className={`p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all ${item.color}`}
                      >
                        <item.icon size={18} />
                      </button>
                    ))}
                 </div>
                 <Button onClick={handlePost} disabled={!postContent.trim()} className="h-10 px-6 rounded-2xl text-[10px] bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] border-none font-black uppercase tracking-widest active:scale-95 transition-all">
                    Propagate
                 </Button>
              </div>
           </Card>
        </div>

        {/* Filters */}
        <div className="px-4 flex gap-3 mb-6 overflow-x-auto no-scrollbar">
           {[
             { id: 'all', label: 'Feeds', icon: TrendingUp },
             { id: 'products', label: 'Flash Deals', icon: Zap },
             { id: 'followed', label: 'Following', icon: UserPlus },
           ].map(tab => (
             <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-[#FFC107] text-[#37474F] shadow-lg shadow-yellow-500/20 scale-105' : 'bg-white/5 text-white/40 border border-white/5'
                }`}
             >
                <tab.icon size={12} />
                {tab.label}
             </button>
           ))}
        </div>

        {/* Feed List */}
        <div className="px-4 space-y-6">
           {state.posts.map((post, i) => {
                const currentReaction = post.reactions?.[currentUser.id];
                const reactionInfo = REACTIONS.find(r => r.type === currentReaction);

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] space-y-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex justify-between items-center relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg">
                                <div className="w-full h-full rounded-[20px] bg-[#020617] overflow-hidden border border-white/5 flex items-center justify-center font-black">
                                  {post.userAvatar ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : <div className="text-white/50">{post.userName[0]}</div>}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white flex items-center gap-2">
                                  {post.userName}
                                  {i % 2 === 0 && <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 scale-75 uppercase px-2 py-0.5 rounded-lg">CORE</Badge>}
                                </h4>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-none mt-1">
                                  {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Digital Realm
                                </p>
                            </div>
                          </div>
                          <button className="p-2.5 bg-white/5 rounded-2xl text-white/20 hover:text-white/60 hover:bg-white/10 transition-all border border-transparent hover:border-white/10"><MoreHorizontal size={20} /></button>
                      </div>

                      <p className="text-base text-white/90 leading-relaxed font-medium px-1 relative z-10">
                          {post.content}
                      </p>

                      {post.mediaUrl && (
                        <div className="rounded-[40px] overflow-hidden border border-white/10 shadow-inner relative z-10 group/media aspect-video">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity" />
                            <img src={post.mediaUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 px-1 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <button 
                                onClick={() => {
                                  if (activeReactionPost === post.id) setActiveReactionPost(null);
                                  else setActiveReactionPost(post.id);
                                }}
                                className="flex items-center gap-2 group/react"
                              >
                                  <div className={`p-3 rounded-2xl transition-all shadow-inner ${currentReaction ? 'bg-indigo-500/20 text-indigo-400 scale-110 border border-indigo-500/30' : 'bg-white/5 text-white/40 group-hover/react:bg-white/10 group-hover/react:text-white border border-white/5 group-hover/react:border-white/10'}`}>
                                    {reactionInfo ? (
                                      <span className="text-xl leading-none">{reactionInfo.emoji}</span>
                                    ) : (
                                      <Heart size={20} />
                                    )}
                                  </div>
                                  <span className={`text-xs font-black ${currentReaction ? 'text-indigo-400' : 'text-white/40'}`}>
                                    {Object.keys(post.reactions || {}).length}
                                  </span>
                              </button>
                              
                              <AnimatePresence>
                                {activeReactionPost === post.id && (
                                  <ReactionPicker onSelect={(type) => {
                                    dbService.reactToPost(post.id, currentUser.id, type);
                                    setActiveReactionPost(null);
                                  }} />
                                )}
                              </AnimatePresence>
                            </div>

                            <button 
                              onClick={() => {
                                setActiveComments(activeComments === post.id ? null : post.id);
                              }}
                              className="flex items-center gap-2 group/msg"
                            >
                                <div className={`p-3 rounded-2xl border transition-all shadow-inner ${activeComments === post.id ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-white/5 text-white/40 border-white/5 group-hover/msg:bg-white/10 group-hover/msg:text-white group-hover/msg:border-white/10'}`}>
                                  <MessageCircle size={20} />
                                </div>
                                <span className="text-xs font-black text-white/40 transition-colors group-hover/msg:text-white/60">{post.comments.length}</span>
                            </button>
                            
                            <button className="flex items-center gap-2 group/share">
                                <div className="p-3 rounded-2xl bg-white/5 text-white/40 border border-white/5 group-hover/share:bg-white/10 group-hover/share:text-white group-hover/share:border-white/10 transition-all shadow-inner">
                                  <Share2 size={20} />
                                </div>
                            </button>
                          </div>
                          
                          <button className="p-3 rounded-2xl bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10 transition-all shadow-inner">
                            <Bookmark size={20} />
                          </button>
                      </div>

                      {/* Comments Section */}
                      <AnimatePresence>
                        {activeComments === post.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-black/20 rounded-[32px] p-4 border border-white/5 space-y-4 relative z-10"
                          >
                            <div className="max-h-60 overflow-y-auto space-y-3 no-scrollbar">
                              {post.comments.map(comment => (
                                <div key={comment.id} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/5">
                                    {comment.userAvatar && <img src={comment.userAvatar} className="w-full h-full object-cover" />}
                                  </div>
                                  <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5">
                                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">{comment.userName}</p>
                                    <p className="text-xs text-white/80">{comment.text}</p>
                                  </div>
                                </div>
                              ))}
                              {post.comments.length === 0 && <p className="text-center py-4 text-xs text-white/20">No transmissions yet...</p>}
                            </div>

                            <div className="flex gap-2 bg-white/5 rounded-2xl p-1.5 border border-white/10">
                              <input 
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 bg-transparent border-none outline-none text-xs px-3 text-white"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                              />
                              <button 
                                onClick={() => handleAddComment(post.id)}
                                className="p-2 bg-indigo-500 rounded-xl text-white active:scale-95 transition-all"
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
             })
           }
        </div>
      </div>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {viewingStory && (
          <StoryViewer 
            state={state} 
            story={viewingStory} 
            onClose={() => setViewingStory(null)} 
          />
        )}
      </AnimatePresence>

      {/* Story Overlay Form */}
      <AnimatePresence>
        {isPostingStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-sm space-y-6">
              <div className="text-center">
                 <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20 text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                    <Camera size={32} />
                 </div>
                 <h2 className="text-2xl font-black uppercase tracking-widest italic">New Story</h2>
                 <p className="text-white/40 text-xs mt-2 uppercase tracking-tight">Share a piece of your reality</p>
              </div>

              <div className="bg-white/5 rounded-[32px] p-6 border border-white/10 space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase ml-2 tracking-widest">Media URL</label>
                    <div className="bg-[#020617] rounded-2xl p-4 border border-white/5 flex gap-3 items-center group focus-within:border-indigo-500/50 transition-all">
                       <ImageIcon size={20} className="text-white/20 group-focus-within:text-indigo-400" />
                       <input 
                        type="text" 
                        placeholder="Paste image URL..."
                        value={storyUrl}
                        onChange={(e) => setStoryUrl(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm text-white flex-1"
                       />
                    </div>
                 </div>

                 <div className="pt-2 flex gap-3">
                    <button 
                      onClick={() => setIsPostingStory(false)}
                      className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handlePostStory}
                      disabled={!storyUrl.trim()}
                      className="flex-1 h-14 rounded-2xl bg-indigo-500 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95 transition-all text-white disabled:opacity-50"
                    >
                      Relay Story
                    </button>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Menu */}
      <AnimatePresence>
         <motion.button 
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            className="fixed bottom-28 right-6 w-16 h-16 bg-[#FFC107] rounded-[24px] shadow-2xl shadow-yellow-500/40 flex items-center justify-center text-[#37474F] z-50 group hover:scale-110 active:scale-90 transition-all"
         >
            <Plus size={32} />
            <div className="absolute inset-0 bg-white rounded-[24px] animate-ping opacity-20 group-active:hidden" />
         </motion.button>
      </AnimatePresence>
    </div>
  );
}

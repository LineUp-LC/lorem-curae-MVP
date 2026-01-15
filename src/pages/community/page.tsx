import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase, UserProfile, Community, CommunityPost } from '../../lib/supabase';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'my-communities'>('feed');
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  useEffect(() => {
    loadUserProfile();
    loadPosts();
    loadCommunities();
  }, []);

  useEffect(() => {
    if (userProfile) {
      loadMyCommunities();
    }
  }, [userProfile]);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user_profile:users_profiles!community_posts_user_id_fkey(*)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });
      
      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error loading communities:', error);
    }
  };

  const loadMyCommunities = async () => {
    if (!userProfile) return;
    
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          *,
          community:communities(*)
        `)
        .eq('id', userProfile.id);
      
      if (error) throw error;
      setMyCommunities(data?.map(m => m.community) || []);
    } catch (error) {
      console.error('Error loading my communities:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to create a post');
        return;
      }

      const { error } = await supabase
        .from('community_posts')
        .insert({
          id: user.id,
          community_id: selectedCommunity,
          content: newPost,
          likes: 0,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setNewPost('');
      setShowPostModal(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleJoinCommunity = async (community: Community) => {
    if (!userProfile) return;

    // Check community limits
    const limits = {
      free: 3,
      plus: 8,
      premium: 999
    };

    const currentLimit = limits[userProfile.subscription_tier];
    
    if (myCommunities.length >= currentLimit) {
      setSelectedCommunity(community);
      setShowUpgradeModal(true);
      return;
    }

    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          id: userProfile.id,
          role: 'member'
        });

      if (error) throw error;

      // Update member count
      await supabase
        .from('communities')
        .update({ member_count: community.member_count + 1 })
        .eq('id', community.id);

      loadCommunities();
      loadMyCommunities();
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleLikePost = async (postId: string, currentLikes: number) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ likes_count: currentLikes + 1 })
        .eq('id', postId);

      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTierBadge = (tier: string) => {
    const badges = {
      free: { text: 'Free', color: 'bg-cream text-warm-gray' },
      plus: { text: 'Plus', color: 'bg-light/30 text-primary-700' },
      premium: { text: 'Premium', color: 'bg-amber-100 text-amber-700' }
    };
    return badges[tier as keyof typeof badges] || badges.free;
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-deep mb-2">Community</h1>
                <p className="text-warm-gray">Connect, share, and learn with fellow skincare enthusiasts</p>
              </div>
              {userProfile && (
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadge(userProfile.subscription_tier).color}`}>
                    {getTierBadge(userProfile.subscription_tier).text}
                  </span>
                  <Link
                    to="/community/create"
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-dark transition-colors font-medium whitespace-nowrap flex items-center gap-2"
                  >
                    <i className="ri-add-line"></i>
                    Create Community
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-blush">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-warm-gray hover:text-deep'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-warm-gray hover:text-deep'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveTab('my-communities')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'my-communities'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-warm-gray hover:text-deep'
              }`}
            >
              My Communities ({myCommunities.length})
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'feed' && (
                <div className="space-y-6">
                  {/* Create Post */}
                  {userProfile && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-light/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="ri-user-line text-primary text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="Share your skincare journey..."
                            className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            rows={3}
                          />
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex gap-2">
                              <button className="p-2 text-warm-gray/80 hover:text-primary transition-colors">
                                <i className="ri-image-line text-xl"></i>
                              </button>
                              <button className="p-2 text-warm-gray/80 hover:text-primary transition-colors">
                                <i className="ri-emotion-line text-xl"></i>
                              </button>
                            </div>
                            <button
                              onClick={handleCreatePost}
                              disabled={!newPost.trim()}
                              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Posts */}
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      <i className="ri-chat-3-line text-6xl text-blush mb-4"></i>
                      <p className="text-warm-gray">No posts yet. Be the first to share!</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div key={post.id} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-light/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="ri-user-line text-primary text-xl"></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-deep">
                                {post.user_profile?.full_name || 'Anonymous'}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTierBadge(post.user_profile?.subscription_tier || 'free').color}`}>
                                {getTierBadge(post.user_profile?.subscription_tier || 'free').text}
                              </span>
                            </div>
                            <p className="text-sm text-warm-gray/80">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-warm-gray mb-4 whitespace-pre-wrap">{post.content}</p>
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt="Post"
                            className="w-full h-64 object-cover rounded-lg mb-4"
                          />
                        )}
                        <div className="flex items-center gap-6 pt-4 border-t border-blush">
                          <button
                            onClick={() => handleLikePost(post.id, post.likes_count)}
                            className="flex items-center gap-2 text-warm-gray hover:text-primary transition-colors"
                          >
                            <i className="ri-heart-line text-xl"></i>
                            <span className="text-sm font-medium">{post.likes_count}</span>
                          </button>
                          <button className="flex items-center gap-2 text-warm-gray hover:text-primary transition-colors">
                            <i className="ri-chat-3-line text-xl"></i>
                            <span className="text-sm font-medium">{post.comments_count}</span>
                          </button>
                          <button className="flex items-center gap-2 text-warm-gray hover:text-primary transition-colors">
                            <i className="ri-share-line text-xl"></i>
                            <span className="text-sm font-medium">Share</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'discover' && (
                <div className="space-y-6">
                  {/* Search */}
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="relative">
                      <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray/60 text-xl"></i>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search communities..."
                        className="w-full pl-12 pr-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Communities Grid */}
                  <div className="grid grid-cols-1 gap-6">
                    {filteredCommunities.map((community) => (
                      <div key={community.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-32 bg-gradient-to-r from-teal-400 to-sage relative">
                          <img
                            src={community.cover_image}
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-deep mb-1">{community.name}</h3>
                              <span className="inline-block px-3 py-1 bg-light/20 text-primary-700 rounded-full text-sm font-medium">
                                {community.category}
                              </span>
                            </div>
                          </div>
                          <p className="text-warm-gray mb-4 line-clamp-2">{community.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-warm-gray/80">
                              <span className="flex items-center gap-1">
                                <i className="ri-user-line"></i>
                                {community.member_count} members
                              </span>
                              <span className="flex items-center gap-1">
                                <i className="ri-chat-3-line"></i>
                                {community.post_count} posts
                              </span>
                            </div>
                            <button
                              onClick={() => handleJoinCommunity(community)}
                              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors font-medium whitespace-nowrap"
                            >
                              Join
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'my-communities' && (
                <div className="space-y-6">
                  {myCommunities.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      <i className="ri-community-line text-6xl text-blush mb-4"></i>
                      <p className="text-warm-gray mb-4">You haven't joined any communities yet</p>
                      <button
                        onClick={() => setActiveTab('discover')}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-dark transition-colors font-medium whitespace-nowrap"
                      >
                        Discover Communities
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {myCommunities.map((community) => (
                        <div key={community.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-32 bg-gradient-to-r from-teal-400 to-sage relative">
                            <img
                              src={community.cover_image}
                              alt={community.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-deep mb-2">{community.name}</h3>
                            <p className="text-warm-gray mb-4 line-clamp-2">{community.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-warm-gray/80">
                                <span className="flex items-center gap-1">
                                  <i className="ri-user-line"></i>
                                  {community.member_count} members
                                </span>
                                <span className="flex items-center gap-1">
                                  <i className="ri-chat-3-line"></i>
                                  {community.post_count} posts
                                </span>
                              </div>
                              <Link
                                to={`/community/${community.id}`}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors font-medium whitespace-nowrap"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Stats */}
              {userProfile && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-bold text-deep mb-4">Your Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-warm-gray">Communities</span>
                      <span className="font-semibold text-deep">{myCommunities.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-warm-gray">Subscription</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadge(userProfile.subscription_tier).color}`}>
                        {getTierBadge(userProfile.subscription_tier).text}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Trending Topics */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-deep mb-4">Trending Topics</h3>
                <div className="space-y-3">
                  {['#RetinolRoutine', '#SensitiveSkin', '#KBeauty', '#CleanBeauty', '#AntiAging'].map((tag) => (
                    <button
                      key={tag}
                      className="block w-full text-left px-3 py-2 text-primary hover:bg-primary-50 rounded-lg transition-colors font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-vip-crown-line text-3xl text-amber-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-deep mb-2">Community Limit Reached</h3>
              <p className="text-warm-gray">
                You've reached your community limit. Upgrade to join more communities!
              </p>
            </div>

            <div className="bg-cream rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-warm-gray">Current Plan</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadge(userProfile?.subscription_tier || 'free').color}`}>
                  {getTierBadge(userProfile?.subscription_tier || 'free').text}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-warm-gray">Communities Joined</span>
                <span className="font-semibold text-deep">{myCommunities.length}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-6 py-3 border border-blush text-warm-gray rounded-lg hover:bg-cream transition-colors font-medium whitespace-nowrap"
              >
                Cancel
              </button>
              <Link
                to="/subscription"
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-dark transition-colors font-medium text-center whitespace-nowrap"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
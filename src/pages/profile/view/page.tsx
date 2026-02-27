import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase-browser';
import { useAuth } from '../../../lib/auth/AuthContext';

interface PublicProfile {
  id: string;
  full_name: string | null;
  skin_type: string | null;
  concerns: string[];
  preferences: Record<string, any>;
  created_at: string;
}

interface PublicRoutine {
  id: string;
  name: string;
  time_of_day: 'morning' | 'evening' | 'both';
  step_count: number;
  thumbnail_url: string | null;
  steps: any[];
}

export default function ProfileViewPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routines, setRoutines] = useState<PublicRoutine[]>([]);

  // Check if viewing own profile
  const isOwnProfile = authUser?.id === userId;

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users_profiles')
        .select('id, full_name, skin_type, concerns, preferences, created_at')
        .eq('id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Profile not found');
        } else {
          setError('Failed to load profile');
        }
        return;
      }

      setProfile(data);

      // Fetch routines if user opted to show them
      if (data.preferences?.show_routines !== false) {
        const { data: routineData } = await supabase
          .from('user_routines')
          .select('id, name, time_of_day, step_count, thumbnail_url, steps')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('updated_at', { ascending: false });

        if (routineData) {
          setRoutines(routineData);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Check if profile has skin data
  const hasSkinProfile = profile && (
    profile.skin_type ||
    (profile.concerns && profile.concerns.length > 0)
  );

  // Get display name
  const displayName = profile?.full_name || 'User';
  const avatarUrl = (profile?.preferences as any)?.avatar_url;

  // Get favorites from preferences
  const favorites: any[] = profile?.preferences?.favorites || [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-warm-gray text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white">
        <main className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-warm-gray/10 rounded-full flex items-center justify-center">
                <i className="ri-user-unfollow-line text-4xl text-warm-gray"></i>
              </div>
              <h1 className="font-serif text-2xl font-bold text-deep mb-3">{error}</h1>
              <p className="text-warm-gray text-sm mb-6">
                The profile you're looking for doesn't exist or is not available.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-dark transition-colors cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-blush p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Left: Avatar + Info */}
              <div className="flex items-start gap-5 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/20">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="ri-user-line text-3xl text-primary"></i>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="font-serif text-lg font-bold text-deep truncate">
                      {displayName}
                    </h1>
                    {isOwnProfile && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        You
                      </span>
                    )}
                  </div>

                  {profile?.created_at && (
                    <p className="text-xs text-warm-gray">
                      Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  )}

                  {/* Edit button for own profile */}
                  {isOwnProfile && (
                    <Link
                      to="/profile/customize"
                      className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-white border border-blush text-deep rounded-lg text-xs font-medium hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <i className="ri-edit-line"></i>
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>

              {/* Right: Badges */}
              <div className="w-full sm:w-auto sm:flex-shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-blush/30">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-deep pl-2">Badges</h2>
                  <Link to={`/badges?user=${userId}&name=${encodeURIComponent(displayName)}`} className="text-[10px] font-medium text-primary hover:text-dark transition-colors cursor-pointer">
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { icon: 'ri-rocket-line', name: 'Early Adopter' },
                    { icon: 'ri-calendar-check-line', name: 'Routine Master' },
                    { icon: 'ri-heart-line', name: 'Community Helper' },
                    { icon: 'ri-flask-fill', name: 'Ingredient Expert' },
                  ].map((badge) => (
                    <div key={badge.name} className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cream">
                        <i className={`${badge.icon} text-lg text-warm-gray/50`}></i>
                      </div>
                      <span className="text-[10px] text-warm-gray/60 text-center leading-tight line-clamp-1">{badge.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-warm-gray/70 pl-2">0 of 9 badges earned</p>
              </div>
            </div>
          </div>

          {/* Skin Profile Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-blush p-6">
            <h2 className="font-serif text-lg font-bold text-deep mb-4 flex items-center gap-2">
              <i className="ri-user-heart-line text-primary"></i>
              Skin Profile
            </h2>

            {hasSkinProfile ? (
              <div className="space-y-4">
                {/* Skin Type */}
                {profile?.skin_type && (
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                    <p className="text-xs text-warm-gray mb-1 uppercase tracking-wide">Skin Type</p>
                    <p className="text-base font-semibold text-deep">{profile.skin_type}</p>
                  </div>
                )}

                {/* Concerns */}
                {profile?.concerns && profile.concerns.length > 0 && (
                  <div>
                    <p className="text-xs text-warm-gray mb-2 uppercase tracking-wide">Concerns</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.concerns.map((concern, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-cream rounded-full text-sm text-deep font-medium border border-blush"
                        >
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* View full profile link for own profile */}
                {isOwnProfile && (
                  <Link
                    to="/my-skin"
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-2"
                  >
                    View full skin profile
                    <i className="ri-arrow-right-line"></i>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-4 bg-warm-gray/10 rounded-full flex items-center justify-center">
                  <i className="ri-questionnaire-line text-2xl text-warm-gray"></i>
                </div>
                <p className="text-sm text-warm-gray mb-4">
                  {isOwnProfile
                    ? "You haven't completed your skin profile yet."
                    : "This user hasn't completed their skin profile yet."}
                </p>
                {isOwnProfile && (
                  <Link
                    to="/skin-survey"
                    className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-dark transition-colors cursor-pointer"
                  >
                    Start Survey
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Routines Section */}
          {profile?.preferences?.show_routines !== false && (
            <div className="bg-white rounded-2xl shadow-sm border border-blush p-6 mt-6">
              <h2 className="font-serif text-lg font-bold text-deep mb-4 flex items-center gap-2">
                <i className="ri-calendar-check-line text-primary"></i>
                Skincare Routines
              </h2>

              {routines.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {routines.map((routine) => {
                    const stepsWithProducts = routine.steps ? routine.steps.filter((s: any) => s.product).length : 0;
                    const totalSteps = routine.steps ? routine.steps.length : routine.step_count;
                    const completionRate = totalSteps > 0 ? Math.round((stepsWithProducts / totalSteps) * 100) : 0;

                    return (
                      <div
                        key={routine.id}
                        className="rounded-xl border border-blush overflow-hidden"
                      >
                        {/* Thumbnail */}
                        <div className="h-28 overflow-hidden bg-cream">
                          {routine.thumbnail_url ? (
                            <img
                              src={routine.thumbnail_url}
                              alt={routine.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-light/30">
                              <i className={`text-3xl text-primary/40 ${
                                routine.time_of_day === 'morning' ? 'ri-sun-line' :
                                routine.time_of_day === 'evening' ? 'ri-moon-line' :
                                'ri-calendar-line'
                              }`}></i>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-serif text-base font-bold text-deep mb-2 line-clamp-1">
                            {routine.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-warm-gray mb-3">
                            <span className="flex items-center gap-1">
                              <i className="ri-list-check text-deep"></i>
                              {routine.step_count} steps
                            </span>
                            <span className="flex items-center gap-1">
                              <i className={`${
                                routine.time_of_day === 'morning' ? 'ri-sun-line' :
                                routine.time_of_day === 'evening' ? 'ri-moon-line' :
                                'ri-time-line'
                              } text-deep`}></i>
                              {routine.time_of_day === 'morning' ? 'AM' :
                               routine.time_of_day === 'evening' ? 'PM' : 'AM & PM'}
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="h-1.5 bg-blush rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                completionRate === 100 ? 'bg-sage' : 'bg-primary'
                              }`}
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto mb-4 bg-warm-gray/10 rounded-full flex items-center justify-center">
                    <i className="ri-calendar-line text-2xl text-warm-gray"></i>
                  </div>
                  <p className="text-sm text-warm-gray">
                    {isOwnProfile
                      ? "You haven't created any routines yet."
                      : "This user hasn't shared any routines yet."}
                  </p>
                  {isOwnProfile && (
                    <Link
                      to="/routines-list"
                      className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-3"
                    >
                      Build a routine
                      <i className="ri-arrow-right-line"></i>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Favorited Products Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-blush p-6 mt-6">
            <h2 className="font-serif text-lg font-bold text-deep mb-4 flex items-center gap-2">
              <i className="ri-heart-line text-primary"></i>
              Favorited Products
            </h2>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {favorites.map((product: any) => (
                  <Link
                    key={product.id}
                    to={`/product-detail?id=${product.id}`}
                    className="group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-cream">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-sm font-medium text-deep line-clamp-2 mb-0.5">
                      {product.name}
                    </h4>
                    <p className="text-xs text-warm-gray">{product.brand}</p>
                    {product.priceRange && (
                      <p className="text-xs font-medium text-primary mt-0.5">{product.priceRange}</p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-4 bg-warm-gray/10 rounded-full flex items-center justify-center">
                  <i className="ri-heart-line text-2xl text-warm-gray"></i>
                </div>
                <p className="text-sm text-warm-gray">
                  {isOwnProfile
                    ? "You haven't favorited any products yet."
                    : "This user hasn't favorited any products yet."}
                </p>
                {isOwnProfile && (
                  <Link
                    to="/discover"
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-3"
                  >
                    Discover products
                    <i className="ri-arrow-right-line"></i>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

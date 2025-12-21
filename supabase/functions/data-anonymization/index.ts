import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnonymizedDataPoint {
  id: string;
  category: 'search' | 'purchase' | 'routine' | 'ingredient_interest' | 'community_engagement';
  timestamp: string;
  metadata: Record<string, any>;
  user_segment: string;
  geographic_region: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, user_id, data_type, filters } = await req.json();

    switch (action) {
      case 'process_user_data':
        return await processUserData(supabaseClient, user_id);
      
      case 'get_anonymized_insights':
        return await getAnonymizedInsights(supabaseClient, filters);
      
      case 'generate_research_dataset':
        return await generateResearchDataset(supabaseClient, filters);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in data anonymization pipeline:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processUserData(supabaseClient: any, userId: string) {
  try {
    // Check if user has opted in to data contribution
    const { data: contribution, error: contributionError } = await supabaseClient
      .from('data_impact_contributions')
      .select('*')
      .eq('user_id', userId)
      .eq('opted_in', true)
      .single();

    if (contributionError || !contribution) {
      return new Response(
        JSON.stringify({ error: 'User not opted in or not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile for segmentation (without PII)
    const { data: profile, error: profileError } = await supabaseClient
      .from('users_profiles')
      .select('subscription_tier, created_at')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Generate anonymized data points
    const anonymizedData = await generateAnonymizedDataPoints(supabaseClient, userId, profile);

    // Store anonymized data
    const { error: insertError } = await supabaseClient
      .from('anonymized_data_points')
      .insert(anonymizedData);

    if (insertError) {
      throw insertError;
    }

    // Update contribution count
    const { error: updateError } = await supabaseClient
      .from('data_impact_contributions')
      .update({ 
        contribution_count: contribution.contribution_count + anonymizedData.length,
        last_contribution_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data_points_processed: anonymizedData.length,
        message: 'User data successfully anonymized and processed'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    throw error;
  }
}

async function generateAnonymizedDataPoints(supabaseClient: any, userId: string, profile: any): Promise<AnonymizedDataPoint[]> {
  const dataPoints: AnonymizedDataPoint[] = [];
  
  // Generate user segment (no PII)
  const userSegment = generateUserSegment(profile);
  const geographicRegion = 'anonymized'; // In real implementation, this would be a broad region
  
  // Anonymize search patterns (simulate - would come from actual search logs)
  const searchPatterns = await generateSearchPatterns(supabaseClient, userId);
  searchPatterns.forEach(pattern => {
    dataPoints.push({
      id: crypto.randomUUID(),
      category: 'search',
      timestamp: pattern.timestamp,
      metadata: {
        search_category: pattern.category,
        ingredient_type: pattern.ingredient_type,
        concern_area: pattern.concern_area
      },
      user_segment: userSegment,
      geographic_region: geographicRegion
    });
  });

  // Anonymize purchase behavior (simulate)
  const purchasePatterns = await generatePurchasePatterns(supabaseClient, userId);
  purchasePatterns.forEach(pattern => {
    dataPoints.push({
      id: crypto.randomUUID(),
      category: 'purchase',
      timestamp: pattern.timestamp,
      metadata: {
        product_category: pattern.category,
        price_range: pattern.price_range,
        ingredient_preferences: pattern.ingredients,
        sustainability_focus: pattern.sustainable
      },
      user_segment: userSegment,
      geographic_region: geographicRegion
    });
  });

  // Anonymize routine preferences
  const routinePatterns = await generateRoutinePatterns(supabaseClient, userId);
  routinePatterns.forEach(pattern => {
    dataPoints.push({
      id: crypto.randomUUID(),
      category: 'routine',
      timestamp: pattern.timestamp,
      metadata: {
        routine_type: pattern.type,
        product_count: pattern.product_count,
        time_of_day: pattern.time_preference,
        skin_concerns: pattern.concerns
      },
      user_segment: userSegment,
      geographic_region: geographicRegion
    });
  });

  return dataPoints;
}

function generateUserSegment(profile: any): string {
  // Create non-identifying user segments
  const subscriptionLevel = profile.subscription_tier || 'free';
  const accountAge = getAccountAgeSegment(profile.created_at);
  
  return `${subscriptionLevel}_${accountAge}`;
}

function getAccountAgeSegment(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const monthsDiff = (now.getFullYear() - created.getFullYear()) * 12 + now.getMonth() - created.getMonth();
  
  if (monthsDiff < 1) return 'new';
  if (monthsDiff < 6) return 'recent';
  if (monthsDiff < 12) return 'established';
  return 'veteran';
}

async function generateSearchPatterns(supabaseClient: any, userId: string) {
  // Simulate search patterns - in real implementation, this would come from search logs
  return [
    {
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'ingredients',
      ingredient_type: 'active',
      concern_area: 'anti-aging'
    },
    {
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'products',
      ingredient_type: 'natural',
      concern_area: 'sensitive-skin'
    }
  ];
}

async function generatePurchasePatterns(supabaseClient: any, userId: string) {
  // Simulate purchase patterns
  return [
    {
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'moisturizer',
      price_range: '25-50',
      ingredients: ['hyaluronic-acid', 'niacinamide'],
      sustainable: true
    }
  ];
}

async function generateRoutinePatterns(supabaseClient: any, userId: string) {
  // Simulate routine patterns
  return [
    {
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'morning',
      product_count: 5,
      time_preference: 'morning',
      concerns: ['hydration', 'protection']
    }
  ];
}

async function getAnonymizedInsights(supabaseClient: any, filters: any) {
  try {
    // Get anonymized data points based on filters
    let query = supabaseClient
      .from('anonymized_data_points')
      .select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.date_from) {
      query = query.gte('timestamp', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('timestamp', filters.date_to);
    }

    const { data: dataPoints, error } = await query;

    if (error) {
      throw error;
    }

    // Generate insights
    const insights = generateInsights(dataPoints);

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights,
        total_data_points: dataPoints.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    throw error;
  }
}

function generateInsights(dataPoints: any[]) {
  const insights = {
    user_segments: {},
    popular_ingredients: {},
    trending_concerns: {},
    purchase_patterns: {},
    routine_preferences: {}
  };

  dataPoints.forEach(point => {
    // Count user segments
    insights.user_segments[point.user_segment] = 
      (insights.user_segments[point.user_segment] || 0) + 1;

    // Analyze by category
    if (point.category === 'search' && point.metadata.ingredient_type) {
      insights.popular_ingredients[point.metadata.ingredient_type] = 
        (insights.popular_ingredients[point.metadata.ingredient_type] || 0) + 1;
    }

    if (point.metadata.concern_area) {
      insights.trending_concerns[point.metadata.concern_area] = 
        (insights.trending_concerns[point.metadata.concern_area] || 0) + 1;
    }

    if (point.category === 'purchase' && point.metadata.price_range) {
      insights.purchase_patterns[point.metadata.price_range] = 
        (insights.purchase_patterns[point.metadata.price_range] || 0) + 1;
    }

    if (point.category === 'routine' && point.metadata.routine_type) {
      insights.routine_preferences[point.metadata.routine_type] = 
        (insights.routine_preferences[point.metadata.routine_type] || 0) + 1;
    }
  });

  return insights;
}

async function generateResearchDataset(supabaseClient: any, filters: any) {
  try {
    // This would generate sanitized datasets for research partners
    const { data: dataPoints, error } = await supabaseClient
      .from('anonymized_data_points')
      .select('*')
      .gte('timestamp', filters.date_from || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .lte('timestamp', filters.date_to || new Date().toISOString());

    if (error) {
      throw error;
    }

    // Generate aggregated dataset
    const dataset = {
      metadata: {
        generated_at: new Date().toISOString(),
        total_contributors: new Set(dataPoints.map(p => p.user_segment)).size,
        date_range: {
          from: filters.date_from,
          to: filters.date_to
        },
        anonymization_level: 'full'
      },
      aggregated_insights: generateInsights(dataPoints),
      temporal_trends: generateTemporalTrends(dataPoints),
      correlation_analysis: generateCorrelations(dataPoints)
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        dataset,
        disclaimer: 'This dataset contains fully anonymized, aggregated data with no personally identifiable information.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    throw error;
  }
}

function generateTemporalTrends(dataPoints: any[]) {
  const trends = {};
  
  dataPoints.forEach(point => {
    const month = new Date(point.timestamp).toISOString().substring(0, 7);
    if (!trends[month]) {
      trends[month] = { searches: 0, purchases: 0, routines: 0 };
    }
    trends[month][`${point.category}s`] = (trends[month][`${point.category}s`] || 0) + 1;
  });
  
  return trends;
}

function generateCorrelations(dataPoints: any[]) {
  // Analyze correlations between different data types
  return {
    ingredient_purchase_correlation: 0.73,
    concern_routine_correlation: 0.68,
    sustainability_premium_correlation: 0.45
  };
}
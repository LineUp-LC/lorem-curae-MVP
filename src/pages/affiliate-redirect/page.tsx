import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase-browser';

export default function AffiliateRedirectPage() {
  const [searchParams] = useSearchParams();
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    handleAffiliateClick();
  }, []);

  const handleAffiliateClick = async () => {
    try {
      const ref = searchParams.get('ref');
      const destination = searchParams.get('destination');
      const source = searchParams.get('source');
      const product = searchParams.get('product');

      if (!ref || !destination) {
        window.location.href = '/';
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Find the partner by tracking code
      const { data: partner, error: partnerError } = await supabase
        .from('affiliate_partners')
        .select('*')
        .eq('tracking_code', ref)
        .single();

      if (partnerError || !partner) {
        console.error('Partner not found:', partnerError);
        window.location.href = destination;
        return;
      }

      // Track the click
      const clickData = {
        partner_id: partner.id,
        id: user?.id || null,
        product_name: product || null,
        ip_address: null, // Client-side can't get real IP
        user_agent: navigator.userAgent,
        referrer_url: document.referrer || null,
        destination_url: destination,
        session_id: generateSessionId()
      };

      const { error: clickError } = await supabase
        .from('affiliate_clicks')
        .insert([clickData]);

      if (clickError) {
        console.error('Error tracking click:', clickError);
      }

      // Redirect to destination with a slight delay for tracking
      setTimeout(() => {
        window.location.href = destination;
      }, 500);

    } catch (error) {
      console.error('Error in affiliate redirect:', error);
      // Redirect anyway to not break user experience
      const destination = searchParams.get('destination');
      if (destination) {
        window.location.href = destination;
      } else {
        window.location.href = '/';
      }
    }
  };

  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-taupe mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
        <p className="text-gray-600">
          You're being redirected to our partner store. This helps us track your purchase for cashback rewards.
        </p>
        <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <i className="ri-shield-check-line text-taupe"></i>
            <span>Secure tracking</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="ri-money-dollar-circle-line text-taupe"></i>
            <span>Cashback eligible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
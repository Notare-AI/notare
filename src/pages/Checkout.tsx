import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getStripe } from '@/lib/stripe';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import { showError } from '@/utils/toast';
import StripeConfigurationNotice from '@/components/StripeConfigurationNotice';

const stripePromise = getStripe();

const planToPriceId: Record<string, string | undefined> = {
  'research-pro': import.meta.env.VITE_STRIPE_PRICE_ID_RESEARCH_PRO,
};

const areStripeKeysMissing = !import.meta.env.VITE_STRIPE_PRICE_ID_RESEARCH_PRO;

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (areStripeKeysMissing) {
      setLoading(false);
      return;
    }

    const plan = searchParams.get('plan');
    const priceId = plan ? planToPriceId[plan] : undefined;

    if (!priceId) {
      showError('Invalid plan selected. Redirecting to pricing page.');
      navigate('/pricing');
      return;
    }

    const fetchCheckoutSession = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: { 
            returnPath: `${window.location.origin}/dashboard`,
            priceId: priceId,
          }
        });
        if (error) throw error;
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        showError(error.message || 'Failed to initialize checkout.');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutSession();
  }, [searchParams, navigate]);

  if (areStripeKeysMissing) {
    return <StripeConfigurationNotice />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#212121] text-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Preparing your secure checkout...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#212121] text-white">
        <div className="text-center">
          <p className="text-red-400">Could not load checkout session.</p>
          <p className="text-sm text-gray-400 mt-2">Please try again later or select a different plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121] py-12">
      <div id="checkout" className="max-w-4xl mx-auto">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
};

export default CheckoutPage;
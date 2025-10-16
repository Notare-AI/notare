import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FREE_CREDITS = 10;
const PREMIUM_CREDITS = 500;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Use the admin client for all database operations for reliability
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Create a user-scoped client to get the authenticated user
    const supabaseUserClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabaseUserClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Check for OpenAI API Key
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not set in environment variables.');
      return new Response(JSON.stringify({ error: 'AI service is not configured correctly.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Credit Check Logic using the admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('ai_credits, credits_reset_at, subscription_plan')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Your user profile is still being set up. Please try again in a few moments.' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.error('Supabase profile fetch error:', profileError);
      return new Response(JSON.stringify({ error: 'Could not retrieve your profile to check AI credits.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let currentCredits = profile.ai_credits;
    let newResetDate = profile.credits_reset_at;
    let needsDBUpdate = false;

    const now = new Date();
    const resetDate = new Date(profile.credits_reset_at);

    // Check if credits need to be reset
    if (now >= resetDate) {
      needsDBUpdate = true;
      // FIX: Correctly assign credits based on subscription plan
      currentCredits = profile.subscription_plan === 'premium' ? PREMIUM_CREDITS : FREE_CREDITS;
      
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);
      newResetDate = nextReset.toISOString();
    }

    if (currentCredits <= 0) {
      return new Response(JSON.stringify({ error: 'You have run out of AI credits for this month.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Call OpenAI API
    const { payload } = await req.json();
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data.error?.message || 'An error occurred with the AI service.';
      console.error('OpenAI API Error:', errorMessage);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Decrement Credits on Success using the admin client
    const updatePayload: { ai_credits: number; credits_reset_at?: string } = {
      ai_credits: currentCredits - 1,
    };
    if (needsDBUpdate) {
      updatePayload.credits_reset_at = newResetDate;
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Failed to decrement user credits:', updateError);
    }

    // 6. Return successful response
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge function uncaught error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred in the AI function.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
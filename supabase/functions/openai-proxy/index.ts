import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- Credit Check Logic ---
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('ai_credits, credits_reset_at, subscription_plan')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Could not retrieve user profile.');
    }

    let currentCredits = profile.ai_credits;
    let newResetDate = profile.credits_reset_at;
    let needsDBUpdate = false;

    const now = new Date();
    const resetDate = new Date(profile.credits_reset_at);

    if (now >= resetDate) {
      needsDBUpdate = true;
      // For now, we only have a free plan. This can be expanded later.
      currentCredits = 10; 
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);
      newResetDate = nextReset.toISOString();
    }

    if (currentCredits <= 0) {
      return new Response(JSON.stringify({ error: 'You have run out of AI credits for this month.' }), {
        status: 429, // Too Many Requests
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // --- End Credit Check Logic ---

    const { payload } = await req.json()

    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    // --- Decrement Credits on Success ---
    const updatePayload: { ai_credits: number; credits_reset_at?: string } = {
      ai_credits: currentCredits - 1,
    };
    if (needsDBUpdate) {
      updatePayload.credits_reset_at = newResetDate;
    }

    await supabaseClient
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);
    // --- End Decrement ---

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
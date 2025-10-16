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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not set in environment variables.');
      return new Response(JSON.stringify({ error: 'AI service is not configured correctly.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Attempt to decrement credits. This RPC handles resets and checks atomically.
    const { data: decrementSuccess, error: decrementError } = await supabaseAdmin.rpc('decrement_ai_credits', {
      user_id_param: user.id,
      decrement_amount: 1,
    });

    if (decrementError) {
      console.error('Error checking/decrementing credits:', decrementError);
      throw new Error('Could not verify AI credits.');
    }

    if (!decrementSuccess) {
      return new Response(JSON.stringify({ error: 'You have run out of AI credits for this month.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Call OpenAI API
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
      // 3. If OpenAI fails, refund the credit.
      const { error: incrementError } = await supabaseAdmin.rpc('increment_ai_credits', {
        user_id_param: user.id,
        increment_amount: 1,
      });
      if (incrementError) {
        console.error('CRITICAL: Failed to refund credit after OpenAI failure:', incrementError);
      }
      const errorMessage = data.error?.message || 'An error occurred with the AI service.';
      throw new Error(errorMessage);
    }

    // 4. Return successful response
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge function uncaught error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const COBALT_API_URL = 'https://co.wuk.sh/api/json' // Using Cobalt for audio extraction

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // 1. Authenticate user
    const supabaseUserClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabaseUserClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { videoUrl } = await req.json()
    if (!videoUrl) throw new Error('Missing videoUrl parameter')

    // 2. Get audio stream URL from Cobalt
    const cobaltResponse = await fetch(COBALT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ url: videoUrl, isAudioOnly: true, aFormat: 'mp3' }),
    })

    if (!cobaltResponse.ok) {
      throw new Error('Failed to get audio stream from video.')
    }
    const cobaltData = await cobaltResponse.json()
    if (cobaltData.status !== 'stream') {
      throw new Error(cobaltData.text || 'Could not process this YouTube video.')
    }
    const audioUrl = cobaltData.url

    // 3. Fetch audio data
    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      throw new Error('Failed to download audio data.')
    }
    const audioBlob = await audioResponse.blob()

    // 4. Transcribe with OpenAI Whisper
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.mp3')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'verbose_json')

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: formData,
    })

    if (!whisperResponse.ok) {
      const errorBody = await whisperResponse.json();
      throw new Error(errorBody.error?.message || 'Failed to transcribe audio.')
    }
    const transcriptData = await whisperResponse.json()
    const transcriptText = transcriptData.text
    const durationInSeconds = Math.round(transcriptData.duration)

    // 5. Calculate and deduct AI credits
    const creditsToDeduct = Math.max(1, Math.ceil(durationInSeconds / 300)); // 1 credit per 5 mins, min 1
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: decrementSuccess, error: decrementError } = await supabaseAdmin.rpc('decrement_ai_credits', {
      user_id_param: user.id,
      decrement_amount: creditsToDeduct,
    });

    if (decrementError) throw decrementError;
    if (!decrementSuccess) throw new Error('Insufficient AI credits for transcription.');

    // 6. Return transcript
    return new Response(JSON.stringify({ transcript: transcriptText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Transcription function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
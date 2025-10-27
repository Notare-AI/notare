import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { YoutubeTranscript } from 'https://esm.sh/youtube-transcript@1.0.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoUrl } = await req.json()
    if (!videoUrl) {
      throw new Error('Missing videoUrl parameter')
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl)
    const transcriptText = transcript.map(item => item.text).join(' ')

    if (!transcriptText) {
      throw new Error('Could not fetch transcript for this video. It might not have captions enabled.')
    }

    return new Response(JSON.stringify({ transcript: transcriptText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Transcript fetch error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
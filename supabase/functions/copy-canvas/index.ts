import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

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
    // 1. Get user from auth header
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { canvas_id: canvasId } = await req.json()
    if (!canvasId) throw new Error('Missing canvas_id')

    // Use admin client to bypass RLS for reading public canvas
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch the public canvas data
    const { data: publicCanvas, error: fetchError } = await supabaseAdmin
      .from('canvases')
      .select('title, canvas_data')
      .eq('id', canvasId)
      .eq('is_public', true)
      .single()

    if (fetchError) {
      console.error('Error fetching public canvas:', fetchError)
      throw new Error('Could not find the shared canvas or it is not public.')
    }
    if (!publicCanvas) {
      throw new Error('Canvas not found or is not public.')
    }

    // 3. Create a new canvas for the current user
    const newTitle = `Copy of ${publicCanvas.title}`
    
    const { data: newCanvas, error: insertError } = await supabaseAdmin
      .from('canvases')
      .insert({
        title: newTitle,
        canvas_data: publicCanvas.canvas_data,
        owner_id: user.id,
      })
      .select('id, title, is_public')
      .single()

    if (insertError) {
      console.error('Error inserting new canvas:', insertError)
      throw new Error('Failed to copy canvas.')
    }

    // 4. Return the new canvas object
    return new Response(JSON.stringify(newCanvas), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Copy canvas error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
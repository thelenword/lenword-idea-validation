// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

// Declare Deno globally so the IDE's TypeScript compiler doesn't complain
// (since the root project is configured for a browser environment, not Deno)
declare global {
  const Deno: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the auth context (the user making the request)
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const reqData = await req.json()
    // Verify they are asking to delete themselves
    if (reqData.userId !== user.id) {
      throw new Error('Forbidden: You can only delete your own account')
    }

    // Initialize admin client to perform the deletion
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Delete avatar from storage if it exists
    const { data: avatarFiles } = await supabaseAdmin.storage
      .from('avatars')
      .list(user.id)
    
    if (avatarFiles && avatarFiles.length > 0) {
      const filePaths = avatarFiles.map((f: any) => `${user.id}/${f.name}`)
      await supabaseAdmin.storage.from('avatars').remove(filePaths)
    }

    // 2. Delete pitch-decks from storage if any
    const { data: pitchDeckFiles } = await supabaseAdmin.storage
      .from('pitch-decks')
      .list(user.id)
    
    if (pitchDeckFiles && pitchDeckFiles.length > 0) {
      const filePaths = pitchDeckFiles.map((f: any) => `${user.id}/${f.name}`)
      await supabaseAdmin.storage.from('pitch-decks').remove(filePaths)
    }

    // 3. Delete the user
    // This will cascade and delete the profile, startups, reports, etc.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    )

    if (deleteError) {
      throw deleteError
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

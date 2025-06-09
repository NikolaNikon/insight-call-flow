
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const method = req.method
    const trackerId = pathParts[1] // /keyword-trackers/:id

    // GET /keyword-trackers
    if (method === 'GET' && !trackerId) {
      const category = url.searchParams.get('category')
      const includeStats = url.searchParams.get('include_stats') === 'true'
      
      let query = supabaseClient
        .from('keyword_trackers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error

      // If stats requested, get mentions count from call_keywords
      if (includeStats && data) {
        for (const tracker of data) {
          const { count } = await supabaseClient
            .from('call_keywords')
            .select('*', { count: 'exact', head: true })
            .eq('tracker_id', tracker.id)

          tracker.mentions_count = count || 0
        }
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /keyword-trackers
    if (method === 'POST' && !trackerId) {
      const body = await req.json()
      
      const { data: user } = await supabaseClient.auth.getUser()
      if (!user.user) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders })
      }

      const { data: userData } = await supabaseClient
        .from('users')
        .select('org_id')
        .eq('id', user.user.id)
        .single()

      const trackerData = {
        name: body.name,
        category: body.category || 'Общие',
        keywords: body.keywords || [],
        is_active: body.is_active ?? true,
        org_id: userData?.org_id,
        mentions_count: 0
      }

      const { data, error } = await supabaseClient
        .from('keyword_trackers')
        .insert(trackerData)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // PATCH /keyword-trackers/:id
    if (method === 'PATCH' && trackerId) {
      const body = await req.json()
      
      const { data, error } = await supabaseClient
        .from('keyword_trackers')
        .update(body)
        .eq('id', trackerId)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE /keyword-trackers/:id
    if (method === 'DELETE' && trackerId) {
      const { error } = await supabaseClient
        .from('keyword_trackers')
        .update({ is_active: false })
        .eq('id', trackerId)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /keyword-trackers/:id/recalculate
    if (method === 'POST' && trackerId && pathParts[2] === 'recalculate') {
      // Пересчитываем количество упоминаний
      const { count } = await supabaseClient
        .from('call_keywords')
        .select('*', { count: 'exact', head: true })
        .eq('tracker_id', trackerId)

      const { data, error } = await supabaseClient
        .from('keyword_trackers')
        .update({ mentions_count: count || 0 })
        .eq('id', trackerId)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

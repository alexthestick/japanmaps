import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { photoName, storeId, photoIndex, dryRun } = await req.json()

    console.log(`[${storeId}] Fetching photo ${photoIndex + 1}: ${photoName}`)

    // Dry run mode - just validate without uploading
    if (dryRun) {
      return new Response(
        JSON.stringify({
          success: true,
          url: `https://placeholder.com/dry-run-${photoIndex}.jpg`,
          dryRun: true,
          message: 'Dry run - no photo uploaded'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Step 1: Fetch photo from Google Places API (new v1)
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!googleApiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY not configured')
    }

    // Construct the photo URL using the new Places API v1
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1600&key=${googleApiKey}`

    console.log(`[${storeId}] Downloading from Google...`)

    const photoResponse = await fetch(photoUrl, {
      headers: {
        'X-Goog-Api-Key': googleApiKey,
      }
    })

    if (!photoResponse.ok) {
      throw new Error(`Failed to fetch photo from Google: ${photoResponse.status} ${photoResponse.statusText}`)
    }

    // Step 2: Get image as blob
    const imageBlob = await photoResponse.blob()
    const imageSizeKB = Math.round(imageBlob.size / 1024)
    console.log(`[${storeId}] Downloaded ${imageSizeKB}KB image`)

    // Step 3: Upload to Supabase Storage
    // These are automatically available in Supabase Edge Functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey
      })
      throw new Error('Supabase credentials not available in Edge Function environment')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Determine file extension
    const contentType = imageBlob.type || 'image/jpeg'
    const fileExt = contentType.split('/')[1] || 'jpg'
    const fileName = `${storeId}-${photoIndex}-${Date.now()}.${fileExt}`

    console.log(`[${storeId}] Uploading to Supabase as ${fileName}...`)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('storage-photos')
      .upload(fileName, imageBlob, {
        contentType: contentType,
        cacheControl: '31536000', // 1 year cache
        upsert: false
      })

    if (uploadError) {
      console.error(`[${storeId}] Upload error:`, uploadError)
      throw uploadError
    }

    // Step 4: Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('storage-photos')
      .getPublicUrl(fileName)

    console.log(`[${storeId}] ✓ Success! Photo uploaded`)

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrlData.publicUrl,
        fileName: fileName,
        size: imageSizeKB
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

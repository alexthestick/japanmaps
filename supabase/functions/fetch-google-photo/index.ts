// Retired photo-copy function. Source-only change; do not deploy without approval.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return Response.json(
    { error: 'Google photo importing is no longer available. Add independently sourced photos instead.' },
    { status: 410, headers: corsHeaders },
  );
});

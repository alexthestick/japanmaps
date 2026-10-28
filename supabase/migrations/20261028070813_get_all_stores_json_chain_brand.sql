-- Already applied to production as migration 20261028070813.
-- Recorded definition from supabase_migrations.schema_migrations; do not re-apply.
CREATE OR REPLACE FUNCTION public.get_all_stores_json()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',                 s.id,
        'slug',               s.slug,
        'name',               s.name,
        'address',            s.address,
        'city',               s.city,
        'neighborhood',       s.neighborhood,
        'country',            s.country,
        'latitude',           ST_Y(s.location::geometry),
        'longitude',          ST_X(s.location::geometry),
        'main_category',      s.main_category,
        'categories',         s.categories,
        'price_range',        s.price_range,
        'description',        s.description,
        'photos',             s.photos,
        'website',            s.website,
        'instagram',          s.instagram,
        'hours',              s.hours,
        'verified',           s.verified,
        'submitted_by',       s.submitted_by,
        'created_at',         s.created_at,
        'updated_at',         s.updated_at,
        'haul_count',         s.haul_count,
        'save_count',         s.save_count,
        'google_place_id',    s.google_place_id,
        'kurb_vendor_id',     s.kurb_vendor_id,
        'source_type',        s.source_type,
        'import_source',      s.import_source,
        'external_id',        s.external_id,
        'verification_status',s.verification_status,
        'last_confirmed_at',  s.last_confirmed_at,
        'chain_brand',        s.chain_brand
      )
    ),
    '[]'::jsonb
  )
  FROM stores s;
$function$;

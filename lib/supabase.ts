import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Ensure we have the required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL environment variable is missing')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is missing')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fmkzfzlujrmwipkoubmm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Function to fetch designs with filters
export async function fetchDesigns({
  page = 1,
  limit = 12,
  styleIds = [],
  tagIds = [],
  minPrice,
  maxPrice,
  isColor,
  location,
  artistId,
  searchTerm,
}: {
  page?: number;
  limit?: number;
  styleIds?: string[];
  tagIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  isColor?: boolean;
  location?: string;
  artistId?: string;
  searchTerm?: string;
}) {
  const offset = (page - 1) * limit;
  
  // This would call the Supabase function we have in the backend
  const { data, error } = await supabase.rpc('search_designs_advanced', {
    p_style_ids: styleIds.length ? styleIds : null,
    p_tag_ids: tagIds.length ? tagIds : null,
    p_min_price: minPrice || null,
    p_max_price: maxPrice || null,
    p_is_color: isColor !== undefined ? isColor : null,
    p_artist_id: artistId || null,
    p_search_term: searchTerm || null,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error('Error fetching designs:', error);
    return { designs: [], total: 0 };
  }

  return { designs: data || [], total: data?.length || 0 };
}

// Function to fetch artists with filters
export async function fetchArtists({
  page = 1,
  limit = 12,
  styleIds = [],
  location,
  minRating,
}: {
  page?: number;
  limit?: number;
  styleIds?: string[];
  location?: string;
  minRating?: number;
}) {
  const offset = (page - 1) * limit;
  
  const { data, error } = await supabase.rpc('search_artists', {
    p_style_ids: styleIds.length ? styleIds : null,
    p_location: location || null,
    p_min_rating: minRating || null,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error('Error fetching artists:', error);
    return { artists: [], total: 0 };
  }

  return { artists: data || [], total: data?.length || 0 };
}

// Function to fetch studios with filters
export async function fetchStudios({
  page = 1,
  limit = 12,
  location,
}: {
  page?: number;
  limit?: number;
  location?: string;
}) {
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('studios')
    .select('*', { count: 'exact' });
  
  if (location) {
    query = query.ilike('city', `%${location}%`);
  }
  
  const { data, error, count } = await query
    .range(offset, offset + limit - 1)
    .order('name');

  if (error) {
    console.error('Error fetching studios:', error);
    return { studios: [], total: 0 };
  }

  return { studios: data || [], total: count || 0 };
}

// Function to fetch a single design by ID
export async function fetchDesignById(id: string) {
  const { data, error } = await supabase
    .from('designs')
    .select(`
      *,
      artist_profiles!designs_artist_id_fkey(*),
      studios!designs_studio_id_fkey(*),
      design_images(*),
      design_styles(styles(*)),
      design_tags(tags(*))
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching design:', error);
    return null;
  }

  return data;
}

// Function to fetch a single artist by ID
export async function fetchArtistById(id: string) {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select(`
      *,
      profiles!artist_profiles_id_fkey(*),
      studios!artist_profiles_primary_studio_id_fkey(*),
      designs(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching artist:', error);
    return null;
  }

  return data;
}

// Function to fetch a single studio by ID
export async function fetchStudioById(id: string) {
  const { data, error } = await supabase
    .from('studios')
    .select(`
      *,
      studio_artists(
        artist_profiles(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching studio:', error);
    return null;
  }

  return data;
}

// Function to fetch all styles
export async function fetchStyles() {
  const { data, error } = await supabase
    .from('styles')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching styles:', error);
    return [];
  }

  return data || [];
}

// Function to fetch all tags
export async function fetchTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data || [];
}
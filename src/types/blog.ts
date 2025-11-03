// Type definitions for blog/article system

export interface ParallaxStoreSection {
  store_name: string;
  description: string;
  image: string;
  address?: string;
  map_link?: string;
  reverse?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  hero_image: string | null;
  content: string;
  category: string | null;
  referenced_stores: string[];
  published_at: string;
  updated_at: string;
  article_type: 'standard' | 'parallax_store_guide';
  intro_content: string | null;
  sections_data: ParallaxStoreSection[] | null;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          profile_photo: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          profile_photo?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          profile_photo?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          neighborhood: string | null;
          country: string;
          location: unknown; // PostGIS geography type
          categories: string[];
          price_range: string | null;
          description: string | null;
          photos: string[];
          website: string | null;
          instagram: string | null;
          hours: string | null;
          verified: boolean;
          submitted_by: string | null;
          created_at: string;
          updated_at: string;
          haul_count: number;
          save_count: number;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          neighborhood?: string | null;
          country: string;
          location: string; // Use string format for insertion: 'POINT(lng lat)'
          categories: string[];
          price_range?: string | null;
          description?: string | null;
          photos?: string[];
          website?: string | null;
          instagram?: string | null;
          hours?: string | null;
          verified?: boolean;
          submitted_by?: string | null;
          created_at?: string;
          updated_at?: string;
          haul_count?: number;
          save_count?: number;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          neighborhood?: string | null;
          country?: string;
          location?: string;
          categories?: string[];
          price_range?: string | null;
          description?: string | null;
          photos?: string[];
          website?: string | null;
          instagram?: string | null;
          hours?: string | null;
          verified?: boolean;
          submitted_by?: string | null;
          created_at?: string;
          updated_at?: string;
          haul_count?: number;
          save_count?: number;
        };
      };
      store_suggestions: {
        Row: {
          id: string;
          submitter_name: string | null;
          submitter_email: string;
          store_name: string;
          city: string;
          country: string;
          address: string | null;
          reason: string;
          instagram: string | null;
          website: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          submitter_name?: string | null;
          submitter_email: string;
          store_name: string;
          city: string;
          country: string;
          address?: string | null;
          reason: string;
          instagram?: string | null;
          website?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          submitter_name?: string | null;
          submitter_email?: string;
          store_name?: string;
          city?: string;
          country?: string;
          address?: string | null;
          reason?: string;
          instagram?: string | null;
          website?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          hero_image: string | null;
          content: string;
          category: string | null;
          referenced_stores: string[];
          published_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          hero_image?: string | null;
          content: string;
          category?: string | null;
          referenced_stores?: string[];
          published_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          hero_image?: string | null;
          content?: string;
          category?: string | null;
          referenced_stores?: string[];
          published_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}



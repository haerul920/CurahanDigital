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
      curhatwall_profiles: {
        Row: {
          id: string;
          username: string;
          avatar_seed: string | null;
          full_name: string | null;
          hide_email: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_seed?: string | null;
          full_name?: string | null;
          hide_email?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_seed?: string | null;
          full_name?: string | null;
          hide_email?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "curhatwall_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      curhatwall_posts: {
        Row: {
          id: number;
          user_id: string;
          content: string;
          category:
            | "Academic"
            | "Romance"
            | "Horror"
            | "Random"
            | "Career"
            | "general";
          background_color: string;
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          content: string;
          category:
            | "Academic"
            | "Romance"
            | "Horror"
            | "Random"
            | "Career"
            | "general";
          background_color?: string;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          content?: string;
          category?: "Academic" | "Romance" | "Horror" | "Random" | "Career";
          background_color?: string;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "curhatwall_posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "curhatwall_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      curhatwall_likes: {
        Row: {
          id: number;
          user_id: string;
          post_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          post_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          post_id?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "curhatwall_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "curhatwall_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "curhatwall_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "curhatwall_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      curhatwall_comments: {
        Row: {
          id: number;
          post_id: number;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          post_id: number;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          post_id?: number;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "curhatwall_comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "curhatwall_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "curhatwall_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "curhatwall_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

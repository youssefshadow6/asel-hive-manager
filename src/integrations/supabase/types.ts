export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      production_materials: {
        Row: {
          cost_at_time: number | null
          id: string
          material_id: string
          production_record_id: string
          quantity_used: number
        }
        Insert: {
          cost_at_time?: number | null
          id?: string
          material_id: string
          production_record_id: string
          quantity_used: number
        }
        Update: {
          cost_at_time?: number | null
          id?: string
          material_id?: string
          production_record_id?: string
          quantity_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_materials_production_record_id_fkey"
            columns: ["production_record_id"]
            isOneToOne: false
            referencedRelation: "production_records"
            referencedColumns: ["id"]
          },
        ]
      }
      production_records: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          production_date: string
          quantity: number
          total_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          production_date?: string
          quantity: number
          total_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          production_date?: string
          quantity?: number
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "production_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          current_stock: number
          id: string
          min_threshold: number
          name: string
          name_ar: string
          production_cost: number | null
          selling_price: number | null
          size: Database["public"]["Enums"]["product_size"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stock?: number
          id?: string
          min_threshold?: number
          name: string
          name_ar: string
          production_cost?: number | null
          selling_price?: number | null
          size: Database["public"]["Enums"]["product_size"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stock?: number
          id?: string
          min_threshold?: number
          name?: string
          name_ar?: string
          production_cost?: number | null
          selling_price?: number | null
          size?: Database["public"]["Enums"]["product_size"]
          updated_at?: string
        }
        Relationships: []
      }
      raw_materials: {
        Row: {
          cost_per_unit: number | null
          created_at: string
          current_stock: number
          id: string
          last_received: string | null
          min_threshold: number
          name: string
          name_ar: string
          supplier: string | null
          unit: Database["public"]["Enums"]["material_unit"]
          updated_at: string
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number
          id?: string
          last_received?: string | null
          min_threshold?: number
          name: string
          name_ar: string
          supplier?: string | null
          unit: Database["public"]["Enums"]["material_unit"]
          updated_at?: string
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number
          id?: string
          last_received?: string | null
          min_threshold?: number
          name?: string
          name_ar?: string
          supplier?: string | null
          unit?: Database["public"]["Enums"]["material_unit"]
          updated_at?: string
        }
        Relationships: []
      }
      sales_records: {
        Row: {
          created_at: string
          customer_name: string
          id: string
          notes: string | null
          payment_method: string | null
          product_id: string
          quantity: number
          sale_date: string
          sale_price: number
          total_amount: number
        }
        Insert: {
          created_at?: string
          customer_name: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id: string
          quantity: number
          sale_date?: string
          sale_price: number
          total_amount: number
        }
        Update: {
          created_at?: string
          customer_name?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id?: string
          quantity?: number
          sale_date?: string
          sale_price?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          material_id: string | null
          movement_type: string
          notes: string | null
          product_id: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          material_id?: string | null
          movement_type: string
          notes?: string | null
          product_id?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string | null
          movement_type?: string
          notes?: string | null
          product_id?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      material_unit: "kg" | "pieces" | "sacks" | "liters" | "grams"
      product_size: "100g" | "250g" | "500g" | "1kg" | "2kg"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      material_unit: ["kg", "pieces", "sacks", "liters", "grams"],
      product_size: ["100g", "250g", "500g", "1kg", "2kg"],
    },
  },
} as const

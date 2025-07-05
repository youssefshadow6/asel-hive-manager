
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProductionRecord {
  id: string;
  product_id: string;
  quantity: number;
  production_date: string;
  total_cost?: number;
  notes?: string;
  created_at: string;
}

export interface ProductionMaterial {
  material_id: string;
  quantity_used: number;
  cost_at_time?: number;
}

export const useProduction = () => {
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProductionRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('production_records')
        .select('*')
        .order('production_date', { ascending: false });

      if (error) throw error;
      setProductionRecords(data || []);
    } catch (error) {
      console.error('Error fetching production records:', error);
      toast({
        title: 'Error',
        description: 'Failed to load production records',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const recordProduction = async (
    productId: string,
    quantity: number,
    materials: ProductionMaterial[],
    productionDate?: string,
    notes?: string
  ) => {
    try {
      // Start a transaction
      const { data: productionRecord, error: productionError } = await supabase
        .from('production_records')
        .insert({
          product_id: productId,
          quantity,
          production_date: productionDate || new Date().toISOString(),
          notes: notes || null
        } as any)
        .select()
        .single();

      if (productionError) throw productionError;

      // Insert production materials
      if (materials.length > 0) {
        const { error: materialsError } = await supabase
          .from('production_materials')
          .insert(materials.map(m => ({
            production_record_id: productionRecord.id,
            material_id: m.material_id,
            quantity_used: m.quantity_used,
            cost_at_time: m.cost_at_time || 0
          })));

        if (materialsError) throw materialsError;
      }

      // Update raw materials stock
      for (const material of materials) {
        const { data: currentMaterial, error: fetchError } = await supabase
          .from('raw_materials')
          .select('current_stock')
          .eq('id', material.material_id)
          .single();

        if (fetchError) throw fetchError;

        const { error: updateError } = await supabase
          .from('raw_materials')
          .update({
            current_stock: currentMaterial.current_stock - material.quantity_used,
            updated_at: new Date().toISOString()
          })
          .eq('id', material.material_id);

        if (updateError) throw updateError;
      }

      // Update product stock
      const { data: currentProduct, error: productFetchError } = await supabase
        .from('products')
        .select('current_stock')
        .eq('id', productId)
        .single();

      if (productFetchError) throw productFetchError;

      const { error: productUpdateError } = await supabase
        .from('products')
        .update({
          current_stock: currentProduct.current_stock + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (productUpdateError) throw productUpdateError;

      setProductionRecords(prev => [productionRecord, ...prev]);
      return productionRecord;

    } catch (error) {
      console.error('Error recording production:', error);
      toast({
        title: 'Error',
        description: 'Failed to record production',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProductionRecords();
  }, []);

  return {
    productionRecords,
    loading,
    recordProduction,
    refetch: fetchProductionRecords
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface RawMaterial {
  id: string;
  name: string;
  name_ar: string;
  unit: string;
  current_stock: number;
  min_threshold: number;
  cost_per_unit?: number;
  supplier?: string;
  last_received?: string;
  created_at: string;
  updated_at: string;
}

export const useRawMaterials = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('raw_materials')
        .select('*')
        .order('name');

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load raw materials',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = async (material: Omit<RawMaterial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('raw_materials')
        .insert([material])
        .select()
        .single();

      if (error) throw error;
      setMaterials(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding material:', error);
      toast({
        title: 'Error',
        description: 'Failed to add material',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateMaterial = async (id: string, updates: Partial<RawMaterial>) => {
    try {
      const { data, error } = await supabase
        .from('raw_materials')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setMaterials(prev => prev.map(m => m.id === id ? data : m));
      return data;
    } catch (error) {
      console.error('Error updating material:', error);
      toast({
        title: 'Error',
        description: 'Failed to update material',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const receiveMaterial = async (id: string, quantity: number) => {
    const material = materials.find(m => m.id === id);
    if (!material) return;

    return updateMaterial(id, {
      current_stock: material.current_stock + quantity,
      last_received: new Date().toISOString()
    });
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return {
    materials,
    loading,
    addMaterial,
    updateMaterial,
    receiveMaterial,
    refetch: fetchMaterials
  };
};

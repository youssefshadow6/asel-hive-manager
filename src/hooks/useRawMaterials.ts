
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type RawMaterialRow = Database['public']['Tables']['raw_materials']['Row'];
type RawMaterialInsert = Omit<Database['public']['Tables']['raw_materials']['Insert'], 'user_id'>;
type RawMaterialUpdate = Database['public']['Tables']['raw_materials']['Update'];

export interface RawMaterial extends RawMaterialRow {}

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

  const addMaterial = async (material: RawMaterialInsert) => {
    try {
      const { data, error } = await supabase
        .from('raw_materials')
        .insert(material as any)
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

  const updateMaterial = async (id: string, updates: RawMaterialUpdate) => {
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

  const receiveMaterial = async (
    id: string, 
    quantity: number, 
    supplierId?: string, 
    totalCost?: number
  ) => {
    const material = materials.find(m => m.id === id);
    if (!material) return;

    try {
      // Update material stock
      const updatedMaterial = await updateMaterial(id, {
        current_stock: material.current_stock + quantity,
        last_received: new Date().toISOString(),
        supplier_id: supplierId || material.supplier_id
      });

      // If supplier and cost are provided, update supplier balance
      if (supplierId && totalCost && totalCost > 0) {
        const { error: transactionError } = await supabase
          .from('supplier_transactions')
          .insert({
            supplier_id: supplierId,
            transaction_type: 'purchase',
            amount: totalCost,
            description: `Purchase of ${quantity} ${material.unit} of ${material.name}`
          } as any);

        if (transactionError) {
          console.error('Error creating supplier transaction:', transactionError);
          toast({
            title: 'Warning',
            description: 'Material received but supplier balance not updated',
            variant: 'destructive'
          });
        }
      }

      return updatedMaterial;
    } catch (error) {
      console.error('Error receiving material:', error);
      throw error;
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('raw_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMaterials(prev => prev.filter(m => m.id !== id));
      toast({
        title: 'Success',
        description: 'Material deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete material',
        variant: 'destructive'
      });
      throw error;
    }
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
    deleteMaterial,
    refetch: fetchMaterials
  };
};

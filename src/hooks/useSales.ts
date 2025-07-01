
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SaleRecord {
  id: string;
  product_id: string;
  quantity: number;
  customer_name: string;
  sale_price: number;
  total_amount: number;
  sale_date: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

export const useSales = () => {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSalesRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_records')
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) throw error;
      setSalesRecords(data || []);
    } catch (error) {
      console.error('Error fetching sales records:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sales records',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const recordSale = async (
    productId: string,
    quantity: number,
    customerName: string,
    salePrice: number
  ) => {
    try {
      const totalAmount = quantity * salePrice;

      // Insert sale record
      const { data: saleRecord, error: saleError } = await supabase
        .from('sales_records')
        .insert([{
          product_id: productId,
          quantity,
          customer_name: customerName,
          sale_price: salePrice,
          total_amount: totalAmount,
          sale_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (saleError) throw saleError;

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
          current_stock: currentProduct.current_stock - quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (productUpdateError) throw productUpdateError;

      setSalesRecords(prev => [saleRecord, ...prev]);
      return saleRecord;

    } catch (error) {
      console.error('Error recording sale:', error);
      toast({
        title: 'Error',
        description: 'Failed to record sale',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSalesRecords();
  }, []);

  return {
    salesRecords,
    loading,
    recordSale,
    refetch: fetchSalesRecords
  };
};

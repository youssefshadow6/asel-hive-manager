
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SaleRecord {
  id: string;
  product_id: string;
  quantity: number;
  customer_name: string;
  customer_id?: string;
  sale_price: number;
  total_amount: number;
  amount_paid?: number;
  sale_date: string;
  payment_method?: string;
  payment_status?: string;
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
    salePrice: number,
    saleDate?: string,
    customerId?: string,
    amountPaid?: number,
    paymentMethod?: string,
    notes?: string
  ) => {
    try {
      const totalAmount = quantity * salePrice;
      const actualAmountPaid = amountPaid || totalAmount;
      const paymentStatus = actualAmountPaid >= totalAmount ? 'paid' : 'partial';

      // Insert sale record
      const { data: saleRecord, error: saleError } = await supabase
        .from('sales_records')
        .insert({
          product_id: productId,
          quantity,
          customer_name: customerName,
          customer_id: customerId,
          sale_price: salePrice,
          total_amount: totalAmount,
          amount_paid: actualAmountPaid,
          payment_status: paymentStatus,
          payment_method: paymentMethod || 'cash',
          sale_date: saleDate || new Date().toISOString(),
          notes
        } as any)
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

      // If customer is selected and there's unpaid amount, create customer transaction
      if (customerId && actualAmountPaid < totalAmount) {
        const { error: transactionError } = await supabase
          .from('customer_transactions')
          .insert({
            customer_id: customerId,
            transaction_type: 'sale',
            amount: totalAmount - actualAmountPaid,
            description: `Sale - ${customerName} (${quantity} x ${salePrice})`,
            reference_id: saleRecord.id
          } as any);

        if (transactionError) {
          console.error('Error creating customer transaction:', transactionError);
        }
      }

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

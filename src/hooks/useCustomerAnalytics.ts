
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CustomerAnalytics {
  most_active_days: string[];
  most_purchased_products: Array<{
    product_name: string;
    product_name_ar: string;
    total_quantity: number;
    total_amount: number;
    purchase_count: number;
  }>;
  next_order_prediction: {
    predicted_date: string | null;
    confidence: string;
    avg_days_between_orders: number | null;
  };
  total_purchases: number;
  total_spent: number;
}

export const useCustomerAnalytics = () => {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCustomerAnalytics = async (customerId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_customer_analytics', {
        customer_uuid: customerId
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive'
        });
        return null;
      }

      setAnalytics(data);
      return data;
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customer analytics',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    fetchCustomerAnalytics
  };
};

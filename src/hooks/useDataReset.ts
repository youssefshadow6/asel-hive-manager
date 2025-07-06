
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDataReset = () => {
  const [loading, setLoading] = useState(false);

  const resetAllData = async (password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('reset_user_data', {
        admin_password: password
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message
        });
        return { success: true, message: data.message };
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive'
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset data',
        variant: 'destructive'
      });
      return { success: false, message: 'Failed to reset data' };
    } finally {
      setLoading(false);
    }
  };

  return {
    resetAllData,
    loading
  };
};

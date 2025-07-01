
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Plus, Minus, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { toast } from "@/hooks/use-toast";

interface SalesManagerProps {
  language: 'en' | 'ar';
}

export const SalesManager = ({ language }: SalesManagerProps) => {
  const { products, refetch: refetchProducts } = useProducts();
  const { salesRecords, recordSale } = useSales();
  
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [salePrice, setSalePrice] = useState(0);

  const translations = {
    en: {
      sales: "Sales Management",
      recordSale: "Record Sale",
      selectProduct: "Select Product",
      quantity: "Quantity Sold",
      customerName: "Customer Name",
      price: "Price per Unit",
      totalPrice: "Total Price",
      currentStock: "Current Stock",
      availableStock: "Available Stock",
      insufficient: "Insufficient Stock",
      sell: "Record Sale",
      cancel: "Cancel",
      saleRecorded: "Sale recorded successfully",
      insufficientStock: "Insufficient stock for this sale",
      recentSales: "Recent Sales",
      noSales: "No sales records yet",
      sold: "Sold",
      units: "units",
      to: "to",
      totalSales: "Total Sales",
      todaySales: "Today's Sales",
      bestSelling: "Best Selling Product",
      currency: "$"
    },
    ar: {
      sales: "إدارة المبيعات",
      recordSale: "تسجيل بيع",
      selectProduct: "اختر المنتج",
      quantity: "الكمية المباعة",
      customerName: "اسم العميل",
      price: "السعر للوحدة",
      totalPrice: "إجمالي السعر",
      currentStock: "المخزون الحالي",
      availableStock: "المخزون المتاح",
      insufficient: "مخزون غير كاف",
      sell: "تسجيل البيع",
      cancel: "إلغاء",
      saleRecorded: "تم تسجيل البيع بنجاح",
      insufficientStock: "مخزون غير كاف لهذا البيع",
      recentSales: "المبيعات الأخيرة",
      noSales: "لا توجد سجلات مبيعات بعد",
      sold: "تم بيع",
      units: "وحدة",
      to: "إلى",
      totalSales: "إجمالي المبيعات",
      todaySales: "مبيعات اليوم",
      bestSelling: "المنتج الأكثر مبيعاً",
      currency: "ريال"
    }
  };

  const t = translations[language];

  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  const canSell = () => {
    return selectedProduct && selectedProduct.current_stock >= saleQuantity;
  };

  const getTotalPrice = () => salePrice * saleQuantity;

  const getTodaySales = () => {
    const today = new Date();
    return salesRecords
      .filter(sale => new Date(sale.sale_date).toDateString() === today.toDateString())
      .reduce((total, sale) => total + sale.total_amount, 0);
  };

  const getTotalSalesValue = () => {
    return salesRecords.reduce((total, sale) => total + sale.total_amount, 0);
  };

  const getBestSellingProduct = () => {
    const productSales = salesRecords.reduce((acc, sale) => {
      acc[sale.product_id] = (acc[sale.product_id] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);
    
    const bestProductId = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    const bestProduct = products.find(p => p.id === bestProductId);
    return bestProduct ? {
      product: bestProduct,
      totalSold: productSales[bestProductId]
    } : null;
  };

  const handleRecordSale = async () => {
    if (!selectedProductId || !canSell() || !customerName.trim() || salePrice <= 0) {
      toast({
        title: language === 'en' ? "Error" : "خطأ",
        description: !customerName.trim() 
          ? (language === 'en' ? "Please enter customer name" : "يرجى إدخال اسم العميل")
          : salePrice <= 0
          ? (language === 'en' ? "Please enter a valid price" : "يرجى إدخال سعر صحيح")
          : t.insufficientStock,
        variant: "destructive"
      });
      return;
    }

    try {
      await recordSale(selectedProductId, saleQuantity, customerName.trim(), salePrice);
      
      // Refresh products data
      refetchProducts();
      
      // Reset form
      setSelectedProductId('');
      setSaleQuantity(1);
      setCustomerName('');
      setSalePrice(0);
      setIsSaleDialogOpen(false);

      toast({
        title: language === 'en' ? "Success" : "نجح",
        description: t.saleRecorded
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const bestSelling = getBestSellingProduct();

  return (
    <div className="space-y-6">
      {/* Header with Sales Stats */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-900">{t.sales}</h2>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">{t.todaySales}</div>
            <div className="font-bold text-amber-700">
              {t.currency}{getTodaySales().toFixed(2)}
            </div>
          </div>
          
          <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t.recordSale}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t.recordSale}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Product and Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.selectProduct}</Label>
                    <Select value={selectedProductId} onValueChange={(value) => {
                      setSelectedProductId(value);
                      const product = products.find(p => p.id === value);
                      if (product?.selling_price) {
                        setSalePrice(product.selling_price);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectProduct} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {language === 'en' ? product.name : product.name_ar} 
                            <span className="text-gray-500 ml-2">
                              ({product.current_stock} {language === 'en' ? 'available' : 'متوفر'})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.customerName}</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={language === 'en' ? "Enter customer name" : "أدخل اسم العميل"}
                    />
                  </div>
                </div>

                {/* Quantity and Price */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>{t.quantity}</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSaleQuantity(Math.max(1, saleQuantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={saleQuantity}
                        onChange={(e) => setSaleQuantity(Math.max(1, Number(e.target.value)))}
                        className="text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSaleQuantity(saleQuantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>{t.price}</Label>
                    <Input
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(Number(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>{t.totalPrice}</Label>
                    <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                      <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="font-semibold text-amber-700">
                        {getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock Validation */}
                {selectedProductId && (
                  <div className={`p-3 rounded-lg border ${
                    canSell() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {language === 'en' ? selectedProduct?.name : selectedProduct?.name_ar}
                      </span>
                      <div className="text-right">
                        <div className="text-sm">
                          <span className="text-gray-600">{t.availableStock}: </span>
                          <span className={canSell() ? 'text-green-600' : 'text-red-600'}>
                            {selectedProduct?.current_stock}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!canSell() && (
                      <div className="text-sm text-red-600 mt-1">
                        {t.insufficient}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleRecordSale} 
                    disabled={!canSell() || !selectedProductId || !customerName.trim() || salePrice <= 0}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300"
                  >
                    {t.sell}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSaleDialogOpen(false)} 
                    className="flex-1"
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-900">{t.todaySales}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {t.currency}{getTodaySales().toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              {salesRecords.filter(sale => {
                const today = new Date();
                return new Date(sale.sale_date).toDateString() === today.toDateString();
              }).length} {language === 'en' ? 'transactions' : 'معاملة'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-900">{t.totalSales}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {t.currency}{getTotalSalesValue().toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              {salesRecords.length} {language === 'en' ? 'total transactions' : 'إجمالي المعاملات'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-900">{t.bestSelling}</CardTitle>
          </CardHeader>
          <CardContent>
            {bestSelling ? (
              <>
                <div className="text-lg font-bold text-amber-700">
                  {language === 'en' ? bestSelling.product.name : bestSelling.product.name_ar}
                </div>
                <div className="text-sm text-gray-600">
                  {bestSelling.totalSold} {t.units} {t.sold}
                </div>
              </>
            ) : (
              <div className="text-gray-500">-</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Records */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">{t.recentSales}</CardTitle>
        </CardHeader>
        <CardContent>
          {salesRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t.noSales}</p>
          ) : (
            <div className="space-y-4">
              {salesRecords.slice(0, 10).map((record) => {
                const product = products.find(p => p.id === record.product_id);
                return (
                  <div key={record.id} className="flex justify-between items-center p-4 bg-amber-50 rounded-lg">
                    <div>
                      <div className="font-medium text-amber-900">
                        {language === 'en' ? product?.name : product?.name_ar}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t.sold} {record.quantity} {t.units} {t.to} {record.customer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(record.sale_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - 
                        {new Date(record.sale_date).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-700">
                        {t.currency}{record.total_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Factory, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { useProducts } from "@/hooks/useProducts";
import { useProduction } from "@/hooks/useProduction";
import { useProductBOM } from "@/hooks/useProductBOM";
import { toast } from "@/hooks/use-toast";

interface ProductionManagerProps {
  language: 'en' | 'ar';
}

export const ProductionManager = ({ language }: ProductionManagerProps) => {
  const { materials: rawMaterials, refetch: refetchMaterials } = useRawMaterials();
  const { products, refetch: refetchProducts } = useProducts();
  const { productionRecords, recordProduction } = useProduction();
  const { fetchBOMByProduct } = useProductBOM();
  
  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productionQuantity, setProductionQuantity] = useState(1);
  const [bomRequirements, setBomRequirements] = useState<any[]>([]);
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);

  const translations = {
    en: {
      production: "Production Management",
      recordProduction: "Record Production",
      selectProduct: "Select Product",
      quantity: "Quantity to Produce",
      productionDate: "Production Date",
      materialsRequired: "Materials Required",
      currentStock: "Current Stock",
      required: "Required",
      available: "Available",
      insufficient: "Insufficient Stock",
      produce: "Produce",
      cancel: "Cancel",
      productionRecorded: "Production recorded successfully",
      insufficientMaterials: "Insufficient materials for production",
      recentProduction: "Recent Production",
      noProduction: "No production records yet",
      produced: "Produced",
      units: "units",
      noRecipeFound: "No recipe found for this product. Please set up the Bill of Materials in Product Catalog."
    },
    ar: {
      production: "إدارة الإنتاج",
      recordProduction: "تسجيل إنتاج",
      selectProduct: "اختر المنتج",
      quantity: "الكمية المراد إنتاجها",
      productionDate: "تاريخ الإنتاج",
      materialsRequired: "المواد المطلوبة",
      currentStock: "المخزون الحالي",
      required: "مطلوب",
      available: "متوفر",
      insufficient: "مخزون غير كاف",
      produce: "إنتاج",
      cancel: "إلغاء",
      productionRecorded: "تم تسجيل الإنتاج بنجاح",
      insufficientMaterials: "مواد غير كافية للإنتاج",
      recentProduction: "الإنتاج الأخير",
      noProduction: "لا توجد سجلات إنتاج بعد",
      produced: "تم إنتاج",
      units: "وحدة",
      noRecipeFound: "لم يتم العثور على وصفة لهذا المنتج. يرجى إعداد مكونات المنتج في كتالوج المنتجات."
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (selectedProductId) {
      loadProductBOM();
    }
  }, [selectedProductId]);

  const loadProductBOM = async () => {
    const bomData = await fetchBOMByProduct(selectedProductId);
    setBomRequirements(bomData);
  };

  const getRequiredMaterials = () => {
    return bomRequirements.map(bomItem => {
      const totalRequired = bomItem.quantity_per_unit * productionQuantity;
      const material = bomItem.raw_materials || rawMaterials.find(m => m.id === bomItem.material_id);
      
      return {
        material,
        quantityPerUnit: bomItem.quantity_per_unit,
        totalRequired,
        available: material?.current_stock || 0,
        sufficient: (material?.current_stock || 0) >= totalRequired
      };
    }).filter(req => req.material);
  };

  const canProduce = () => {
    const requirements = getRequiredMaterials();
    return requirements.length > 0 && requirements.every(req => req.sufficient);
  };

  const handleRecordProduction = async () => {
    if (!selectedProductId || !canProduce()) {
      toast({
        title: language === 'en' ? "Error" : "خطأ",
        description: bomRequirements.length === 0 ? t.noRecipeFound : t.insufficientMaterials,
        variant: "destructive"
      });
      return;
    }

    const requirements = getRequiredMaterials();
    const materials = requirements.map(req => ({
      material_id: req.material!.id,
      quantity_used: req.totalRequired,
      cost_at_time: req.material!.cost_per_unit || 0
    }));

    try {
      await recordProduction(selectedProductId, productionQuantity, materials, productionDate);
      
      // Refresh data
      refetchMaterials();
      refetchProducts();
      
      // Reset form
      setSelectedProductId('');
      setProductionQuantity(1);
      setBomRequirements([]);
      setProductionDate(new Date().toISOString().split('T')[0]);
      setIsProductionDialogOpen(false);

      toast({
        title: language === 'en' ? "Success" : "نجح",
        description: t.productionRecorded
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-900">{t.production}</h2>
        
        <Dialog open={isProductionDialogOpen} onOpenChange={setIsProductionDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Factory className="w-4 h-4 mr-2" />
              {t.recordProduction}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.recordProduction}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Product Selection and Date */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t.selectProduct}</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectProduct} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {language === 'en' ? product.name : product.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.quantity}</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProductionQuantity(Math.max(1, productionQuantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={productionQuantity}
                      onChange={(e) => setProductionQuantity(Math.max(1, Number(e.target.value)))}
                      className="text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProductionQuantity(productionQuantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>{t.productionDate}</Label>
                  <Input
                    type="date"
                    value={productionDate}
                    onChange={(e) => setProductionDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Material Requirements */}
              {selectedProductId && (
                <div>
                  <h3 className="font-semibold text-amber-900 mb-3">{t.materialsRequired}</h3>
                  
                  {bomRequirements.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">{t.noRecipeFound}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getRequiredMaterials().map((req, index) => {
                        const sufficient = req.sufficient;
                        
                        return (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg border ${
                              sufficient ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <span className="font-medium">
                                  {language === 'en' ? req.material?.name : req.material?.name_ar}
                                </span>
                                <span className="text-sm text-gray-600 ml-2">
                                  ({req.material?.unit})
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">{t.required}: {req.totalRequired}</span>
                              <span className={sufficient ? 'text-green-600' : 'text-red-600'}>
                                {t.available}: {req.available}
                              </span>
                            </div>
                            {!sufficient && (
                              <div className="text-sm text-red-600 mt-1">
                                {t.insufficient}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  onClick={handleRecordProduction} 
                  disabled={!canProduce() || !selectedProductId || bomRequirements.length === 0}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300"
                >
                  {t.produce}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsProductionDialogOpen(false)} 
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Production Records */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">{t.recentProduction}</CardTitle>
        </CardHeader>
        <CardContent>
          {productionRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t.noProduction}</p>
          ) : (
            <div className="space-y-4">
              {productionRecords.slice(0, 10).map((record) => {
                const product = products.find(p => p.id === record.product_id);
                return (
                  <div key={record.id} className="flex justify-between items-center p-4 bg-amber-50 rounded-lg">
                    <div>
                      <div className="font-medium text-amber-900">
                        {language === 'en' ? product?.name : product?.name_ar}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(record.production_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - 
                        {new Date(record.production_date).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-700">
                        {t.produced} {record.quantity} {t.units}
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

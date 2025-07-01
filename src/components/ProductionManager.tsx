
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Factory, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RawMaterial, Product, ProductionRecord } from "@/pages/Index";
import { toast } from "@/hooks/use-toast";

interface ProductionManagerProps {
  rawMaterials: RawMaterial[];
  setRawMaterials: (materials: RawMaterial[]) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  productionRecords: ProductionRecord[];
  setProductionRecords: (records: ProductionRecord[]) => void;
  language: 'en' | 'ar';
}

interface MaterialRequirement {
  materialId: string;
  quantityPerUnit: number;
}

const productionRecipes: Record<string, MaterialRequirement[]> = {
  '1': [ // Honey Jar 500g
    { materialId: '1', quantityPerUnit: 0.5 }, // Raw Honey: 0.5kg per jar
    { materialId: '3', quantityPerUnit: 1 },   // Glass Jar: 1 per jar
    { materialId: '4', quantityPerUnit: 1 },   // Lid: 1 per jar
    { materialId: '5', quantityPerUnit: 1 },   // Label: 1 per jar
  ],
  '2': [ // Sage Tea Blend
    { materialId: '2', quantityPerUnit: 0.1 }, // Sage Herbs: 0.1 sacks per 100g
    { materialId: '5', quantityPerUnit: 1 },   // Label: 1 per package
  ]
};

export const ProductionManager = ({ 
  rawMaterials, 
  setRawMaterials, 
  products, 
  setProducts,
  productionRecords,
  setProductionRecords,
  language 
}: ProductionManagerProps) => {
  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productionQuantity, setProductionQuantity] = useState(1);

  const translations = {
    en: {
      production: "Production Management",
      recordProduction: "Record Production",
      selectProduct: "Select Product",
      quantity: "Quantity to Produce",
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
      units: "units"
    },
    ar: {
      production: "إدارة الإنتاج",
      recordProduction: "تسجيل إنتاج",
      selectProduct: "اختر المنتج",
      quantity: "الكمية المراد إنتاجها",
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
      units: "وحدة"
    }
  };

  const t = translations[language];

  const getSelectedProduct = () => products.find(p => p.id === selectedProductId);

  const getRequiredMaterials = () => {
    if (!selectedProductId || !productionRecipes[selectedProductId]) return [];
    
    return productionRecipes[selectedProductId].map(req => {
      const material = rawMaterials.find(m => m.id === req.materialId);
      const totalRequired = req.quantityPerUnit * productionQuantity;
      
      return {
        material,
        quantityPerUnit: req.quantityPerUnit,
        totalRequired,
        available: material?.currentStock || 0,
        sufficient: (material?.currentStock || 0) >= totalRequired
      };
    });
  };

  const canProduce = () => {
    const requirements = getRequiredMaterials();
    return requirements.every(req => req.sufficient);
  };

  const recordProduction = () => {
    if (!selectedProductId || !canProduce()) {
      toast({
        title: language === 'en' ? "Error" : "خطأ",
        description: t.insufficientMaterials,
        variant: "destructive"
      });
      return;
    }

    const requirements = getRequiredMaterials();
    
    // Update raw materials stock
    const updatedMaterials = rawMaterials.map(material => {
      const requirement = requirements.find(req => req.material?.id === material.id);
      if (requirement) {
        return {
          ...material,
          currentStock: material.currentStock - requirement.totalRequired
        };
      }
      return material;
    });

    // Update product stock
    const updatedProducts = products.map(product => {
      if (product.id === selectedProductId) {
        return {
          ...product,
          currentStock: product.currentStock + productionQuantity
        };
      }
      return product;
    });

    // Create production record
    const productionRecord: ProductionRecord = {
      id: Date.now().toString(),
      productId: selectedProductId,
      quantity: productionQuantity,
      date: new Date(),
      materials: requirements.map(req => ({
        materialId: req.material!.id,
        quantity: req.totalRequired
      }))
    };

    setRawMaterials(updatedMaterials);
    setProducts(updatedProducts);
    setProductionRecords([productionRecord, ...productionRecords]);
    
    setSelectedProductId('');
    setProductionQuantity(1);
    setIsProductionDialogOpen(false);

    toast({
      title: language === 'en' ? "Success" : "نجح",
      description: t.productionRecorded
    });
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
              {/* Product Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.selectProduct}</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectProduct} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {language === 'en' ? product.name : product.nameAr}
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
              </div>

              {/* Materials Requirements */}
              {selectedProductId && (
                <div>
                  <h3 className="font-semibold text-amber-900 mb-3">{t.materialsRequired}</h3>
                  <div className="space-y-3">
                    {getRequiredMaterials().map((req, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg border ${
                          req.sufficient ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">
                              {language === 'en' ? req.material?.name : req.material?.nameAr}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({req.material?.unit})
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              <span className="text-gray-600">{t.required}: </span>
                              <span className="font-semibold">{req.totalRequired}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">{t.available}: </span>
                              <span className={req.sufficient ? 'text-green-600' : 'text-red-600'}>
                                {req.available}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!req.sufficient && (
                          <div className="text-sm text-red-600 mt-1">
                            {t.insufficient}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  onClick={recordProduction} 
                  disabled={!canProduce() || !selectedProductId}
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
                const product = products.find(p => p.id === record.productId);
                return (
                  <div key={record.id} className="flex justify-between items-center p-4 bg-amber-50 rounded-lg">
                    <div>
                      <div className="font-medium text-amber-900">
                        {language === 'en' ? product?.name : product?.nameAr}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - 
                        {record.date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}
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

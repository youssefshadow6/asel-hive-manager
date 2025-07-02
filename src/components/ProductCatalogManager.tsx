
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Edit, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useProducts } from "@/hooks/useProducts";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { useProductBOM } from "@/hooks/useProductBOM";
import { toast } from "@/hooks/use-toast";
import type { Database } from '@/integrations/supabase/types';

interface ProductCatalogManagerProps {
  language: 'en' | 'ar';
}

type ProductSize = Database['public']['Enums']['product_size'];
const productSizes: ProductSize[] = ['100g', '250g', '500g', '1kg', '2kg'];

interface NewProduct {
  name: string;
  name_ar: string;
  size: ProductSize;
  selling_price: number;
  production_cost: number;
  min_threshold: number;
}

interface BOMEntry {
  material_id: string;
  quantity_per_unit: number;
}

export const ProductCatalogManager = ({ language }: ProductCatalogManagerProps) => {
  const { products, loading: productsLoading, updateProduct, refetch: refetchProducts } = useProducts();
  const { materials } = useRawMaterials();
  const { fetchBOMByProduct, saveBOM } = useProductBOM();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditBOMDialogOpen, setIsEditBOMDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [bomEntries, setBomEntries] = useState<BOMEntry[]>([]);
  
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    name_ar: '',
    size: '500g',
    selling_price: 0,
    production_cost: 0,
    min_threshold: 5
  });

  const translations = {
    en: {
      productCatalog: "Product Catalog",
      addProduct: "Add Product",
      editRecipe: "Edit Recipe",
      productName: "Product Name (English)",
      productNameAr: "Product Name (Arabic)",
      size: "Size",
      sellingPrice: "Selling Price",
      productionCost: "Production Cost",
      minThreshold: "Minimum Stock Threshold",
      billOfMaterials: "Bill of Materials (Recipe)",
      material: "Raw Material",
      quantityPerUnit: "Quantity per Unit",
      addMaterial: "Add Material",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      noProducts: "No products in catalog yet",
      productAdded: "Product added successfully",
      recipeUpdated: "Recipe updated successfully",
      currentStock: "Current Stock",
      recipe: "Recipe"
    },
    ar: {
      productCatalog: "كتالوج المنتجات",
      addProduct: "إضافة منتج",
      editRecipe: "تعديل الوصفة",
      productName: "اسم المنتج (بالإنجليزية)",
      productNameAr: "اسم المنتج (بالعربية)",
      size: "الحجم",
      sellingPrice: "سعر البيع",
      productionCost: "تكلفة الإنتاج",
      minThreshold: "الحد الأدنى للمخزون",
      billOfMaterials: "مكونات المنتج (الوصفة)",
      material: "المادة الخام",
      quantityPerUnit: "الكمية لكل وحدة",
      addMaterial: "إضافة مادة",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      noProducts: "لا توجد منتجات في الكتالوج بعد",
      productAdded: "تم إضافة المنتج بنجاح",
      recipeUpdated: "تم تحديث الوصفة بنجاح",
      currentStock: "المخزون الحالي",
      recipe: "الوصفة"
    }
  };

  const t = translations[language];

  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.name_ar.trim()) {
      toast({
        title: language === 'en' ? "Error" : "خطأ",
        description: language === 'en' ? "Please fill in all required fields" : "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateProduct('new', {
        name: newProduct.name,
        name_ar: newProduct.name_ar,
        size: newProduct.size,
        selling_price: newProduct.selling_price,
        production_cost: newProduct.production_cost,
        min_threshold: newProduct.min_threshold,
        current_stock: 0
      });

      setNewProduct({
        name: '',
        name_ar: '',
        size: '500g',
        selling_price: 0,
        production_cost: 0,
        min_threshold: 5
      });
      setIsAddDialogOpen(false);
      refetchProducts();

      toast({
        title: language === 'en' ? "Success" : "نجح",
        description: t.productAdded
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEditBOM = async (productId: string) => {
    setSelectedProductId(productId);
    const bomData = await fetchBOMByProduct(productId);
    setBomEntries(bomData.map(item => ({
      material_id: item.material_id,
      quantity_per_unit: item.quantity_per_unit
    })));
    setIsEditBOMDialogOpen(true);
  };

  const addBOMEntry = () => {
    setBomEntries([...bomEntries, { material_id: '', quantity_per_unit: 0 }]);
  };

  const updateBOMEntry = (index: number, field: keyof BOMEntry, value: string | number) => {
    const updated = [...bomEntries];
    updated[index] = { ...updated[index], [field]: value };
    setBomEntries(updated);
  };

  const removeBOMEntry = (index: number) => {
    setBomEntries(bomEntries.filter((_, i) => i !== index));
  };

  const handleSaveBOM = async () => {
    const validEntries = bomEntries.filter(entry => 
      entry.material_id && entry.quantity_per_unit > 0
    );

    try {
      await saveBOM(selectedProductId, validEntries);
      setIsEditBOMDialogOpen(false);
      setBomEntries([]);
      setSelectedProductId('');

      toast({
        title: language === 'en' ? "Success" : "نجح",
        description: t.recipeUpdated
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (productsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-900">{t.productCatalog}</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Package className="w-4 h-4 mr-2" />
              {t.addProduct}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.addProduct}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.productName}</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Honey Jar"
                  />
                </div>
                <div>
                  <Label>{t.productNameAr}</Label>
                  <Input
                    value={newProduct.name_ar}
                    onChange={(e) => setNewProduct({...newProduct, name_ar: e.target.value})}
                    placeholder="برطمان عسل"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t.size}</Label>
                  <Select value={newProduct.size} onValueChange={(value: ProductSize) => setNewProduct({...newProduct, size: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productSizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.sellingPrice}</Label>
                  <Input
                    type="number"
                    value={newProduct.selling_price}
                    onChange={(e) => setNewProduct({...newProduct, selling_price: Number(e.target.value)})}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>{t.minThreshold}</Label>
                  <Input
                    type="number"
                    value={newProduct.min_threshold}
                    onChange={(e) => setNewProduct({...newProduct, min_threshold: Number(e.target.value)})}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleAddProduct} className="flex-1 bg-amber-600 hover:bg-amber-700">
                  {t.save}
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  {t.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>{t.noProducts}</p>
          </div>
        ) : (
          products.map(product => (
            <Card key={product.id} className="border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-900 text-lg">
                  {language === 'en' ? product.name : product.name_ar}
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {product.size} • ${product.selling_price?.toFixed(2) || '0.00'}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t.currentStock}:</span>
                    <span className="font-semibold">{product.current_stock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'en' ? 'Min Threshold' : 'الحد الأدنى'}:</span>
                    <span>{product.min_threshold}</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditBOM(product.id)}
                  className="w-full mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t.editRecipe}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit BOM Dialog */}
      <Dialog open={isEditBOMDialogOpen} onOpenChange={setIsEditBOMDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t.billOfMaterials}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {bomEntries.map((entry, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <Label>{t.material}</Label>
                  <Select
                    value={entry.material_id}
                    onValueChange={(value) => updateBOMEntry(index, 'material_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map(material => (
                        <SelectItem key={material.id} value={material.id}>
                          {language === 'en' ? material.name : material.name_ar} ({material.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Label>{t.quantityPerUnit}</Label>
                  <Input
                    type="number"
                    value={entry.quantity_per_unit}
                    onChange={(e) => updateBOMEntry(index, 'quantity_per_unit', Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeBOMEntry(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addBOMEntry}
              className="w-full border-dashed border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.addMaterial}
            </Button>

            <div className="flex space-x-2 pt-4">
              <Button onClick={handleSaveBOM} className="flex-1 bg-amber-600 hover:bg-amber-700">
                <Save className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
              <Button variant="outline" onClick={() => setIsEditBOMDialogOpen(false)} className="flex-1">
                {t.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

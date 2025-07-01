
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { toast } from "@/hooks/use-toast";

interface RawMaterialsManagerProps {
  language: 'en' | 'ar';
}

const materialUnits = ['kg', 'pieces', 'sacks', 'liters', 'grams'];

export const RawMaterialsManager = ({ language }: RawMaterialsManagerProps) => {
  const { materials, loading, addMaterial, receiveMaterial } = useRawMaterials();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    name_ar: '',
    unit: 'kg',
    min_threshold: 0,
    current_stock: 0,
    cost_per_unit: 0,
    supplier: ''
  });
  const [receiveQuantity, setReceiveQuantity] = useState(0);

  const translations = {
    en: {
      rawMaterials: "Raw Materials",
      addMaterial: "Add New Material",
      receiveMaterial: "Receive Material",
      materialName: "Material Name (English)",
      materialNameAr: "Material Name (Arabic)",
      unit: "Unit",
      minThreshold: "Minimum Threshold",
      currentStock: "Current Stock",
      costPerUnit: "Cost per Unit",
      supplier: "Supplier",
      lastReceived: "Last Received",
      lowStock: "Low Stock",
      actions: "Actions",
      receive: "Receive",
      add: "Add",
      cancel: "Cancel",
      quantity: "Quantity",
      save: "Save",
      materialAdded: "Material added successfully",
      materialReceived: "Material received successfully",
      loading: "Loading..."
    },
    ar: {
      rawMaterials: "المواد الخام",
      addMaterial: "إضافة مادة جديدة",
      receiveMaterial: "استلام مادة",
      materialName: "اسم المادة (بالإنجليزية)",
      materialNameAr: "اسم المادة (بالعربية)",
      unit: "الوحدة",
      minThreshold: "الحد الأدنى",
      currentStock: "المخزون الحالي",
      costPerUnit: "التكلفة لكل وحدة",
      supplier: "المورد",
      lastReceived: "آخر استلام",
      lowStock: "مخزون منخفض",
      actions: "الإجراءات",
      receive: "استلام",
      add: "إضافة",
      cancel: "إلغاء",
      quantity: "الكمية",
      save: "حفظ",
      materialAdded: "تم إضافة المادة بنجاح",
      materialReceived: "تم استلام المادة بنجاح",
      loading: "جاري التحميل..."
    }
  };

  const t = translations[language];

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.name_ar || !newMaterial.unit) {
      toast({
        title: language === 'en' ? "Error" : "خطأ",
        description: language === 'en' ? "Please fill all required fields" : "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      await addMaterial({
        name: newMaterial.name,
        name_ar: newMaterial.name_ar,
        unit: newMaterial.unit,
        current_stock: newMaterial.current_stock,
        min_threshold: newMaterial.minThreshold,
        cost_per_unit: newMaterial.cost_per_unit || 0,
        supplier: newMaterial.supplier
      });
      
      setNewMaterial({
        name: '',
        name_ar: '',
        unit: 'kg',
        min_threshold: 0,
        current_stock: 0,
        cost_per_unit: 0,
        supplier: ''
      });
      setIsAddDialogOpen(false);
      
      toast({
        title: language === 'en' ? "Success" : "نجح",
        description: t.materialAdded
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleReceiveMaterial = async () => {
    if (!selectedMaterialId || receiveQuantity <= 0) return;

    try {
      await receiveMaterial(selectedMaterialId, receiveQuantity);
      setReceiveQuantity(0);
      setSelectedMaterialId(null);
      setIsReceiveDialogOpen(false);
      
      toast({
        title: language === 'en' ? "Success" : "نجح",
        description: t.materialReceived
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-amber-900 font-medium">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-900">{t.rawMaterials}</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {t.addMaterial}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t.addMaterial}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t.materialName}</Label>
                <Input
                  id="name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                  placeholder="Raw Honey"
                />
              </div>
              <div>
                <Label htmlFor="nameAr">{t.materialNameAr}</Label>
                <Input
                  id="nameAr"
                  value={newMaterial.name_ar}
                  onChange={(e) => setNewMaterial({...newMaterial, name_ar: e.target.value})}
                  placeholder="عسل خام"
                />
              </div>
              <div>
                <Label htmlFor="unit">{t.unit}</Label>
                <Select value={newMaterial.unit} onValueChange={(value) => setNewMaterial({...newMaterial, unit: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {materialUnits.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="minThreshold">{t.minThreshold}</Label>
                <Input
                  id="minThreshold"
                  type="number"
                  value={newMaterial.min_threshold}
                  onChange={(e) => setNewMaterial({...newMaterial, min_threshold: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="currentStock">{t.currentStock}</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={newMaterial.current_stock}
                  onChange={(e) => setNewMaterial({...newMaterial, current_stock: Number(e.target.value)})}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddMaterial} className="flex-1 bg-amber-600 hover:bg-amber-700">
                  {t.add}
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  {t.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <Card key={material.id} className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-amber-900">
                    {language === 'en' ? material.name : material.name_ar}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {language === 'en' ? material.name_ar : material.name}
                  </p>
                </div>
                {material.current_stock <= material.min_threshold && (
                  <Badge variant="destructive" className="flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{t.lowStock}</span>
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t.currentStock}:</span>
                  <span className="font-bold text-amber-700">
                    {material.current_stock} {material.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t.minThreshold}:</span>
                  <span className="text-sm">{material.min_threshold} {material.unit}</span>
                </div>
                {material.last_received && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t.lastReceived}:</span>
                    <span className="text-sm">
                      {new Date(material.last_received).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => {
                    setSelectedMaterialId(material.id);
                    setIsReceiveDialogOpen(true);
                  }}
                >
                  <Package className="w-4 h-4 mr-2" />
                  {t.receive}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Receive Material Dialog */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t.receiveMaterial}
              {selectedMaterial && (
                <span className="block text-sm font-normal text-gray-600 mt-1">
                  {language === 'en' ? selectedMaterial.name : selectedMaterial.name_ar}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">{t.quantity} ({selectedMaterial?.unit})</Label>
              <Input
                id="quantity"
                type="number"
                value={receiveQuantity}
                onChange={(e) => setReceiveQuantity(Number(e.target.value))}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleReceiveMaterial} className="flex-1 bg-amber-600 hover:bg-amber-700">
                {t.save}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsReceiveDialogOpen(false)} 
                className="flex-1"
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

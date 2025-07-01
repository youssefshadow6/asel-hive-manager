
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RawMaterial } from "@/pages/Index";
import { toast } from "@/hooks/use-toast";

interface RawMaterialsManagerProps {
  materials: RawMaterial[];
  setMaterials: (materials: RawMaterial[]) => void;
  language: 'en' | 'ar';
}

export const RawMaterialsManager = ({ materials, setMaterials, language }: RawMaterialsManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    nameAr: '',
    unit: '',
    minThreshold: 0,
    initialStock: 0
  });
  const [receiveQuantity, setReceiveQuantity] = useState(0);

  const translations = {
    en: {
      rawMaterials: "Raw Materials",
      addMaterial: "Add New Material",
      receiveMaterial: "Receive Material",
      materialName: "Material Name (English)",
      materialNameAr: "Material Name (Arabic)",
      unit: "Unit (kg, pieces, sacks, etc.)",
      minThreshold: "Minimum Threshold",
      initialStock: "Initial Stock",
      currentStock: "Current Stock",
      lastReceived: "Last Received",
      lowStock: "Low Stock",
      actions: "Actions",
      receive: "Receive",
      add: "Add",
      cancel: "Cancel",
      quantity: "Quantity",
      save: "Save",
      materialAdded: "Material added successfully",
      materialReceived: "Material received successfully"
    },
    ar: {
      rawMaterials: "المواد الخام",
      addMaterial: "إضافة مادة جديدة",
      receiveMaterial: "استلام مادة",
      materialName: "اسم المادة (بالإنجليزية)",
      materialNameAr: "اسم المادة (بالعربية)",
      unit: "الوحدة (كيلو، قطعة، كيس، إلخ)",
      minThreshold: "الحد الأدنى",
      initialStock: "المخزون الابتدائي",
      currentStock: "المخزون الحالي",
      lastReceived: "آخر استلام",
      lowStock: "مخزون منخفض",
      actions: "الإجراءات",
      receive: "استلام",
      add: "إضافة",
      cancel: "إلغاء",
      quantity: "الكمية",
      save: "حفظ",
      materialAdded: "تم إضافة المادة بنجاح",
      materialReceived: "تم استلام المادة بنجاح"
    }
  };

  const t = translations[language];

  const addMaterial = () => {
    if (!newMaterial.name || !newMaterial.nameAr || !newMaterial.unit) {
      toast({
        title: language === 'en' ? "Error" : "خطأ",
        description: language === 'en' ? "Please fill all required fields" : "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const material: RawMaterial = {
      id: Date.now().toString(),
      name: newMaterial.name,
      nameAr: newMaterial.nameAr,
      unit: newMaterial.unit,
      currentStock: newMaterial.initialStock,
      minThreshold: newMaterial.minThreshold,
      lastReceived: new Date()
    };

    setMaterials([...materials, material]);
    setNewMaterial({ name: '', nameAr: '', unit: '', minThreshold: 0, initialStock: 0 });
    setIsAddDialogOpen(false);
    
    toast({
      title: language === 'en' ? "Success" : "نجح",
      description: t.materialAdded
    });
  };

  const receiveMaterial = () => {
    if (!selectedMaterial || receiveQuantity <= 0) return;

    const updatedMaterials = materials.map(material => 
      material.id === selectedMaterial.id 
        ? { 
            ...material, 
            currentStock: material.currentStock + receiveQuantity,
            lastReceived: new Date()
          }
        : material
    );

    setMaterials(updatedMaterials);
    setReceiveQuantity(0);
    setSelectedMaterial(null);
    setIsReceiveDialogOpen(false);
    
    toast({
      title: language === 'en' ? "Success" : "نجح",
      description: t.materialReceived
    });
  };

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
                  value={newMaterial.nameAr}
                  onChange={(e) => setNewMaterial({...newMaterial, nameAr: e.target.value})}
                  placeholder="عسل خام"
                />
              </div>
              <div>
                <Label htmlFor="unit">{t.unit}</Label>
                <Input
                  id="unit"
                  value={newMaterial.unit}
                  onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                  placeholder="kg"
                />
              </div>
              <div>
                <Label htmlFor="minThreshold">{t.minThreshold}</Label>
                <Input
                  id="minThreshold"
                  type="number"
                  value={newMaterial.minThreshold}
                  onChange={(e) => setNewMaterial({...newMaterial, minThreshold: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="initialStock">{t.initialStock}</Label>
                <Input
                  id="initialStock"
                  type="number"
                  value={newMaterial.initialStock}
                  onChange={(e) => setNewMaterial({...newMaterial, initialStock: Number(e.target.value)})}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={addMaterial} className="flex-1 bg-amber-600 hover:bg-amber-700">
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
                    {language === 'en' ? material.name : material.nameAr}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {language === 'en' ? material.nameAr : material.name}
                  </p>
                </div>
                {material.currentStock <= material.minThreshold && (
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
                    {material.currentStock} {material.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t.minThreshold}:</span>
                  <span className="text-sm">{material.minThreshold} {material.unit}</span>
                </div>
                {material.lastReceived && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t.lastReceived}:</span>
                    <span className="text-sm">
                      {material.lastReceived.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => {
                    setSelectedMaterial(material);
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
                  {language === 'en' ? selectedMaterial.name : selectedMaterial.nameAr}
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
              <Button onClick={receiveMaterial} className="flex-1 bg-amber-600 hover:bg-amber-700">
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

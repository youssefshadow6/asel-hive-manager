
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { RawMaterial, Product } from "@/pages/Index";

interface StockAlertsPanelProps {
  lowStockMaterials: RawMaterial[];
  lowStockProducts: Product[];
  language: 'en' | 'ar';
}

export const StockAlertsPanel = ({ 
  lowStockMaterials, 
  lowStockProducts, 
  language 
}: StockAlertsPanelProps) => {
  const translations = {
    en: {
      lowStockAlerts: "Low Stock Alerts",
      rawMaterials: "Raw Materials",
      products: "Products",
      currentStock: "Current Stock",
      threshold: "Threshold",
      noAlerts: "No low stock alerts"
    },
    ar: {
      lowStockAlerts: "تنبيهات نقص المخزون",
      rawMaterials: "المواد الخام",
      products: "المنتجات",
      currentStock: "المخزون الحالي",
      threshold: "الحد الأدنى",
      noAlerts: "لا توجد تنبيهات نقص مخزون"
    }
  };

  const t = translations[language];

  if (lowStockMaterials.length === 0 && lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          <span>{t.lowStockAlerts}</span>
          <Badge variant="destructive">
            {lowStockMaterials.length + lowStockProducts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Low Stock Raw Materials */}
          {lowStockMaterials.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                {t.rawMaterials}
              </h4>
              <div className="space-y-2">
                {lowStockMaterials.map((material) => (
                  <div key={material.id} className="bg-white p-3 rounded-lg border border-red-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-900">
                          {language === 'en' ? material.name : material.nameAr}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">({material.unit})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <span className="text-red-600 font-semibold">{material.currentStock}</span>
                          <span className="text-gray-500"> / {material.minThreshold}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Products */}
          {lowStockProducts.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                {t.products}
              </h4>
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="bg-white p-3 rounded-lg border border-red-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-900">
                          {language === 'en' ? product.name : product.nameAr}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">({product.size})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <span className="text-red-600 font-semibold">{product.currentStock}</span>
                          <span className="text-gray-500"> / {product.minThreshold}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

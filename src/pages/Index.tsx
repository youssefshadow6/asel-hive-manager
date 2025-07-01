
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, ShoppingCart, Factory, Bell, BarChart3 } from "lucide-react";
import { RawMaterialsManager } from "@/components/RawMaterialsManager";
import { ProductionManager } from "@/components/ProductionManager";
import { SalesManager } from "@/components/SalesManager";
import { StockAlertsPanel } from "@/components/StockAlertsPanel";

// Types for our inventory system
export interface RawMaterial {
  id: string;
  name: string;
  nameAr: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  lastReceived?: Date;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  size: string;
  currentStock: number;
  minThreshold: number;
}

export interface ProductionRecord {
  id: string;
  productId: string;
  quantity: number;
  date: Date;
  materials: { materialId: string; quantity: number }[];
}

export interface SaleRecord {
  id: string;
  productId: string;
  quantity: number;
  customerName: string;
  date: Date;
  price: number;
}

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Initial raw materials data
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([
    { id: '1', name: 'Raw Honey', nameAr: 'عسل خام', unit: 'kg', currentStock: 50, minThreshold: 10 },
    { id: '2', name: 'Sage Herbs', nameAr: 'أعشاب المرمية', unit: 'sacks', currentStock: 8, minThreshold: 2 },
    { id: '3', name: 'Glass Jars 500g', nameAr: 'برطمانات زجاج ٥٠٠ جم', unit: 'pieces', currentStock: 120, minThreshold: 20 },
    { id: '4', name: 'Lids', nameAr: 'أغطية', unit: 'pieces', currentStock: 100, minThreshold: 20 },
    { id: '5', name: 'Labels', nameAr: 'ملصقات', unit: 'pieces', currentStock: 80, minThreshold: 15 },
  ]);

  // Initial products data
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Honey Jar 500g', nameAr: 'برطمان عسل ٥٠٠ جم', size: '500g', currentStock: 25, minThreshold: 5 },
    { id: '2', name: 'Sage Tea Blend', nameAr: 'خليط شاي المرمية', size: '100g', currentStock: 15, minThreshold: 3 },
  ]);

  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);

  // Get low stock items
  const lowStockMaterials = rawMaterials.filter(material => material.currentStock <= material.minThreshold);
  const lowStockProducts = products.filter(product => product.currentStock <= product.minThreshold);

  const translations = {
    en: {
      title: "Honey & Herbs Business Manager",
      dashboard: "Dashboard",
      rawMaterials: "Raw Materials",
      production: "Production",
      sales: "Sales",
      currentStock: "Current Stock",
      lowStockAlerts: "Low Stock Alerts",
      totalValue: "Total Inventory Value",
      recentActivity: "Recent Activity",
      addMaterial: "Add Material",
      recordProduction: "Record Production",
      recordSale: "Record Sale",
      viewReports: "View Reports"
    },
    ar: {
      title: "نظام إدارة أعمال العسل والأعشاب",
      dashboard: "لوحة التحكم",
      rawMaterials: "المواد الخام",
      production: "الإنتاج",
      sales: "المبيعات",
      currentStock: "المخزون الحالي",
      lowStockAlerts: "تنبيهات نقص المخزون",
      totalValue: "إجمالي قيمة المخزون",
      recentActivity: "النشاط الأخير",
      addMaterial: "إضافة مادة",
      recordProduction: "تسجيل إنتاج",
      recordSale: "تسجيل بيع",
      viewReports: "عرض التقارير"
    }
  };

  const t = translations[language];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🍯</span>
              </div>
              <h1 className="text-xl font-bold text-amber-900">{t.title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {lowStockMaterials.length > 0 || lowStockProducts.length > 0 ? (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <Bell className="w-3 h-3" />
                  <span>{lowStockMaterials.length + lowStockProducts.length}</span>
                </Badge>
              ) : null}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                {language === 'en' ? 'العربية' : 'English'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { key: 'dashboard', label: t.dashboard, icon: BarChart3 },
              { key: 'materials', label: t.rawMaterials, icon: Package },
              { key: 'production', label: t.production, icon: Factory },
              { key: 'sales', label: t.sales, icon: ShoppingCart },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stock Alerts */}
            {(lowStockMaterials.length > 0 || lowStockProducts.length > 0) && (
              <StockAlertsPanel 
                lowStockMaterials={lowStockMaterials}
                lowStockProducts={lowStockProducts}
                language={language}
              />
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-amber-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-900">
                    {t.rawMaterials}
                  </CardTitle>
                  <Package className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-700">{rawMaterials.length}</div>
                  <p className="text-xs text-amber-600">
                    {lowStockMaterials.length} {language === 'en' ? 'low stock' : 'نقص مخزون'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-900">
                    {language === 'en' ? 'Products' : 'المنتجات'}
                  </CardTitle>
                  <Factory className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-700">{products.length}</div>
                  <p className="text-xs text-amber-600">
                    {products.reduce((sum, p) => sum + p.currentStock, 0)} {language === 'en' ? 'total units' : 'إجمالي الوحدات'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-900">
                    {language === 'en' ? 'Sales Today' : 'مبيعات اليوم'}
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-700">
                    {salesRecords.filter(sale => {
                      const today = new Date();
                      return sale.date.toDateString() === today.toDateString();
                    }).length}
                  </div>
                  <p className="text-xs text-amber-600">
                    {language === 'en' ? 'transactions' : 'معاملة'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Current Stock Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">{t.rawMaterials}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rawMaterials.slice(0, 5).map((material) => (
                      <div key={material.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-900">
                            {language === 'en' ? material.name : material.nameAr}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">({material.unit})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-amber-700">{material.currentStock}</span>
                          {material.currentStock <= material.minThreshold && (
                            <Badge variant="destructive" className="text-xs">
                              {language === 'en' ? 'Low' : 'قليل'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">
                    {language === 'en' ? 'Finished Products' : 'المنتجات الجاهزة'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div key={product.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-900">
                            {language === 'en' ? product.name : product.nameAr}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">({product.size})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-amber-700">{product.currentStock}</span>
                          {product.currentStock <= product.minThreshold && (
                            <Badge variant="destructive" className="text-xs">
                              {language === 'en' ? 'Low' : 'قليل'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <RawMaterialsManager 
            materials={rawMaterials}
            setMaterials={setRawMaterials}
            language={language}
          />
        )}

        {activeTab === 'production' && (
          <ProductionManager 
            rawMaterials={rawMaterials}
            setRawMaterials={setRawMaterials}
            products={products}
            setProducts={setProducts}
            productionRecords={productionRecords}
            setProductionRecords={setProductionRecords}
            language={language}
          />
        )}

        {activeTab === 'sales' && (
          <SalesManager 
            products={products}
            setProducts={setProducts}
            salesRecords={salesRecords}
            setSalesRecords={setSalesRecords}
            language={language}
          />
        )}
      </main>
    </div>
  );
};

export default Index;

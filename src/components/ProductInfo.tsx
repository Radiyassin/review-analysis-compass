
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Building } from 'lucide-react';

const ProductInfo = () => {
  const [productInfo, setProductInfo] = useState({
    'Product Name': '-',
    'Brand Name': '-',
    'Price': '-'
  });

  useEffect(() => {
    console.log('📦 ProductInfo: Component mounted, checking dataStore...');
    
    if (!window.dataStore) {
      console.log('📦 ProductInfo: DataStore not available yet');
      return;
    }

    // Get initial data
    const initialData = window.dataStore.getData('productInfo');
    console.log('📦 ProductInfo: Initial product data:', initialData);
    
    if (initialData) {
      setProductInfo(initialData);
    }

    // Subscribe to updates
    const unsubscribe = window.dataStore.subscribe((key, value) => {
      console.log('📦 ProductInfo: DataStore update:', key, value);
      if (key === 'productInfo') {
        console.log('📦 ProductInfo: Updating product info with:', value);
        setProductInfo(value);
      }
    });

    return () => {
      console.log('📦 ProductInfo: Cleaning up subscription');
      unsubscribe();
    };
  }, []);

  return (
    <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Package className="h-6 w-6 text-blue-600" />
          Product Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
            <Package className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Product Name</p>
              <p className="font-semibold text-gray-800">
                {productInfo['Product Name'] || '-'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
            <Building className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Brand Name</p>
              <p className="font-semibold text-gray-800">
                {productInfo['Brand Name'] || '-'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-semibold text-gray-800">
                {productInfo['Price'] || '-'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInfo;

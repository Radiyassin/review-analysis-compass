
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Building } from 'lucide-react';

const ProductInfo = () => {
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
                <span id="productName">-</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
            <Building className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Brand Name</p>
              <p className="font-semibold text-gray-800">
                <span id="brandName">-</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-semibold text-gray-800">
                <span id="price">-</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInfo;

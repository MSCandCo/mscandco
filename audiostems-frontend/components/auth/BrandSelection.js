import React from 'react';
import { BRAND_OPTIONS } from '@/lib/brand-config';

const BrandSelection = ({ selectedBrand, onBrandChange, error }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose Your Brand Affiliation *
      </label>
      <div className="space-y-3">
        {BRAND_OPTIONS.map((brand) => (
          <label
            key={brand.value}
            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedBrand === brand.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="brand"
              value={brand.value}
              checked={selectedBrand === brand.value}
              onChange={(e) => onBrandChange(e.target.value)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{brand.label}</div>
              <div className="text-sm text-gray-600 mt-1">{brand.description}</div>
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default BrandSelection; 
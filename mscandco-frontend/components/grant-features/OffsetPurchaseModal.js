'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function OffsetPurchaseModal({ carbonKg, onClose, onComplete }) {
  const supabase = createClientComponentClient();
  const [selectedProvider, setSelectedProvider] = useState('greenspark');
  const [selectedProject, setSelectedProject] = useState(null);
  const [processing, setProcessing] = useState(false);

  const providers = [
    {
      id: 'greenspark',
      name: 'Greenspark',
      logo: '🌍',
      pricePerTonne: 15,
      projects: [
        {
          id: 'forest-restoration',
          name: 'Tropical Forest Restoration',
          location: 'Brazil',
          type: 'Forestry',
          description: 'Support reforestation efforts in the Amazon rainforest',
        },
        {
          id: 'renewable-energy',
          name: 'Wind Energy Project',
          location: 'India',
          type: 'Renewable Energy',
          description: 'Investing in clean wind energy infrastructure',
        },
      ],
    },
    {
      id: 'ecologi',
      name: 'Ecologi',
      logo: '🌱',
      pricePerTonne: 14,
      projects: [
        {
          id: 'ocean-cleanup',
          name: 'Ocean Plastic Removal',
          location: 'Global',
          type: 'Ocean Protection',
          description: 'Remove plastic waste from oceans and coastlines',
        },
        {
          id: 'solar-energy',
          name: 'Solar Panel Installation',
          location: 'Kenya',
          type: 'Renewable Energy',
          description: 'Provide solar energy access to rural communities',
        },
      ],
    },
  ];

  const provider = providers.find((p) => p.id === selectedProvider);
  const costGBP = (carbonKg / 1000) * provider.pricePerTonne;

  async function handlePurchase() {
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }

    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Create offset transaction
      const { data, error } = await supabase
        .from('carbon_offset_transactions')
        .insert([
          {
            user_id: user.id,
            offset_provider: provider.name,
            offset_amount_kg: carbonKg,
            offset_cost_amount: costGBP,
            offset_cost_currency: 'GBP',
            offset_project_name: selectedProject.name,
            offset_project_type: selectedProject.type,
            offset_project_location: selectedProject.location,
            transaction_status: 'completed',
            verification_standard: 'Gold Standard',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update carbon tracking records
      // In production, you'd update specific release tracking records
      // For now, we'll just complete the transaction

      onComplete();
    } catch (error) {
      console.error('Error purchasing offset:', error);
      alert('Failed to complete purchase');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">
            Purchase Carbon Offset
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary */}
        <div className="bg-green-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-green-700">Carbon to Offset</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {carbonKg.toFixed(2)} kg
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700">Provider</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {provider.logo} {provider.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700">Total Cost</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                £{costGBP.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Select Provider</h4>
          <div className="grid grid-cols-2 gap-4">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProvider(p.id);
                  setSelectedProject(null);
                }}
                className={`p-4 border-2 rounded-lg text-left transition ${selectedProvider === p.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl">{p.logo}</p>
                    <p className="font-semibold text-gray-900 mt-2">{p.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      £{p.pricePerTonne}/tonne CO₂e
                    </p>
                  </div>
                  {selectedProvider === p.id && (
                    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Project Selection */}
        {provider && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Select Project</h4>
            <div className="space-y-3">
              {provider.projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition ${selectedProject?.id === project.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {project.location} • {project.type}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        {project.description}
                      </p>
                    </div>
                    {selectedProject?.id === project.id && (
                      <svg className="h-5 w-5 text-green-600 ml-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={!selectedProject || processing}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              `Purchase for £${costGBP.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

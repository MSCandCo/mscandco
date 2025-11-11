'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ClearanceForm({ releaseId, verificationId, onClose, onSubmit }) {
  const supabase = createClientComponentClient();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    original_work_title: '',
    original_artist: '',
    clearance_type: 'sample',
    license_holder: '',
    license_contact_email: '',
    license_agreement_url: '',
    percentage_used: '',
    notes: '',
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('copyright_clearances')
        .insert([
          {
            release_id: releaseId,
            user_id: user.id,
            verification_id: verificationId,
            ...formData,
            clearance_status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      onSubmit();
    } catch (error) {
      console.error('Error submitting clearance:', error);
      alert('Failed to submit clearance');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Submit Copyright Clearance
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Original Work Title *
              </label>
              <input
                type="text"
                required
                value={formData.original_work_title}
                onChange={(e) =>
                  setFormData({ ...formData, original_work_title: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Original Artist *
              </label>
              <input
                type="text"
                required
                value={formData.original_artist}
                onChange={(e) =>
                  setFormData({ ...formData, original_artist: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Clearance Type *
            </label>
            <select
              value={formData.clearance_type}
              onChange={(e) =>
                setFormData({ ...formData, clearance_type: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="sample">Sample</option>
              <option value="interpolation">Interpolation</option>
              <option value="cover">Cover</option>
              <option value="remix">Remix</option>
              <option value="derivative_work">Derivative Work</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                License Holder
              </label>
              <input
                type="text"
                value={formData.license_holder}
                onChange={(e) =>
                  setFormData({ ...formData, license_holder: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                License Contact Email
              </label>
              <input
                type="email"
                value={formData.license_contact_email}
                onChange={(e) =>
                  setFormData({ ...formData, license_contact_email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              License Agreement URL
            </label>
            <input
              type="url"
              value={formData.license_agreement_url}
              onChange={(e) =>
                setFormData({ ...formData, license_agreement_url: e.target.value })
              }
              placeholder="https://"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Percentage Used (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.percentage_used}
              onChange={(e) =>
                setFormData({ ...formData, percentage_used: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Additional information about this clearance..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Clearance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

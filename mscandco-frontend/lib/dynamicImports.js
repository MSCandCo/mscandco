/**
 * Dynamic Import Utilities
 *
 * Pre-configured dynamic imports for common heavy components
 * Reduces initial bundle size by loading components on demand
 */

import dynamic from 'next/dynamic'

// Chart Components (40-60% of bundle size reduction)
export const DynamicChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Chart), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>,
  ssr: false,
})

export const DynamicLine = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>,
  ssr: false,
})

export const DynamicBar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>,
  ssr: false,
})

export const DynamicPie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>,
  ssr: false,
})

export const DynamicDoughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>,
  ssr: false,
})

// Recharts Components
export const DynamicLineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>,
  ssr: false,
})

export const DynamicBarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>,
  ssr: false,
})

export const DynamicPieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>,
  ssr: false,
})

// Audio/Video Components (large file size)
export const DynamicAudioPlayer = dynamic(() => import('react-player'), {
  loading: () => <div className="animate-pulse h-16 bg-gray-200 rounded">Loading player...</div>,
  ssr: false,
})

// Excel/Export Components (heavy dependencies)
export const DynamicExcelExport = dynamic(() => import('@/components/export/ExcelExport'), {
  loading: () => <button disabled className="opacity-50">Loading export...</button>,
  ssr: false,
})

// Image Crop/Editor Components
export const DynamicImageCrop = dynamic(() => import('react-image-crop'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded">Loading editor...</div>,
  ssr: false,
})

// QR Code Generator
export const DynamicQRCode = dynamic(() => import('qrcode').then(mod => mod), {
  loading: () => <div className="animate-pulse h-32 w-32 bg-gray-200 rounded"></div>,
  ssr: false,
})

// Rich Text Editor (if you have one)
export const DynamicRichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded">Loading editor...</div>,
  ssr: false,
})

// Calendar Components
export const DynamicCalendar = dynamic(() => import('@/components/Calendar'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-200 rounded">Loading calendar...</div>,
  ssr: false,
})

// Data Table Components (heavy with features)
export const DynamicDataTable = dynamic(() => import('@/components/DataTable'), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded"></div>
      ))}
    </div>
  ),
  ssr: false,
})

/**
 * Helper function to create custom dynamic imports with consistent loading state
 */
export function createDynamicImport(
  importFn,
  options = {}
) {
  return dynamic(importFn, {
    loading: options.loading || (() => <div className="animate-pulse h-32 bg-gray-200 rounded">Loading...</div>),
    ssr: options.ssr !== undefined ? options.ssr : false,
    ...options,
  })
}

/**
 * Example usage:
 *
 * // Instead of:
 * import { Bar } from 'react-chartjs-2'
 *
 * // Use:
 * import { DynamicBar } from '@/lib/dynamicImports'
 *
 * function MyComponent() {
 *   return <DynamicBar data={chartData} />
 * }
 */

'use client'

import React, { useState } from 'react';
import { Button, Dropdown } from 'flowbite-react';
import { HiDownload, HiDocumentText, HiTable, HiChartBar, HiCog } from 'react-icons/hi';
import { APIExportManager, PDFExportManager, ExcelExportManager } from '@/lib/export-utils';

const ExportButton = ({ 
  userRole, 
  exportType, 
  data, 
  columns, 
  filters = {}, 
  onExportStart, 
  onExportComplete, 
  onExportError,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const apiManager = new APIExportManager(userRole, process.env.NEXT_PUBLIC_API_URL);
  const pdfManager = new PDFExportManager(userRole);
  const excelManager = new ExcelExportManager(userRole);

  const handleExport = async (format, type = 'detailed') => {
    if (isExporting) return;

    setIsExporting(true);
    onExportStart?.();

    try {
      switch (exportType) {
        case 'creations':
          await apiManager.exportCreations({
            format,
            filters,
            columns: type === 'detailed' ? columns : columns.slice(0, 5),
            type
          });
          break;

        case 'earnings':
          await apiManager.exportEarnings({
            format,
            month: data?.month,
            year: data?.year,
            type
          });
          break;

        case 'analytics':
          await apiManager.exportAnalytics({
            format,
            reportType: data?.reportType || 'platform',
            dateRange: data?.dateRange || {},
            type
          });
          break;

        case 'projects':
          await apiManager.exportProjects({
            format,
            filters,
            type
          });
          break;

        default:
          // Local export for simple data
          if (format === 'pdf') {
            pdfManager.exportTableToPDF(
              data,
              type === 'detailed' ? columns : columns.slice(0, 5),
              `msc-${exportType}-export-${new Date().toISOString().slice(0, 10)}.pdf`,
              `${exportType.charAt(0).toUpperCase() + exportType.slice(1)} Export`
            );
          } else {
            await excelManager.exportToExcel(
              data,
              type === 'detailed' ? columns : columns.slice(0, 5),
              `msc-${exportType}-export-${new Date().toISOString().slice(0, 10)}.xlsx`
            );
          }
      }

      onExportComplete?.();
    } catch (error) {
      console.error('Export error:', error);
      onExportError?.(error.message);
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  const getExportOptions = () => {
    const baseOptions = [
      {
        label: 'Export as Excel (Basic)',
        format: 'excel',
        type: 'basic',
        icon: HiTable
      },
      {
        label: 'Export as Excel (Detailed)',
        format: 'excel',
        type: 'detailed',
        icon: HiTable
      },
      {
        label: 'Export as PDF (Basic)',
        format: 'pdf',
        type: 'basic',
        icon: HiDocumentText
      },
      {
        label: 'Export as PDF (Detailed)',
        format: 'pdf',
        type: 'detailed',
        icon: HiDocumentText
      }
    ];

    // Add role-specific options
    if (['super_admin', 'company_admin'].includes(userRole)) {
      baseOptions.push({
        label: 'Export as Analytics Report',
        format: 'pdf',
        type: 'analytics',
        icon: HiChartBar
      });
    }

    return baseOptions;
  };

  const exportOptions = getExportOptions();

  return (
    <div className={`relative ${className}`}>
      <Dropdown
        label={
          <Button
            color={variant}
            size={size}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <HiDownload className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        }
        dismissOnClick={false}
        className="w-64"
      >
        <Dropdown.Header>
          <span className="block text-sm font-medium text-gray-900">
            Export Options
          </span>
          <span className="block truncate text-sm text-gray-500">
            Choose format and detail level
          </span>
        </Dropdown.Header>

        {exportOptions.map((option, index) => (
          <Dropdown.Item
            key={index}
            icon={option.icon}
            onClick={() => handleExport(option.format, option.type)}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {option.label}
          </Dropdown.Item>
        ))}

        {['super_admin', 'company_admin'].includes(userRole) && (
          <>
            <Dropdown.Divider />
            <Dropdown.Item
              icon={HiCog}
              onClick={() => alert('Export settings will be available in the next update!')}
              className="text-blue-600"
            >
              Export Settings
            </Dropdown.Item>
          </>
        )}
      </Dropdown>
    </div>
  );
};

export default ExportButton; 
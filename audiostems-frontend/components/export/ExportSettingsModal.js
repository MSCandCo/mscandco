import React, { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput, Select, Checkbox, Tabs } from 'flowbite-react';
import { HiCog, HiSave, HiTrash, HiEye, HiDownload } from 'react-icons/hi';

const ExportSettingsModal = ({ 
  show, 
  onClose, 
  exportType, 
  availableColumns = [], 
  currentFilters = {},
  onSaveTemplate,
  onExport,
  userRole 
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    format: 'excel',
    detailLevel: 'detailed',
    selectedColumns: availableColumns.map(col => col.key),
    dateRange: {
      start: '',
      end: ''
    },
    filters: currentFilters,
    includeCharts: true,
    includeSummary: true,
    watermark: false,
    branding: true,
    filename: `msc-${exportType}-export`,
    templateName: ''
  });

  const [savedTemplates, setSavedTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      loadSavedTemplates();
    }
  }, [show]);

  const loadSavedTemplates = async () => {
    try {
      const response = await fetch('/api/export/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const templates = await response.json();
        setSavedTemplates(templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSaveTemplate = async () => {
    if (!settings.templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/export/templates/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: settings.templateName,
          exportType,
          settings
        })
      });

      if (response.ok) {
        await loadSavedTemplates();
        setSettings(prev => ({ ...prev, templateName: '' }));
        alert('Template saved successfully!');
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTemplate = (template) => {
    setSettings({
      ...settings,
      ...template.settings,
      templateName: template.name
    });
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      await onExport(settings);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateColumnSelection = (columnKey, selected) => {
    setSettings(prev => ({
      ...prev,
      selectedColumns: selected
        ? [...prev.selectedColumns, columnKey]
        : prev.selectedColumns.filter(col => col !== columnKey)
    }));
  };

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <Modal.Header>
        <div className="flex items-center gap-2">
          <HiCog className="h-5 w-5" />
          Export Settings
        </div>
      </Modal.Header>

      <Modal.Body>
        <Tabs.Group style="underline" onActiveTabChange={(tab) => setActiveTab(tab)}>
          <Tabs.Item title="General" icon={HiCog}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="format">Export Format</Label>
                  <Select
                    id="format"
                    value={settings.format}
                    onChange={(e) => updateSettings('format', e.target.value)}
                  >
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="pdf">PDF (.pdf)</option>
                    <option value="csv">CSV (.csv)</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="detailLevel">Detail Level</Label>
                  <Select
                    id="detailLevel"
                    value={settings.detailLevel}
                    onChange={(e) => updateSettings('detailLevel', e.target.value)}
                  >
                    <option value="basic">Basic</option>
                    <option value="detailed">Detailed</option>
                    <option value="comprehensive">Comprehensive</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filename">Filename</Label>
                  <TextInput
                    id="filename"
                    value={settings.filename}
                    onChange={(e) => updateSettings('filename', e.target.value)}
                    placeholder="Enter filename"
                  />
                </div>

                <div>
                  <Label htmlFor="dateRange">Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput
                      type="date"
                      value={settings.dateRange.start}
                      onChange={(e) => updateSettings('dateRange', {
                        ...settings.dateRange,
                        start: e.target.value
                      })}
                    />
                    <TextInput
                      type="date"
                      value={settings.dateRange.end}
                      onChange={(e) => updateSettings('dateRange', {
                        ...settings.dateRange,
                        end: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">Export Options</h4>
                <div className="space-y-3">
                  <Checkbox
                    id="includeCharts"
                    checked={settings.includeCharts}
                    onChange={(e) => updateSettings('includeCharts', e.target.checked)}
                  >
                    Include charts and graphs
                  </Checkbox>
                  <Checkbox
                    id="includeSummary"
                    checked={settings.includeSummary}
                    onChange={(e) => updateSettings('includeSummary', e.target.checked)}
                  >
                    Include summary page
                  </Checkbox>
                  <Checkbox
                    id="watermark"
                    checked={settings.watermark}
                    onChange={(e) => updateSettings('watermark', e.target.checked)}
                  >
                    Add watermark
                  </Checkbox>
                  <Checkbox
                    id="branding"
                    checked={settings.branding}
                    onChange={(e) => updateSettings('branding', e.target.checked)}
                  >
                    Include company branding
                  </Checkbox>
                </div>
              </div>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Columns" icon={HiEye}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">Select Columns</h4>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    color="gray"
                    onClick={() => updateSettings('selectedColumns', availableColumns.map(col => col.key))}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    color="gray"
                    onClick={() => updateSettings('selectedColumns', [])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableColumns.map((column) => (
                  <Checkbox
                    key={column.key}
                    id={column.key}
                    checked={settings.selectedColumns.includes(column.key)}
                    onChange={(e) => updateColumnSelection(column.key, e.target.checked)}
                  >
                    <div>
                      <div className="font-medium">{column.header}</div>
                      <div className="text-sm text-gray-500">{column.key}</div>
                    </div>
                  </Checkbox>
                ))}
              </div>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Templates" icon={HiSave}>
            <div className="space-y-6">
              <div>
                <Label htmlFor="templateName">Save as Template</Label>
                <div className="flex gap-2">
                  <TextInput
                    id="templateName"
                    value={settings.templateName}
                    onChange={(e) => updateSettings('templateName', e.target.value)}
                    placeholder="Enter template name"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={isLoading || !settings.templateName.trim()}
                    size="sm"
                  >
                    <HiSave className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4">Saved Templates</h4>
                <div className="space-y-2">
                  {savedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">
                          {template.exportType} • {template.settings.format.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="gray"
                          onClick={() => handleLoadTemplate(template)}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          color="failure"
                          onClick={() => {/* TODO: Delete template */}}
                        >
                          <HiTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {savedTemplates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No saved templates found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Preview" icon={HiEye}>
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Export Preview</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div><strong>Format:</strong> {settings.format.toUpperCase()}</div>
                  <div><strong>Detail Level:</strong> {settings.detailLevel}</div>
                  <div><strong>Columns:</strong> {settings.selectedColumns.length} selected</div>
                  <div><strong>Date Range:</strong> {settings.dateRange.start} to {settings.dateRange.end}</div>
                  <div><strong>Filename:</strong> {settings.filename}.{settings.format}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium">Selected Columns:</h5>
                <div className="flex flex-wrap gap-2">
                  {settings.selectedColumns.map((columnKey) => {
                    const column = availableColumns.find(col => col.key === columnKey);
                    return (
                      <span
                        key={columnKey}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {column?.header || columnKey}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </Tabs.Item>
        </Tabs.Group>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-between w-full">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              color="blue"
              onClick={handleExport}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <HiDownload className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportSettingsModal; 
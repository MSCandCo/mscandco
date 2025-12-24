/**
 * Grid Layout Utilities
 * Handles 12-column grid calculations and responsive breakpoints
 */

// Width configurations (based on 12-column grid)
export const GRID_WIDTHS = {
  '1/4': 3,    // 3 columns (25%)
  '1/3': 4,    // 4 columns (33.33%)
  '1/2': 6,    // 6 columns (50%)
  '2/3': 8,    // 8 columns (66.66%)
  '3/4': 9,    // 9 columns (75%)
  'full': 12   // 12 columns (100%)
};

// Height configurations
export const GRID_HEIGHTS = {
  'auto': 'auto',
  'small': '150px',
  'medium': '300px',
  'large': '450px',
  'xlarge': '600px'
};

/**
 * Convert width string to grid columns
 */
export function getGridColumns(widthString) {
  return GRID_WIDTHS[widthString] || 3; // Default to 1/4
}

/**
 * Convert grid columns to Tailwind classes
 */
export function getColumnSpanClass(columns) {
  const spanMap = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12'
  };

  return spanMap[columns] || 'col-span-3';
}

/**
 * Calculate grid layout from widgets
 * Automatically positions widgets in a 12-column grid
 */
export function calculateGridLayout(widgets) {
  const layout = [];
  let currentRow = 1;
  let currentColumn = 1;
  const GRID_COLUMNS = 12;

  widgets.forEach((widget, index) => {
    const widthCols = getGridColumns(widget.default_width);

    // Check if widget fits in current row
    if (currentColumn + widthCols > GRID_COLUMNS + 1) {
      // Move to next row
      currentRow++;
      currentColumn = 1;
    }

    layout.push({
      widget,
      grid_column_start: currentColumn,
      grid_column_span: widthCols,
      grid_row: currentRow,
      display_order: index,
      is_visible: true
    });

    // Update current column position
    currentColumn += widthCols;
  });

  return layout;
}

/**
 * Convert layout item to CSS grid styles
 */
export function getGridItemStyle(layoutItem) {
  return {
    gridColumnStart: layoutItem.grid_column_start,
    gridColumnEnd: `span ${layoutItem.grid_column_span}`,
    gridRow: layoutItem.grid_row
  };
}

/**
 * Get responsive column span based on screen size
 * Mobile: Full width, Tablet: Adjust, Desktop: As configured
 */
export function getResponsiveColumnSpan(columns, screenSize = 'desktop') {
  if (screenSize === 'mobile') {
    return 12; // Full width on mobile
  }

  if (screenSize === 'tablet') {
    // On tablet, limit to max 6 columns unless full width
    if (columns === 12) return 12;
    if (columns > 6) return 6;
    return columns;
  }

  return columns; // Desktop: use as configured
}

/**
 * Calculate row span based on height
 */
export function getRowSpan(height) {
  const rowMap = {
    'auto': 1,
    'small': 1,
    'medium': 2,
    'large': 3,
    'xlarge': 4
  };

  return rowMap[height] || 1;
}

/**
 * Validate layout (ensure no overlaps, valid positions)
 */
export function validateLayout(layout) {
  const errors = [];
  const GRID_COLUMNS = 12;

  layout.forEach((item, index) => {
    // Check column bounds
    if (item.grid_column_start < 1) {
      errors.push(`Item ${index}: Column start must be >= 1`);
    }

    if (item.grid_column_start + item.grid_column_span > GRID_COLUMNS + 1) {
      errors.push(`Item ${index}: Exceeds grid width (${GRID_COLUMNS} columns)`);
    }

    // Check row bounds
    if (item.grid_row < 1) {
      errors.push(`Item ${index}: Row must be >= 1`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Reflow layout after widget removal
 * Recalculates positions to remove gaps
 */
export function reflowLayout(layout) {
  if (!layout || layout.length === 0) return [];

  const sorted = [...layout].sort((a, b) => {
    if (a.grid_row !== b.grid_row) return a.grid_row - b.grid_row;
    return a.grid_column_start - b.grid_column_start;
  });

  return calculateGridLayout(sorted.map(item => item.widget));
}

/**
 * Get widget dimensions for display
 */
export function getWidgetDimensions(widget) {
  const columns = getGridColumns(widget.default_width);
  const percentageWidth = (columns / 12) * 100;

  return {
    columns,
    percentageWidth: `${percentageWidth}%`,
    tailwindClass: getColumnSpanClass(columns),
    height: GRID_HEIGHTS[widget.default_height] || 'auto'
  };
}

/**
 * Calculate optimal layout for given widgets
 * Tries to balance rows and minimize gaps
 */
export function optimizeLayout(widgets) {
  if (!widgets || widgets.length === 0) return [];

  // Sort widgets by width (larger first) for better packing
  const sortedWidgets = [...widgets].sort((a, b) => {
    const aWidth = getGridColumns(a.default_width);
    const bWidth = getGridColumns(b.default_width);
    return bWidth - aWidth;
  });

  return calculateGridLayout(sortedWidgets);
}

/**
 * Check if two widgets overlap
 */
export function doWidgetsOverlap(item1, item2) {
  // Same row?
  if (item1.grid_row !== item2.grid_row) return false;

  // Check column overlap
  const item1End = item1.grid_column_start + item1.grid_column_span;
  const item2End = item2.grid_column_start + item2.grid_column_span;

  return !(item1End <= item2.grid_column_start || item2End <= item1.grid_column_start);
}

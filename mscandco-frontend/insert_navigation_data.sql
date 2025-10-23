-- Insert navigation menu items

-- Users & Access (4 pages)
INSERT INTO navigation_menus (category, title, url, icon, display_order, required_permission) VALUES
('users_access', 'User Management', '/admin/usermanagement', 'Users', 1, 'user:read:any'),
('users_access', 'Permissions & Roles', '/superadmin/permissionsroles', 'Shield', 2, '*:*:*'),
('users_access', 'Requests', '/admin/requests', 'FileText', 3, 'request:read:any'),
('users_access', 'Ghost Mode', '/superadmin/ghostlogin', 'Ghost', 4, '*:*:*');

-- Analytics (2 pages)
INSERT INTO navigation_menus (category, title, url, icon, display_order, required_permission) VALUES
('analytics', 'Performance Analytics', '/admin/platformanalytics', 'TrendingUp', 1, 'analytics:read:any'),
('analytics', 'Analytics Management', '/admin/analyticsmanagement', 'Settings', 2, 'analytics:manage:any');

-- Finance (3 pages)
INSERT INTO navigation_menus (category, title, url, icon, display_order, required_permission) VALUES
('finance', 'Earnings Management', '/admin/earningsmanagement', 'DollarSign', 1, 'earnings:read:any'),
('finance', 'Wallet Management', '/admin/walletmanagement', 'Wallet', 2, 'wallet:manage:any'),
('finance', 'Split Configuration', '/admin/splitconfiguration', 'PieChart', 3, 'split:manage:any');

-- Content (2 pages)
INSERT INTO navigation_menus (category, title, url, icon, display_order, required_permission) VALUES
('content', 'Asset Library', '/admin/assetlibrary', 'FolderOpen', 1, 'asset:read:any'),
('content', 'Master Roster', '/admin/masterroster', 'List', 2, 'roster:read:any');

-- Distribution (3 pages)
INSERT INTO navigation_menus (category, title, url, icon, display_order, required_permission) VALUES
('distribution', 'Distribution Hub', '/distribution/hub', 'Truck', 1, 'distribution:read:any'),
('distribution', 'Revenue Reporting', '/distribution/revenue', 'BarChart', 2, 'distribution:read:any'),
('distribution', 'Workflow Management', '/distribution/workflow', 'GitBranch', 3, 'distribution:manage:any');

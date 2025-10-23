-- Fix the Permissions & Roles navigation URL
UPDATE navigation_menus 
SET url = '/superadmin/permissionsroles' 
WHERE url = '/superadmin/permissions' 
  AND title = 'Permissions & Roles';

import { useState, useEffect } from 'react';

export default function useNavigationMenus() {
  const [menus, setMenus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch('/api/navigation/menus');
        const data = await response.json();

        if (data.success) {
          setMenus(data.menus);
        } else {
          setError(data.error || 'Failed to fetch menus');
        }
      } catch (err) {
        console.error('Error fetching navigation menus:', err);
        setError('Failed to fetch navigation menus');
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return { menus, loading, error };
}

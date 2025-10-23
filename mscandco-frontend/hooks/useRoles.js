import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Custom hook to fetch and manage roles from the API
 * Single source of truth for all role-related data
 */
export function useRoles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error('No authentication token')
      }

      // Fetch roles from API
      const response = await fetch('/api/admin/roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch roles')
      }

      const data = await response.json()

      // Format roles with display names
      const formattedRoles = (data.roles || []).map(role => ({
        id: role.id,
        name: role.name,
        display_name: formatRoleName(role.name),
        description: role.description,
        is_system_role: role.is_system_role
      }))

      setRoles(formattedRoles)
    } catch (err) {
      console.error('Error fetching roles:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatRoleName = (roleName) => {
    if (!roleName) return 'No Role'

    // Special handling for labeladmin
    if (roleName === 'labeladmin') {
      return 'Label Admin'
    }

    // Replace underscores with spaces and capitalize each word
    return roleName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
    formatRoleName
  }
}

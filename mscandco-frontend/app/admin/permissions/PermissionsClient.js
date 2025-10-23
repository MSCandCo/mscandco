'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, Plus, Edit2, Trash2, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function PermissionsClient({ user }) {
  const supabase = createClient()

  const [permissions, setPermissions] = useState([])
  const [roles, setRoles] = useState([])
  const [filteredPermissions, setFilteredPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const filtered = permissions.filter(perm =>
      perm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPermissions(filtered)
  }, [searchTerm, permissions])

  const loadData = async () => {
    setLoading(true)
    try {
      const [permsRes, rolesRes] = await Promise.all([
        supabase.from('permissions').select('*').order('name'),
        supabase.from('roles').select('*').order('name')
      ])

      if (permsRes.error) throw permsRes.error
      if (rolesRes.error) throw rolesRes.error

      setPermissions(permsRes.data || [])
      setRoles(rolesRes.data || [])
      setFilteredPermissions(permsRes.data || [])
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this permission?')) return

    try {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (err) {
      console.error('Error deleting permission:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-gray-700" />
            Permissions
          </h1>
          <p className="mt-2 text-gray-600">Manage platform permissions and access control</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Permission
        </Button>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {roles.map(role => (
          <div key={role.id} className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-gray-500">{role.name}</span>
            </div>
            <h3 className="font-semibold text-gray-900">{role.display_name || role.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
          </div>
        ))}
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{perm.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{perm.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {perm.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex space-x-2 justify-end">
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(perm.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}








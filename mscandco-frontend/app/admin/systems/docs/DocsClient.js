'use client'

import { useState, useEffect } from 'react'
import { Book, FileText, Code, Search, ExternalLink, ChevronRight, Folder, File } from 'lucide-react'
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function DocsClient() {
  const [docs, setDocs] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocs()
    fetchCategories()
  }, [selectedCategory])

  const fetchDocs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      
      const response = await fetch(`/api/admin/systems/docs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDocs(data.docs || [])
      }
    } catch (error) {
      console.error('Failed to fetch docs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/systems/docs/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'API':
        return <Code className="w-5 h-5 text-blue-600" />
      case 'Guides':
        return <Book className="w-5 h-5 text-green-600" />
      case 'Reference':
        return <FileText className="w-5 h-5 text-purple-600" />
      default:
        return <File className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documentation Hub</h1>
            <p className="text-gray-600 mt-1">Access system documentation and API references</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D2D2D] focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#2D2D2D] text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Documentation
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.name
                  ? 'bg-[#2D2D2D] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {getCategoryIcon(category.name)}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Documentation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D2D2D]"></div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Book className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No documentation found</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {getCategoryIcon(doc.category)}
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {doc.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Updated {new Date(doc.updated_at).toLocaleDateString()}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Code className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">API Reference</h3>
          </div>
          <p className="text-sm text-blue-800 mb-4">
            Complete API documentation with endpoints, parameters, and examples
          </p>
          <a
            href="/api/docs"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View API Docs
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Book className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">User Guides</h3>
          </div>
          <p className="text-sm text-green-800 mb-4">
            Step-by-step guides for common tasks and workflows
          </p>
          <a
            href="/guides"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-800"
          >
            Browse Guides
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">Technical Reference</h3>
          </div>
          <p className="text-sm text-purple-800 mb-4">
            Detailed technical specifications and architecture documentation
          </p>
          <a
            href="/reference"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800"
          >
            View Reference
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Doc Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(selectedDoc.category)}
                  <h3 className="text-2xl font-bold text-gray-900">{selectedDoc.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {selectedDoc.category}
                </span>
              </div>
              <p className="text-gray-700 mb-6">{selectedDoc.description}</p>
              {selectedDoc.content && (
                <div className="prose max-w-none">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedDoc.content}
                    </pre>
                  </div>
                </div>
              )}
              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <span>Last updated: {new Date(selectedDoc.updated_at).toLocaleDateString()}</span>
                {selectedDoc.url && (
                  <a
                    href={selectedDoc.url}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    View Full Documentation
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


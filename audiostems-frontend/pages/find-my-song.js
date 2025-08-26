import { useState } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layouts/MainLayout'
import Container from '@/components/Container'
import { Button } from 'flowbite-react'

export default function FindMySong() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    artistName: '',
    request: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.request) {
      alert('Please fill in all required fields (First Name, Last Name, and More about your request)')
      return
    }

    setIsSubmitting(true)

    try {
      // Here you would typically send to your API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitted(true)
    } catch (error) {
      alert('There was an error submitting your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <MainLayout>
        <Container>
          <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
                <p className="text-gray-600">
                  Thank you for your song request. We'll have it delivered to your account within 7 business days.
                </p>
              </div>
              <Button 
                onClick={() => router.push('/')}
                className="w-full bg-[#1f2937] hover:bg-[#374151] text-white"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Container>
        <div className="min-h-screen py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Find My Song</h1>
              <p className="text-lg text-gray-600">
                Can't find the perfect song? Let us help you locate it and have it delivered to your account within 7 business days.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937]"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937]"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="artistName" className="block text-sm font-medium text-gray-700 mb-2">
                    Artist Name <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="artistName"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937]"
                    placeholder="Enter the artist name (if known)"
                  />
                </div>

                <div>
                  <label htmlFor="request" className="block text-sm font-medium text-gray-700 mb-2">
                    More about your request <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="request"
                    name="request"
                    value={formData.request}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937]"
                    placeholder="Please provide as much detail as possible about the song you're looking for (title, lyrics, genre, year, etc.)"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    onClick={() => router.push('/')}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1f2937] hover:bg-[#374151] text-white px-8"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                * Required fields. We'll review your request and deliver the song to your account within 7 business days.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </MainLayout>
  )
}

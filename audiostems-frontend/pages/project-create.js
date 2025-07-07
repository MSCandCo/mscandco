import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { 
  ArrowLeft,
  Save,
  Upload,
  Music,
  Image,
  FileText,
  Users,
  Calendar,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const ProjectCreateSchema = Yup.object().shape({
  projectName: Yup.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be less than 100 characters')
    .required('Project name is required'),
  releaseType: Yup.string()
    .required('Release type is required'),
  expectedReleaseDate: Yup.date()
    .min(new Date(), 'Expected release date must be in the future')
    .required('Expected release date is required'),
  priority: Yup.string()
    .required('Priority is required'),
  budget: Yup.number()
    .min(0, 'Budget must be positive')
    .nullable(),
  credits: Yup.string()
    .max(1000, 'Credits must be less than 1000 characters'),
  publishingNotes: Yup.string()
    .max(2000, 'Publishing notes must be less than 2000 characters'),
  feedback: Yup.string()
    .max(2000, 'Feedback must be less than 2000 characters'),
  marketingPlan: Yup.string()
    .max(2000, 'Marketing plan must be less than 2000 characters')
});

const ProjectCreatePage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({
    musicFiles: [],
    artwork: null
  });

  useEffect(() => {
    if (session) {
      fetchArtists();
      fetchGenres();
    }
  }, [session]);

  const fetchArtists = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/artists`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      setArtists(response.data.data || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/genres`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      setGenres(response.data.data || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleFileUpload = async (files, type) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, formData, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (type === 'musicFiles') {
        setUploadedFiles(prev => ({
          ...prev,
          musicFiles: [...prev.musicFiles, ...response.data]
        }));
      } else if (type === 'artwork') {
        setUploadedFiles(prev => ({
          ...prev,
          artwork: response.data[0]
        }));
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setLoading(true);
    
    try {
      const projectData = {
        ...values,
        musicFiles: uploadedFiles.musicFiles.map(file => file.id),
        artwork: uploadedFiles.artwork?.id,
        lastUpdated: new Date().toISOString()
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
        data: projectData
      }, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });

      router.push(`/projects/${response.data.data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error.message });
      } else {
        setErrors({ submit: 'An error occurred while creating the project' });
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const initialValues = {
    projectName: '',
    releaseType: '',
    expectedReleaseDate: '',
    priority: 'medium',
    budget: '',
    credits: '',
    publishingNotes: '',
    feedback: '',
    marketingPlan: '',
    targetMarkets: [],
    distributionChannels: [],
    tags: []
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600 mt-2">Set up your new music project or release</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md">
          <Formik
            initialValues={initialValues}
            validationSchema={ProjectCreateSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting }) => (
              <Form className="p-8 space-y-8">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name *
                      </label>
                      <Field
                        name="projectName"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter project name"
                      />
                      <ErrorMessage name="projectName" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Release Type *
                      </label>
                      <Field
                        name="releaseType"
                        as="select"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select release type</option>
                        <option value="single">Single</option>
                        <option value="ep">EP</option>
                        <option value="album">Album</option>
                        <option value="mixtape">Mixtape</option>
                        <option value="compilation">Compilation</option>
                        <option value="soundtrack">Soundtrack</option>
                        <option value="remix_album">Remix Album</option>
                        <option value="live_album">Live Album</option>
                        <option value="demo">Demo</option>
                      </Field>
                      <ErrorMessage name="releaseType" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Release Date *
                      </label>
                      <Field
                        name="expectedReleaseDate"
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="expectedReleaseDate" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority *
                      </label>
                      <Field
                        name="priority"
                        as="select"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </Field>
                      <ErrorMessage name="priority" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget (USD)
                      </label>
                      <Field
                        name="budget"
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                      <ErrorMessage name="budget" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                </div>

                {/* File Uploads */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Files & Media</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Music Files
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          accept="audio/*"
                          onChange={(e) => handleFileUpload(e.target.files, 'musicFiles')}
                          className="hidden"
                          id="music-files"
                        />
                        <label htmlFor="music-files" className="cursor-pointer">
                          <Music className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload music files</p>
                          <p className="text-xs text-gray-500 mt-1">MP3, WAV, FLAC up to 100MB each</p>
                        </label>
                      </div>
                      {uploadedFiles.musicFiles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Uploaded files:</p>
                          <ul className="text-xs text-gray-500 mt-1">
                            {uploadedFiles.musicFiles.map((file, index) => (
                              <li key={index}>{file.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Artwork
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e.target.files, 'artwork')}
                          className="hidden"
                          id="artwork"
                        />
                        <label htmlFor="artwork" className="cursor-pointer">
                          <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload artwork</p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
                        </label>
                      </div>
                      {uploadedFiles.artwork && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Uploaded: {uploadedFiles.artwork.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Content Information</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credits
                      </label>
                      <Field
                        name="credits"
                        as="textarea"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="List all credits for the project..."
                      />
                      <ErrorMessage name="credits" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publishing Notes
                      </label>
                      <Field
                        name="publishingNotes"
                        as="textarea"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Any special publishing requirements or notes..."
                      />
                      <ErrorMessage name="publishingNotes" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback
                      </label>
                      <Field
                        name="feedback"
                        as="textarea"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Any feedback or notes from reviews..."
                      />
                      <ErrorMessage name="feedback" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marketing Plan
                      </label>
                      <Field
                        name="marketingPlan"
                        as="textarea"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Summarized marketing plan for this release..."
                      />
                      <ErrorMessage name="marketingPlan" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{errors.submit}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Creating...' : 'Create Project'}</span>
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreatePage; 
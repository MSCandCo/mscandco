import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { getUserRole } from '@/lib/user-utils';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { FaUser, FaBuilding, FaMusic, FaGlobe, FaCreditCard, FaCheck, FaArrowRight } from 'react-icons/fa';

export default function ArtistSetup() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    stageName: '',
    realName: '',
    bio: '',
    phone: '',
    address: '',
    primaryGenre: '',
    
    // Company/Business Info
    companyName: '',
    companyAddress: '',
    taxId: '',
    businessType: 'individual', // 'individual', 'company', 'partnership'
    
    // Social Media
    spotifyUrl: '',
    appleMusicUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    websiteUrl: '',
    
    // Payment Details
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    iban: '',
    swiftCode: '',
    paypalEmail: '',
    
    // Subscription Choice
    subscriptionPlan: 'Artist Starter' // 'Artist Starter' or 'Artist Pro'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated or already completed setup
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      const role = getUserRole(user);
      if (role !== 'artist') {
        router.push('/dashboard');
        return;
      }
      
      // Check if profile is already complete
      checkProfileCompletion();
    }
  }, [user, isLoading, router]);

  const checkProfileCompletion = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('bio, phone, social_media')
        .eq('id', user.id)
        .single();
        
      if (!error && profile && profile.bio) {
        // Profile already exists, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Error checking profile:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          display_name: formData.stageName,
          first_name: formData.realName.split(' ')[0] || '',
          last_name: formData.realName.split(' ').slice(1).join(' ') || '',
          bio: formData.bio,
          phone: formData.phone,
          address: formData.address,
          primary_genre: formData.primaryGenre,
          plan: formData.subscriptionPlan,
          social_media: {
            spotify: formData.spotifyUrl,
            apple_music: formData.appleMusicUrl,
            youtube: formData.youtubeUrl,
            instagram: formData.instagramUrl,
            twitter: formData.twitterUrl,
            facebook: formData.facebookUrl,
            tiktok: formData.tiktokUrl,
            website: formData.websiteUrl
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Create artist profile
      const { error: artistError } = await supabase
        .from('artists')
        .insert({
          user_id: user.id,
          stage_name: formData.stageName,
          real_name: formData.realName,
          genre: formData.primaryGenre,
          bio: formData.bio,
          social_links: {
            spotify: formData.spotifyUrl,
            apple_music: formData.appleMusicUrl,
            youtube: formData.youtubeUrl,
            instagram: formData.instagramUrl,
            twitter: formData.twitterUrl,
            facebook: formData.facebookUrl,
            tiktok: formData.tiktokUrl,
            website: formData.websiteUrl
          }
        });

      if (artistError) {
        console.warn('Artist profile creation failed:', artistError);
        // Don't fail the whole process if artist table insert fails
      }

      // Redirect to dashboard
      router.push('/dashboard?welcome=true');
      
    } catch (err) {
      console.error('Setup error:', err);
      setError(err.message || 'Failed to complete setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Basic Info', icon: FaUser },
    { id: 2, title: 'Company Details', icon: FaBuilding },
    { id: 3, title: 'Social Media', icon: FaGlobe },
    { id: 4, title: 'Payment Info', icon: FaCreditCard },
    { id: 5, title: 'Subscription', icon: FaMusic }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep >= step.id 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'border-gray-300 text-gray-300'
          }`}>
            {currentStep > step.id ? (
              <FaCheck className="w-5 h-5" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${
              currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Tell us about yourself</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stage/Artist Name *
          </label>
          <input
            type="text"
            value={formData.stageName}
            onChange={(e) => handleInputChange('stageName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your artist name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Real Name
          </label>
          <input
            type="text"
            value={formData.realName}
            onChange={(e) => handleInputChange('realName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your legal name"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Genre *
        </label>
        <select
          value={formData.primaryGenre}
          onChange={(e) => handleInputChange('primaryGenre', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select your primary genre</option>
          <option value="Hip Hop">Hip Hop</option>
          <option value="R&B">R&B</option>
          <option value="Pop">Pop</option>
          <option value="Rock">Rock</option>
          <option value="Electronic">Electronic</option>
          <option value="Jazz">Jazz</option>
          <option value="Classical">Classical</option>
          <option value="Country">Country</option>
          <option value="Folk">Folk</option>
          <option value="Reggae">Reggae</option>
          <option value="Gospel">Gospel</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us about your music and background..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your address"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Company Information</h2>
      <p className="text-gray-600 text-center mb-6">This information helps us with contracts and payments</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Type
        </label>
        <select
          value={formData.businessType}
          onChange={(e) => handleInputChange('businessType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="individual">Individual Artist</option>
          <option value="company">Company/LLC</option>
          <option value="partnership">Partnership</option>
        </select>
      </div>
      
      {formData.businessType !== 'individual' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your company name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Address
            </label>
            <input
              type="text"
              value={formData.companyAddress}
              onChange={(e) => handleInputChange('companyAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Company address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax ID / EIN
            </label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => handleInputChange('taxId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tax identification number"
            />
          </div>
        </>
      )}
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These details can be updated later by contacting our support team. 
          This ensures proper contract management and compliance.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Connect Your Social Media</h2>
      <p className="text-gray-600 text-center mb-6">Help fans find you across all platforms</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spotify Artist URL
          </label>
          <input
            type="url"
            value={formData.spotifyUrl}
            onChange={(e) => handleInputChange('spotifyUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://open.spotify.com/artist/..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apple Music URL
          </label>
          <input
            type="url"
            value={formData.appleMusicUrl}
            onChange={(e) => handleInputChange('appleMusicUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://music.apple.com/artist/..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Channel
          </label>
          <input
            type="url"
            value={formData.youtubeUrl}
            onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://youtube.com/channel/..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram
          </label>
          <input
            type="url"
            value={formData.instagramUrl}
            onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://instagram.com/username"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Twitter/X
          </label>
          <input
            type="url"
            value={formData.twitterUrl}
            onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://twitter.com/username"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facebook
          </label>
          <input
            type="url"
            value={formData.facebookUrl}
            onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://facebook.com/username"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TikTok
          </label>
          <input
            type="url"
            value={formData.tiktokUrl}
            onChange={(e) => handleInputChange('tiktokUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://tiktok.com/@username"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Payment Information</h2>
      <p className="text-gray-600 text-center mb-6">Secure payment details for your royalty payments</p>
      
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Payment details can be added later from your dashboard. 
          You can skip this step for now if you prefer.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Name
          </label>
          <input
            type="text"
            value={formData.bankName}
            onChange={(e) => handleInputChange('bankName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your bank name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Holder Name
          </label>
          <input
            type="text"
            value={formData.accountHolderName}
            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Name on bank account"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number
          </label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Bank account number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Routing Number
          </label>
          <input
            type="text"
            value={formData.routingNumber}
            onChange={(e) => handleInputChange('routingNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Bank routing number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IBAN (International)
          </label>
          <input
            type="text"
            value={formData.iban}
            onChange={(e) => handleInputChange('iban', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="International bank account number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SWIFT Code
          </label>
          <input
            type="text"
            value={formData.swiftCode}
            onChange={(e) => handleInputChange('swiftCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SWIFT/BIC code"
          />
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alternative Payment Methods</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PayPal Email
          </label>
          <input
            type="email"
            value={formData.paypalEmail}
            onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@paypal.com"
          />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Choose Your Plan</h2>
      <p className="text-gray-600 text-center mb-8">Select the plan that fits your needs</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
          formData.subscriptionPlan === 'Artist Starter' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`} onClick={() => handleInputChange('subscriptionPlan', 'Artist Starter')}>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Artist Starter</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">£9.99/mo</div>
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                Up to 5 releases per year
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                Basic analytics
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                Standard support
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                Revenue tracking
              </li>
            </ul>
          </div>
        </div>
        
        <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all relative ${
          formData.subscriptionPlan === 'Artist Pro' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`} onClick={() => handleInputChange('subscriptionPlan', 'Artist Pro')}>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              POPULAR
            </span>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Artist Pro</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">£19.99/mo</div>
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                Unlimited releases
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                Advanced analytics & insights
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                Priority support
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                Early access to new features
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                Enhanced promotional tools
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-800 text-center">
          <strong>Setup Special:</strong> Get your first month free! You can switch plans anytime from your dashboard.
        </p>
      </div>
    </div>
  );

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.stageName && formData.primaryGenre;
      case 2:
        return true; // Optional step
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step
      case 5:
        return formData.subscriptionPlan;
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <SEO pageTitle="Artist Setup" />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Artist Profile
            </h1>
            <p className="text-gray-600">
              Step {currentStep} of {steps.length} - Let's get you set up for success
            </p>
          </div>
          
          {renderStepIndicator()}
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            {renderCurrentStep()}
            
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <FaArrowRight className="ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isSubmitting}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Completing Setup...' : 'Complete Setup'}
                  <FaCheck className="ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

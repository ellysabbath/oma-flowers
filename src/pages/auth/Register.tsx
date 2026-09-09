import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Country data
const countries = [
  { code: 'TZ', name: 'Tanzania' },
  { code: 'KE', name: 'Kenya' },
  { code: 'UG', name: 'Uganda' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'GH', name: 'Ghana' },
];

// Region data
const regions: Record<string, string[]> = {
  'TZ': ['Dar es Salaam', 'Arusha', 'Kilimanjaro', 'Mwanza', 'Tanga', 'Morogoro', 'Dodoma', 'Mbeya', 'Zanzibar'],
  'KE': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi'],
  'UG': ['Kampala', 'Entebbe', 'Jinja', 'Gulu', 'Mbale', 'Mbarara', 'Fort Portal'],
  'NG': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Kaduna', 'Enugu'],
  'ZA': ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo'],
  'GH': ['Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern', 'Volta'],
};

// City data - Expanded with more cities
const cities: Record<string, string[]> = {
  // Tanzania - Dar es Salaam
  'Dar es Salaam': ['Kinondoni', 'Ilala', 'Temeke', 'Ubungo', 'Kigamboni', 'Sinza', 'Mikocheni', 'Mbezi'],
  // Tanzania - Arusha
  'Arusha': ['Arusha City', 'Ngorongoro', 'Meru', 'Karatu', 'Monduli', 'Longido'],
  // Tanzania - Kilimanjaro
  'Kilimanjaro': ['Moshi', 'Moshi Municipal', 'Same', 'Mwanga', 'Rombo', 'Hai'],
  // Tanzania - Mwanza
  'Mwanza': ['Mwanza City', 'Ilemela', 'Nyamagana', 'Sengerema', 'Misungwi', 'Magu'],
  // Tanzania - Tanga
  'Tanga': ['Tanga City', 'Pangani', 'Muheza', 'Korogwe', 'Lushoto', 'Handeni'],
  // Tanzania - Morogoro
  'Morogoro': ['Morogoro Municipal', 'Kilosa', 'Mvomero', 'Gairo', 'Kilombero', 'Ulanga'],
  // Tanzania - Dodoma
  'Dodoma': ['Dodoma City', 'Mpwapwa', 'Kongwa', 'Chamwino', 'Chemba', 'Bahi'],
  // Tanzania - Mbeya
  'Mbeya': ['Mbeya City', 'Kyela', 'Rungwe', 'Mbozi', 'Chunya', 'Tukuyu'],
  // Tanzania - Zanzibar
  'Zanzibar': ['Zanzibar City', 'Stone Town', 'Ng\'ambo', 'Michenzani', 'Jambiani', 'Paje', 'Nungwi'],
  
  // Kenya - Nairobi
  'Nairobi': ['Nairobi CBD', 'Westlands', 'Karen', 'Langata', 'Kasarani', 'Embakasi', 'Dagoretti', 'Kibra'],
  // Kenya - Mombasa
  'Mombasa': ['Mombasa Island', 'Kisauni', 'Likoni', 'Nyali', 'Changamwe', 'Jomvu', 'Mvita'],
  // Kenya - Kisumu
  'Kisumu': ['Kisumu City', 'Kisumu East', 'Kisumu West', 'Kisumu Central', 'Nyando'],
  // Kenya - Nakuru
  'Nakuru': ['Nakuru Town', 'Nakuru East', 'Nakuru West', 'Naivasha', 'Gilgil'],
  // Kenya - Eldoret
  'Eldoret': ['Eldoret City', 'Kapseret', 'Turbo', 'Soy', 'Moiben'],
  
  // Uganda - Kampala
  'Kampala': ['Kampala Central', 'Nakasero', 'Kololo', 'Bukoto', 'Naguru', 'Muyenga', 'Lubaga', 'Makindye'],
  // Uganda - Entebbe
  'Entebbe': ['Entebbe Town', 'Kigungu', 'Katabi', 'Nakiwogo', 'Bugonga'],
  // Uganda - Jinja
  'Jinja': ['Jinja City', 'Jinja Central', 'Njeru', 'Mpumudde', 'Buwenge'],
  // Uganda - Gulu
  'Gulu': ['Gulu City', 'Layibi', 'Pece', 'Bardege', 'Gulu East'],
  // Uganda - Mbale
  'Mbale': ['Mbale City', 'Namanyonyi', 'Bungokho', 'Mbale Central'],
  
  // Nigeria - Lagos
  'Lagos': ['Lagos Island', 'Victoria Island', 'Ikoyi', 'Surulere', 'Yaba', 'Ikeja', 'Lekki', 'Badagry'],
  // Nigeria - Abuja
  'Abuja': ['Abuja City Centre', 'Maitama', 'Wuse', 'Garki', 'Asokoro', 'Gwarinpa', 'Kubwa'],
  // Nigeria - Kano
  'Kano': ['Kano City', 'Nassarawa', 'Fagge', 'Dala', 'Gwale', 'Tarauni'],
  // Nigeria - Ibadan
  'Ibadan': ['Ibadan North', 'Ibadan South', 'Ibadan East', 'Ibadan West', 'Ibadan North East'],
  // Nigeria - Port Harcourt
  'Port Harcourt': ['Port Harcourt City', 'Rumuokwurushi', 'Eliozu', 'Mile 1', 'Diobu'],
  
  // South Africa - Gauteng (Johannesburg)
  'Gauteng': ['Johannesburg CBD', 'Sandton', 'Rosebank', 'Bryanston', 'Midrand', 'Centurion', 'Pretoria'],
  // South Africa - Western Cape (Cape Town)
  'Western Cape': ['Cape Town CBD', 'Stellenbosch', 'Paarl', 'Somerset West', 'Bellville', 'Mitchells Plain'],
  // South Africa - KwaZulu-Natal (Durban)
  'KwaZulu-Natal': ['Durban CBD', 'Umhlanga', 'Pietermaritzburg', 'Richards Bay', 'Newcastle'],
  // South Africa - Eastern Cape
  'Eastern Cape': ['Port Elizabeth', 'East London', 'Mthatha', 'Grahamstown', 'King William\'s Town'],
  
  // Ghana - Greater Accra
  'Greater Accra': ['Accra CBD', 'Osu', 'Labone', 'East Legon', 'Tema', 'Ashaiman', 'Madina', 'Adenta'],
  // Ghana - Ashanti
  'Ashanti': ['Kumasi', 'Obuasi', 'Tafo', 'Ejisu', 'Konongo', 'Mampong'],
  // Ghana - Central
  'Central': ['Cape Coast', 'Elmina', 'Kasoa', 'Winneba', 'Mankessim'],
  // Ghana - Western
  'Western': ['Sekondi-Takoradi', 'Tarkwa', 'Prestea', 'Shama', 'Ahanta West'],
  // Ghana - Eastern
  'Eastern': ['Koforidua', 'Nsawam', 'Akwatia', 'Aburi', 'Somanya'],
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    phone: '',
    region: '',
    city: '',
    customCity: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    country: '',
    phone: '',
    region: '',
    city: '',
    customCity: '',
    password: '',
    confirmPassword: '',
    agreeTerms: '',
    profilePicture: '',
  });

  // Update regions when country changes
  useEffect(() => {
    if (formData.country && regions[formData.country]) {
      setAvailableRegions(regions[formData.country]);
      setFormData(prev => ({ ...prev, region: '', city: '', customCity: '' }));
      setAvailableCities([]);
      setIsCustomCity(false);
    } else {
      setAvailableRegions([]);
      setAvailableCities([]);
    }
  }, [formData.country]);

  // Update cities when region changes
  useEffect(() => {
    if (formData.region && cities[formData.region]) {
      const cityList = cities[formData.region];
      setAvailableCities(cityList);
      setFormData(prev => ({ ...prev, city: '', customCity: '' }));
      setIsCustomCity(false);
    } else if (formData.region) {
      // Region exists but no cities predefined
      setAvailableCities([]);
      setIsCustomCity(true);
      setFormData(prev => ({ ...prev, city: '', customCity: '' }));
    } else {
      setAvailableCities([]);
      setIsCustomCity(false);
    }
  }, [formData.region]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (registerError) {
      setRegisterError(null);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({ ...prev, profilePicture: 'Please upload an image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, profilePicture: 'Image size should be less than 5MB' }));
      return;
    }

    // Clear error
    setFormErrors(prev => ({ ...prev, profilePicture: '' }));

    // Set file and preview
    setProfilePictureFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = () => {
    setProfilePicturePreview(null);
    setProfilePictureFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      fullName: '',
      email: '',
      country: '',
      phone: '',
      region: '',
      city: '',
      customCity: '',
      password: '',
      confirmPassword: '',
      agreeTerms: '',
      profilePicture: '',
    };

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
      isValid = false;
    } else if (formData.fullName.length < 3) {
      errors.fullName = 'Full name must be at least 3 characters';
      isValid = false;
    }

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.country) {
      errors.country = 'Please select your country';
      isValid = false;
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    if (!formData.region) {
      errors.region = 'Please select your region';
      isValid = false;
    }

    // City validation - check if using dropdown or custom input
    if (isCustomCity) {
      if (!formData.customCity.trim()) {
        errors.customCity = 'Please enter your city';
        isValid = false;
      }
    } else {
      if (!formData.city) {
        errors.city = 'Please select your city';
        isValid = false;
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords must match';
      isValid = false;
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'You must agree to the terms and conditions';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setRegisterError(null);
    try {
      // Convert profile picture to base64 if exists
      let profilePictureBase64 = '';
      if (profilePictureFile) {
        const reader = new FileReader();
        profilePictureBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(profilePictureFile);
        });
      }

      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Get the final city value
      const finalCity = isCustomCity ? formData.customCity.trim() : formData.city;

      // Register with profile picture
      await registerUser({
        email: formData.email,
        username: formData.email.split('@')[0],
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone,
        country: formData.country,
        region: formData.region,
        city: finalCity,
        profile_picture: profilePictureBase64 || undefined,
        password: formData.password,
        password2: formData.confirmPassword,
      });
      
      navigate('/account-verify', { state: { email: formData.email } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Registration failed. Please try again.';
      setRegisterError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <Link to="/" className="inline-block">
            {/* Logo here */}
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join us and start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div 
                  className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-amber-500 transition-colors duration-200 group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePicturePreview ? (
                    <img 
                      src={profilePicturePreview} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400 group-hover:text-amber-500 transition-colors duration-200">
                      <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs block mt-1">Upload</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  Upload a profile picture (JPEG, PNG, WebP)
                </p>
                <p className="text-xs text-gray-400">Max size: 5MB</p>
                {profilePicturePreview && (
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="text-sm text-red-500 hover:text-red-600 font-medium mt-1 transition-colors duration-200"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
            {formErrors.profilePicture && (
              <p className="text-sm text-red-500 mt-1">{formErrors.profilePicture}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-3 pl-10 rounded-lg border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200`}
              />
            </div>
            {formErrors.fullName && <p className="text-sm text-red-500 mt-1">{formErrors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 pl-10 rounded-lg border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200`}
              />
            </div>
            {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`w-full px-4 py-3 pl-10 rounded-lg border ${formErrors.country ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 appearance-none bg-white`}
              >
                <option value="">Select your country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {formErrors.country && <p className="text-sm text-red-500 mt-1">{formErrors.country}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+255 712 345 678"
                className={`w-full px-4 py-3 pl-10 rounded-lg border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200`}
              />
            </div>
            {formErrors.phone && <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>}
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region / State</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                disabled={!formData.country}
                className={`w-full px-4 py-3 pl-10 rounded-lg border ${formErrors.region ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 appearance-none bg-white ${!formData.country ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">{formData.country ? 'Select your region' : 'Please select a country first'}</option>
                {availableRegions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {formErrors.region && <p className="text-sm text-red-500 mt-1">{formErrors.region}</p>}
          </div>

          {/* City - Dynamic Dropdown or Custom Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            
            {formData.region && availableCities.length > 0 ? (
              // Show dropdown when cities are available
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 rounded-lg border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 appearance-none bg-white`}
                >
                  <option value="">Select your city</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                  <option value="__other__">Other (Enter manually)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            ) : formData.region && availableCities.length === 0 ? (
              // Show custom input when no cities are predefined for this region
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="customCity"
                    value={formData.customCity}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    className={`w-full px-4 py-3 pl-10 rounded-lg border ${formErrors.customCity ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  No predefined cities for this region. Please enter your city manually.
                </p>
              </div>
            ) : (
              // Show disabled state when no region is selected
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <select
                  disabled
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                >
                  <option value="">Please select a region first</option>
                </select>
              </div>
            )}
            
            {formErrors.city && <p className="text-sm text-red-500 mt-1">{formErrors.city}</p>}
            {formErrors.customCity && <p className="text-sm text-red-500 mt-1">{formErrors.customCity}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className={`w-full px-4 py-3 pl-10 rounded-lg border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {formErrors.password && <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 pl-10 rounded-lg border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {formErrors.confirmPassword && <p className="text-sm text-red-500 mt-1">{formErrors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
            />
            <label className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/terms" className="text-amber-600 hover:text-amber-700">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-amber-600 hover:text-amber-700">Privacy Policy</Link>
            </label>
          </div>
          {formErrors.agreeTerms && <p className="text-sm text-red-500">{formErrors.agreeTerms}</p>}

          {registerError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {registerError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors duration-200">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
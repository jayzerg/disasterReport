'use client';

import { useState, useRef } from 'react';
import { createReport } from '../lib/api';

export default function ReportPage() {
  const [formData, setFormData] = useState({
    type: 'earthquake' as 'earthquake' | 'storm' | 'flood' | 'landslide',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    description: '',
    latitude: 0,
    longitude: 0
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'detected' | 'error'>('idle');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user's current location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setErrorMessage('Geolocation is not supported by your browser');
      return;
    }

    setLocationStatus('detecting');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocationStatus('detected');
      },
      (error) => {
        setLocationStatus('error');
        setErrorMessage(`Unable to retrieve your location: ${error.message}`);
      }
    );
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 5MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Check file type
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        setErrorMessage('Only JPG and PNG images are allowed');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setImage(file);
      setErrorMessage('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      setErrorMessage('Description is required');
      return;
    }
    
    if (formData.description.length < 10) {
      setErrorMessage('Description must be at least 10 characters');
      return;
    }
    
    setSubmitStatus('submitting');
    
    try {
      const result = await createReport({
        ...formData,
        image: image || undefined
      });
      
      if (result.success) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          type: 'earthquake',
          severity: 'medium',
          description: '',
          latitude: 0,
          longitude: 0
        });
        setImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.message || 'Failed to submit report');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-500 via-orange-500 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-[0px_20px_179px_14px_rgba(54,_69,_198,_0.59)] p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Report Disaster Impact
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1 text-gray-700">
              Disaster Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            >
              <option value="earthquake">Earthquake</option>
              <option value="storm">Storm</option>
              <option value="flood">Flood</option>
              <option value="landslide">Landslide</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="severity" className="block text-sm font-medium mb-1 text-gray-700">
              Severity
            </label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              placeholder="Describe the damage or impact you observed..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Location
            </label>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-2">
              <button
                type="button"
                onClick={getLocation}
                disabled={locationStatus === 'detecting'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {locationStatus === 'detecting' ? 'Detecting...' : 'Auto-Detect Location'}
              </button>
              
              <div className="flex-1 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={formData.latitude || ''}
                  onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value) || 0})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                />
                
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={formData.longitude || ''}
                  onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value) || 0})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                />
              </div>
            </div>
            
            {locationStatus === 'detected' && (
              <p className="text-green-600 text-sm">Location detected successfully!</p>
            )}
            
            {locationStatus === 'error' && (
              <p className="text-red-600 text-sm">{errorMessage}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1 text-gray-700">
              Image (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="image"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 mt-1">JPG or PNG, max 5MB</p>
          </div>
          
          {errorMessage && (
            <div className="text-red-600 text-sm">{errorMessage}</div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={submitStatus === 'submitting'}
              className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all hover:scale-[1.02]"
            >
              {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
          
          {submitStatus === 'success' && (
            <div className="p-4 bg-green-100 text-green-800 rounded-md">
              Report submitted successfully! Thank you for your contribution.
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="p-4 bg-red-100 text-red-800 rounded-md">
              Failed to submit report. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
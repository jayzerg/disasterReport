// API client functions for the disaster response platform

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  reports?: T;
  reportId?: string;
}

// Create a new disaster report
export async function createReport(reportData: {
  type: string;
  severity: string;
  description: string;
  latitude: number;
  longitude: number;
  image?: File;
}): Promise<ApiResponse> {
  try {
    const formData = new FormData();
    
    formData.append('type', reportData.type);
    formData.append('severity', reportData.severity);
    formData.append('description', reportData.description);
    formData.append('latitude', reportData.latitude.toString());
    formData.append('longitude', reportData.longitude.toString());
    
    if (reportData.image) {
      formData.append('image', reportData.image);
    }
    
    const response = await fetch('/api/reports', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating report:', error);
    return {
      success: false,
      message: 'Failed to create report'
    };
  }
}

// Get nearby reports
export async function getNearbyReports(
  lat: number, 
  lng: number, 
  radius?: number
): Promise<ApiResponse<any[]>> {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString()
    });
    
    if (radius) {
      params.append('radius', radius.toString());
    }
    
    const response = await fetch(`/api/reports/near?${params}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching nearby reports:', error);
    return {
      success: false,
      message: 'Failed to fetch reports'
    };
  }
}
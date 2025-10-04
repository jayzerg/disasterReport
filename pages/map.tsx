'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getNearbyReports } from '../lib/api';

interface Report {
  _id: string;
  type: 'earthquake' | 'storm' | 'flood' | 'landslide';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  imageUrl?: string;
  verified: boolean;
  createdAt: string;
}

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  // Get color based on severity
  const getSeverityColor = (severity: Report['severity']) => {
    switch (severity) {
      case 'critical': return '#ef4444'; // red
      case 'high': return '#f97316'; // orange
      case 'medium': return '#eab308'; // yellow
      case 'low': return '#22c55e'; // green
      default: return '#6b7280'; // gray
    }
  };

  // Load reports near user location
  const loadReports = async (lat: number, lng: number) => {
    try {
      setIsLoading(true);
      const result = await getNearbyReports(lat, lng);
      
      if (result.success && result.reports) {
        setReports(result.reports);
        
        // Add markers to map
        if (mapRef.current) {
          // Clear existing markers
          const existingMarkers = document.querySelectorAll('.report-marker');
          existingMarkers.forEach(marker => marker.remove());
          
          // Add new markers
          result.reports.forEach((report: Report) => {
            const el = document.createElement('div');
            el.className = 'report-marker';
            el.style.backgroundColor = getSeverityColor(report.severity);
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
            
            // Add click event to show popup
            el.addEventListener('click', () => {
              const popup = new mapboxgl.Popup({ offset: 25 })
                .setLngLat(report.location.coordinates)
                .setHTML(`
                  <div class="p-2">
                    <h3 class="font-bold">${report.type.charAt(0).toUpperCase() + report.type.slice(1)} - ${report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}</h3>
                    <p class="mt-1">${report.description}</p>
                    <p class="text-xs text-gray-500 mt-1">${new Date(report.createdAt).toLocaleString()}</p>
                    ${report.imageUrl ? `<img src="${report.imageUrl}" alt="Report image" class="mt-2 w-full h-32 object-cover rounded" />` : ''}
                  </div>
                `)
                .addTo(mapRef.current!);
            });
            
            new mapboxgl.Marker(el)
              .setLngLat(report.location.coordinates)
              .addTo(mapRef.current!);
          });
        }
      } else {
        setError(result.message || 'Failed to load reports');
      }
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Check if Mapbox access token is available
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      setError('Mapbox access token is not configured. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment variables.');
      setIsLoading(false);
      return;
    }
    
    // Ensure Mapbox access token is set
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0],
      zoom: 2
    });
    
    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update map center
          mapRef.current?.setCenter([longitude, latitude]);
          mapRef.current?.setZoom(10);
          
          // Load reports near user location
          loadReports(latitude, longitude);
        },
        (err) => {
          setError(`Unable to retrieve your location: ${err.message}`);
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
    }
    
    // Clean up
    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-500 via-orange-500 to-white flex flex-col">
      <header className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Disaster Reports Map
        </h1>
      </header>
      
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0" />
        
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg">
            Loading reports...
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 p-4 rounded-lg shadow-lg max-w-md">
            {error}
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-bold mb-2">Severity Levels</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span>Critical</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
              <span>High</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span>Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
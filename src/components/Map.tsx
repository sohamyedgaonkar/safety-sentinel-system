import React, { useState, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MapProps {
  onLocationSelect?: (location: string) => void;
  initialLocation?: string;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 0,
  lng: 0
};

const Map: React.FC<MapProps> = ({ onLocationSelect, initialLocation }) => {
  const { supabase } = useAuth();
  const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(() => {
    if (initialLocation) {
      const [lat, lng] = initialLocation.split(',').map(Number);
      return { lat, lng };
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    setMarker(newPosition);
    
    if (onLocationSelect) {
      try {
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({ location: newPosition });
        
        if (response.results[0]) {
          const address = response.results[0].formatted_address;
          const locationString = `${newPosition.lat},${newPosition.lng}|${address}`;
          onLocationSelect(locationString);
          toast.success("Location selected successfully");
        } else {
          const locationString = `${newPosition.lat},${newPosition.lng}`;
          onLocationSelect(locationString);
          toast.success("Location coordinates saved");
        }
      } catch (error) {
        console.error("Error getting address:", error);
        const locationString = `${newPosition.lat},${newPosition.lng}`;
        onLocationSelect(locationString);
        toast.success("Location coordinates saved");
      }
    }
  }, [onLocationSelect]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is not configured");
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
        <p className="text-gray-600">Error: Google Maps API key is not configured</p>
      </div>
    );
  }

  const handleLoad = () => {
    setIsLoading(false);
    console.log("Google Maps loaded successfully");
  };

  const handleError = (error: Error) => {
    console.error("Google Maps error:", error);
    toast.error("Failed to load Google Maps. Please try again later.");
  };

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md z-10">
          <p className="text-gray-600">Loading map...</p>
        </div>
      )}
      <LoadScript 
        googleMapsApiKey={apiKey}
        onLoad={handleLoad}
        onError={handleError}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={marker || defaultCenter}
          zoom={marker ? 15 : 2}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
          }}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default Map;
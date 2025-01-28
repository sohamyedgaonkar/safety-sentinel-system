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

  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    setMarker(newPosition);
    
    if (onLocationSelect) {
      try {
        // Get the address from coordinates using Google Maps Geocoding service
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
        // If geocoding fails, just save the coordinates
        const locationString = `${newPosition.lat},${newPosition.lng}`;
        onLocationSelect(locationString);
        toast.success("Location coordinates saved");
      }
    }
  }, [onLocationSelect]);

  // Get the API key from environment variables
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is not set");
    return <div>Error: Google Maps API key is not configured</div>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
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
  );
};

export default Map;
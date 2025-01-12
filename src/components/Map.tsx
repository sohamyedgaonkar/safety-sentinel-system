import React, { useState, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useAuth } from "@/contexts/AuthContext";

interface MapProps {
  onLocationSelect?: (location: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 0,
  lng: 0
};

const Map: React.FC<MapProps> = ({ onLocationSelect }) => {
  const { supabase } = useAuth();
  const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(null);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    setMarker(newPosition);
    
    if (onLocationSelect) {
      onLocationSelect(`${newPosition.lat},${newPosition.lng}`);
    }
  }, [onLocationSelect]);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={2}
        onClick={handleMapClick}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
import React, { useState, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [googleMapsKey, setGoogleMapsKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setGoogleMapsKey(inputValue.trim());
      console.log("API Key set:", inputValue.trim());
    }
  };

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

  if (!googleMapsKey) {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
          <form onSubmit={handleSubmit} className="space-y-4 p-4 w-full max-w-md">
            <p className="text-sm text-gray-600">Please enter your Google Maps API key:</p>
            <Input
              type="text"
              value={inputValue}
              className="w-full"
              placeholder="Enter Google Maps API key"
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={!inputValue.trim()}
            >
              Set API Key
            </Button>
            <p className="text-xs text-gray-500">
              Get your API key at{" "}
              <a
                href="https://console.cloud.google.com/google/maps-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={2}
        onClick={handleMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        }}
      >
        {marker && (
          <Marker
            position={marker}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
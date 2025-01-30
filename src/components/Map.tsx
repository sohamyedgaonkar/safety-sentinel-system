import React, { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import L from "leaflet";

// Fix Leaflet default marker icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  onLocationSelect?: (location: string) => void;
  initialLocation?: string;
}

interface MapEventsProps {
  onMapClick: (lat: number, lng: number) => void;
}

const MapEvents: React.FC<MapEventsProps> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const Map: React.FC<MapProps> = ({ onLocationSelect, initialLocation }) => {
  const { supabase } = useAuth();
  const [marker, setMarker] = useState<[number, number] | null>(() => {
    if (initialLocation) {
      const [lat, lng] = initialLocation.split(',').map(Number);
      return [lat, lng];
    }
    return null;
  });

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    const newPosition: [number, number] = [lat, lng];
    setMarker(newPosition);
    
    if (onLocationSelect) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        
        if (data.display_name) {
          const locationString = `${lat},${lng}|${data.display_name}`;
          onLocationSelect(locationString);
          toast.success("Location selected successfully");
        } else {
          const locationString = `${lat},${lng}`;
          onLocationSelect(locationString);
          toast.success("Location coordinates saved");
        }
      } catch (error) {
        console.error("Error getting address:", error);
        const locationString = `${lat},${lng}`;
        onLocationSelect(locationString);
        toast.success("Location coordinates saved");
      }
    }
  }, [onLocationSelect]);

  const defaultCenter: [number, number] = [20, 0];
  const mapCenter = marker || defaultCenter;

  return (
    <div className="h-full w-full rounded-md overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={marker ? 15 : 2}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onMapClick={handleMapClick} />
        {marker && (
          <Marker position={marker} />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
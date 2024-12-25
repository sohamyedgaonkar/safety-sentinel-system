import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MapProps {
  onLocationSelect?: (location: string) => void;
}

const Map: React.FC<MapProps> = ({ onLocationSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setMapboxToken(inputValue.trim());
      console.log("Token set:", inputValue.trim());
    }
  };

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    
    if (marker.current) {
      marker.current.remove();
    }
    
    marker.current = new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .addTo(map.current!);

    if (onLocationSelect) {
      onLocationSelect(`${lat},${lng}`);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = () => {
      if (!mapboxToken) return;
      
      try {
        mapboxgl.accessToken = mapboxToken;
        
        const newMap = new mapboxgl.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [-74.5, 40],
          zoom: 9,
        });

        newMap.addControl(new mapboxgl.NavigationControl(), "top-right");
        newMap.on('click', handleMapClick);

        map.current = newMap;
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  return (
    <div className="relative w-full h-full">
      {!mapboxToken && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
          <form onSubmit={handleSubmit} className="space-y-4 p-4 w-full max-w-md">
            <p className="text-sm text-gray-600">Please enter your Mapbox token:</p>
            <Input
              type="text"
              value={inputValue}
              className="w-full"
              placeholder="Enter Mapbox token"
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={!inputValue.trim()}
            >
              Set Token
            </Button>
            <p className="text-xs text-gray-500">
              Get your token at{" "}
              <a
                href="https://www.mapbox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </form>
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;
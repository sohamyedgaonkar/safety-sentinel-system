import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState("");

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

        // Add navigation controls
        newMap.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.current = newMap;
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Cleanup function
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
          <div className="space-y-4 p-4">
            <p className="text-sm text-gray-600">Please enter your Mapbox token:</p>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter Mapbox token"
              onChange={(e) => setMapboxToken(e.target.value)}
            />
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
          </div>
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;
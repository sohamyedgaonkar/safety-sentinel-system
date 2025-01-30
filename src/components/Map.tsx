import React, { useEffect, useRef, useState, useCallback } from "react";
import { Map as OLMap, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, transform } from 'ol/proj';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import 'ol/ol.css';

interface MapProps {
  onLocationSelect?: (location: string) => void;
  initialLocation?: string;
}

const MapComponent: React.FC<MapProps> = ({ onLocationSelect, initialLocation }) => {
  const { supabase } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<OLMap | null>(null);
  const markerLayer = useRef<VectorLayer<VectorSource>>();
  const [marker, setMarker] = useState<[number, number] | null>(() => {
    if (initialLocation) {
      const [lat, lng] = initialLocation.split(',').map(Number);
      return [lng, lat]; // OpenLayers uses [lon, lat] order
    }
    return null;
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create map instance
    mapInstance.current = new OLMap({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: marker ? fromLonLat(marker) : fromLonLat([0, 20]),
        zoom: marker ? 15 : 2
      })
    });

    // Create vector layer for marker
    markerLayer.current = new VectorLayer({
      source: new VectorSource()
    });
    mapInstance.current.addLayer(markerLayer.current);

    // Add click handler
    mapInstance.current.on('click', (event) => {
      const coordinates = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
      handleMapClick(coordinates[1], coordinates[0]); // Convert to [lat, lon] for consistency
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.dispose();
      }
    };
  }, []);

  // Update marker position
  useEffect(() => {
    if (!markerLayer.current || !marker) return;

    const markerSource = markerLayer.current.getSource();
    if (!markerSource) return;

    markerSource.clear();
    const markerFeature = new Feature({
      geometry: new Point(fromLonLat(marker))
    });
    markerFeature.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://openlayers.org/en/latest/examples/data/icon.png'
        })
      })
    );
    markerSource.addFeature(markerFeature);
  }, [marker]);

  const handleMapClick = useCallback(async (lat: number, lon: number) => {
    const newPosition: [number, number] = [lon, lat];
    setMarker(newPosition);
    
    if (onLocationSelect) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await response.json();
        
        if (data.display_name) {
          const locationString = `${lat},${lon}|${data.display_name}`;
          onLocationSelect(locationString);
          toast.success("Location selected successfully");
        } else {
          const locationString = `${lat},${lon}`;
          onLocationSelect(locationString);
          toast.success("Location coordinates saved");
        }
      } catch (error) {
        console.error("Error getting address:", error);
        const locationString = `${lat},${lon}`;
        onLocationSelect(locationString);
        toast.success("Location coordinates saved");
      }
    }
  }, [onLocationSelect]);

  return (
    <div className="h-full w-full rounded-md overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

export default MapComponent;
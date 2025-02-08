import React, { useEffect, useRef, useState, useCallback } from "react";
import { Map as OLMap, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, transform } from 'ol/proj';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon, Circle, Fill, Stroke, Text } from 'ol/style';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import 'ol/ol.css';

interface MapProps {
  onLocationSelect?: (location: string) => void;
  initialLocation?: string;
}

interface Incident {
  type: string;
  location: string;
}

interface Zone {
  name: string;
  coordinates: [number, number];
  type: string;
  radius: number;
  count: number;
}

const isValidCoordinates = (location: string): boolean => {
  if (!location || !location.includes(',')) return false;
  
  const [lat, lon] = location.split(',').map(Number);
  
  // Check if values are valid numbers
  if (isNaN(lat) || isNaN(lon)) return false;
  
  // Check if coordinates are within valid ranges
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return false;
  
  return true;
};

const getZoneType = (count: number): string => {
  if (count >= 5) return 'high';
  if (count >= 3) return 'medium';
  return 'low';
};

const getZoneRadius = (count: number): number => {
  if (count >= 5) return 12;
  if (count >= 3) return 10;
  return 8;
};

const getHotspotStyle = (type: string, name: string, radius: number, count: number) => {
  const colors: { [key: string]: string } = {
    high: 'rgba(255, 0, 0, 0.54)',
    medium: 'rgba(255, 85, 0, 0.66)',
    low: 'rgba(255, 51, 0, 0.2)',
  };

  const borderColors: { [key: string]: string } = {
    high: '#FF0000',
    medium: '#FFA500',
    low: '#FF0000',
  };

  return new Style({
    image: new Circle({
      radius: radius * 4,
      fill: new Fill({ color: colors[type] || '#666666' }),
      stroke: new Stroke({ color: borderColors[type] || '#666666', width: 2 })
    }),
    text: new Text({
      text: `${name}\n(${count} incidents)`,
      offsetY: -(radius * 4 + 10),
      fill: new Fill({ color: '#333333' }),
      stroke: new Stroke({ color: '#ffffff', width: 3 }),
      textAlign: 'center'
    })
  });
};

const Map2Component: React.FC<MapProps> = ({ onLocationSelect, initialLocation }) => {
  const { supabase } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<OLMap | null>(null);
  const markerLayer = useRef<VectorLayer<VectorSource>>();
  const hotspotLayer = useRef<VectorLayer<VectorSource>>();
  const [zones, setZones] = useState<Zone[]>([]);
  const [marker, setMarker] = useState<[number, number] | null>(() => {
    if (initialLocation && isValidCoordinates(initialLocation)) {
      const [lat, lng] = initialLocation.split(',').map(Number);
      return [lng, lat];
    }
    return null;
  });

  const processIncidents = (incidents: Incident[]) => {
    const locationClusters: { [key: string]: { count: number; type: string; incidents: Incident[] } } = {};

    // Filter and process only valid coordinate locations
    incidents
      .filter(incident => isValidCoordinates(incident.location))
      .forEach(incident => {
        const [lat, lon] = incident.location.split(',').map(Number);
        
        // Round coordinates to create clusters
        const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
        
        if (!locationClusters[key]) {
          locationClusters[key] = {
            count: 0,
            type: incident.type,
            incidents: []
          };
        }
        locationClusters[key].count += 1;
        locationClusters[key].incidents.push(incident);
      });

    const newZones: Zone[] = Object.entries(locationClusters).map(([location, data]) => {
      const [lat, lon] = location.split(',').map(Number);
      return {
        name: `${data.type} Risk Zone`,
        coordinates: [lon, lat],
        type: getZoneType(data.count),
        radius: getZoneRadius(data.count),
        count: data.count
      };
    });

    setZones(newZones);
  };

  const fetchIncidentData = async () => {
    try {
      const { data: incidents, error } = await supabase
        .from('incidents')
        .select('type, location');

      if (error) throw error;

      if (incidents) {
        // Log invalid locations for debugging
        const invalidLocations = incidents.filter(incident => !isValidCoordinates(incident.location));
        if (invalidLocations.length > 0) {
          console.warn('Found invalid locations:', invalidLocations);
        }

        processIncidents(incidents);
      }
    } catch (error) {
      console.error('Error fetching incident data:', error);
      toast.error('Failed to load incident data');
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = new OLMap({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([73.8671, 18.4579]), // Katraj center
        zoom: 14
      })
    });

    markerLayer.current = new VectorLayer({
      source: new VectorSource()
    });
    hotspotLayer.current = new VectorLayer({
      source: new VectorSource()
    });

    mapInstance.current.addLayer(markerLayer.current);
    mapInstance.current.addLayer(hotspotLayer.current);

    mapInstance.current.on('click', (event) => {
      const coordinates = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
      handleMapClick(coordinates[1], coordinates[0]);
    });

    fetchIncidentData();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.dispose();
      }
    };
  }, []);

  // Update zones when data changes
  useEffect(() => {
    if (!hotspotLayer.current) return;

    const hotspotSource = hotspotLayer.current.getSource();
    if (!hotspotSource) return;

    hotspotSource.clear();

    zones.forEach(zone => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(zone.coordinates))
      });
      feature.setStyle(getHotspotStyle(zone.type, zone.name, zone.radius, zone.count));
      hotspotSource.addFeature(feature);
    });
  }, [zones]);

  // Handle marker updates
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
        
        // Always store as coordinate string for consistency
        const locationString = `${lat},${lon}`;
        onLocationSelect(locationString);
        toast.success("Location coordinates saved");
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

export default Map2Component;

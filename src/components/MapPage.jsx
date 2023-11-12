import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap, Polygon } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/assets/css/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

let EditControl;
if (typeof window !== 'undefined') {
  EditControl = require('react-leaflet-draw').EditControl;
}

function Search() {
  const map = useMap();
  useEffect(() => {
    if (map) {
      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider,
        style: 'bar',
      });
      map.addControl(searchControl);
      return () => map.removeControl(searchControl);
    }
  }, [map]);

  return null;
}

export default function MapPage() {

  const [coordinates, setCoordinates] = useState(null);
  const [savedData, setSavedData] = useState({
    coordinates: JSON.parse(localStorage.getItem('mapCoordinates')) || []
  });
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    if (savedData.coordinates.length) {
      setCoordinates(savedData.coordinates);
    }
  }, []);

  const clearPolygons = () => {
    setPolygons([]);
  };

  async function fetchDetailedAreaData(bounds) {
    // Construct a query to get areas within the given bounds
    // The specific query will depend on the tags and details you are interested in
    const query = `[out:json][timeout:25];
      (
        way["landuse"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
        relation["landuse"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      );
      out body; >; out skel qt;`;
  
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
    try {
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      return processOverpassApiResponse(data);
    } catch (error) {
      console.error('Error fetching detailed area data:', error);
      return []; // Return an empty array in case of error
    }
  }
  
  function processOverpassApiResponse(data) {
    // Process the Overpass API response to extract area details
    // Here you will need to transform the data into a format suitable for your application
    // This might involve creating GeoJSON, extracting coordinates, determining area types, etc.
  
    // As an example, let's say we want to extract polygons for each land use type
    const areas = data.elements.filter(element => element.type === 'way' && element.tags && element.tags.landuse);
    const polygons = areas.map(area => {
      // Convert node references to actual coordinates
      const coordinates = area.nodes.map(nodeId => {
        const node = data.elements.find(element => element.type === 'node' && element.id === nodeId);
        return [node.lat, node.lon];
      });
  
      return {
        type: area.tags.landuse,
        coordinates: coordinates,
      };
    });
  
    return polygons;
  }
  
  function determineAreaType(segment) {
    // Here, we're assuming each segment has a type property that indicates the area type
    // This would have been set in the processOverpassApiResponse function
    const type = segment.type;
  
    // You could have a more complex logic here if needed
    // For example, checking additional tags, combining types, etc.
  
    return type;
  }
  

  const onCreated = async (e) => {
    setCoordinates(null);
    const { layerType, layer } = e;

    if (layerType === 'rectangle') {
      const bounds = layer.getBounds();
      const detailedAreaData = await fetchDetailedAreaData(bounds);
      const segments = segmentRectangle(detailedAreaData);

      // Set the new polygons in the state to be rendered
      const newPolygons = segments.map(segment => {
        const areaType = determineAreaType(segment);
        const color = determineColor(areaType);
        return {
          positions: segment.coordinates,
          color: color,
        };
      });

      setPolygons(newPolygons);
    }
    if ([ 'circle', 'circlemarker','marker'].includes(layerType)) {
      const { _latlngs } = layer;
      setCoordinates(_latlngs[0]);
    }
    if (layerType === 'polyline') {
      const latlngs = layer.getLatLngs();
      setCoordinates(latlngs.map((latlng) => [latlng.lat, latlng.lng]));
    }
  };

  function determineColor(areaType) {
    // Define a mapping of area types to colors
    const colorMapping = {
      residential: 'blue',
      commercial: 'red',
      industrial: 'orange',
      park: 'green',
      farmland: 'yellow',
      default: 'grey', // default color if areaType is not recognized
    };
  
    // Return the color corresponding to the areaType, or the default color
    return colorMapping[areaType] || colorMapping.default;
  }

  function segmentRectangle(detailedAreaData) {
    // This function assumes that detailedAreaData is an array of objects
    // where each object represents an area with a type and coordinates.
  
    // Segmentation logic goes here. For example, you might want to group areas by type:
    const segmentsByType = detailedAreaData.reduce((acc, area) => {
      // Initialize an array in the accumulator if it doesn't exist for this type
      if (!acc[area.type]) {
        acc[area.type] = [];
      }
  
      // Add the area to the array for its type
      acc[area.type].push(area.coordinates);
  
      return acc;
    }, {});
  
    // Convert the segments by type into an array of segment objects
    const segments = Object.entries(segmentsByType).map(([type, coordinatesArray]) => {
      // You might want to merge coordinates or perform other operations
      // to ensure each segment is represented the way you need it for drawing.
      // For simplicity, this example just uses the arrays of coordinates as-is.
  
      return {
        type: type,
        coordinates: coordinatesArray,
      };
    });
  
    return segments;
  }
  

  const handleSave = () => {
    localStorage.setItem('mapCoordinates', JSON.stringify(coordinates));
    setSavedData({
      coordinates: coordinates
    });
  };

  const handleDelete = () => {
    localStorage.removeItem('mapCoordinates');
    setSavedData({
      coordinates: []
    });
    setCoordinates(null);
  };

  return (
    <div className="h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col w-full h-[60%]">
      <MapContainer center={[51.505, -0.09]} zoom={13} className="flex-grow">
          <Search />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={onCreated}
              draw={{
                rectangle: true,
                circle: false,
                circlemarker: false,
                polyline: true,
                marker: false,
              }}
            />
            {polygons.map((poly, index) => (
              <Polygon key={index} positions={poly.positions} color={poly.color} />
            ))}
          </FeatureGroup>
        </MapContainer>
        <div className="p-4 bg-gray-100">           
          <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSave}>Save Data</button>
          <button className="mt-2 ml-2 px-4 py-2 bg-red-500 text-white rounded" onClick={handleDelete}>Delete Data</button>
        </div>
      </div>
      <div className="flex flex-col w-full max-w-screen-lg mt-4">
        <h2 className="text-xl font-bold mb-2">Saved Data:</h2>
        <pre className="bg-gray-200 p-4 rounded-md overflow-auto">
          {JSON.stringify(savedData.coordinates, null, 2)}
        </pre>
      </div>
    </div>
  );
}

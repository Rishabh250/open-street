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
      return []; 
    }
  }
  
  function processOverpassApiResponse(data) {
  
    const areas = data.elements.filter(element => element.type === 'way' && element.tags && element.tags.landuse);
    const polygons = areas.map(area => {
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
    const type = segment.type;
  
    return type;
  }
  

  const onCreated = async (e) => {
    setCoordinates(null);
    const { layerType, layer } = e;

    if (layerType === 'rectangle') {
      const bounds = layer.getBounds();
      const detailedAreaData = await fetchDetailedAreaData(bounds);
      const segments = segmentRectangle(detailedAreaData);

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
    const colorMapping = {
      residential: 'blue',
      commercial: 'red',
      industrial: 'orange',
      park: 'green',
      farmland: 'yellow',
      default: 'grey',
    };
  
    return colorMapping[areaType] || colorMapping.default;
  }

  function segmentRectangle(detailedAreaData) {
  
    const segmentsByType = detailedAreaData.reduce((acc, area) => {
      if (!acc[area.type]) {
        acc[area.type] = [];
      }
  
      acc[area.type].push(area.coordinates);
  
      return acc;
    }, {});
  
    const segments = Object.entries(segmentsByType).map(([type, coordinatesArray]) => {
  
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

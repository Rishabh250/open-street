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
  const [layers, setLayer] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [flightPath, setFlightPath] = useState(null);
  const [areaData, setAreaData] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [flightTime, setFlightTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const riskWeights = {
    road: 1.5,
    residential: 1.2,
    commercial: 1.3,
    park: 0.8,
    farmland: 0.7,
    forest: 0.6,
    industrial: 1.4,
    railway: 1.6,
    airport: 2.0,
    water: 0.9,
    mountain: 1.8,
    desert: 1.1,
    urban: 1.5,
    rural: 1.0,
    school: 1.7,
    hospital: 1.7,
    stadium: 1.4,
    construction: 1.5,
    military: 2.0,
    cemetery: 1.0,
    churchyard: 1.0,
    religious: 1.0,
    governmental: 1.0,
    jail: 1.0,
    grass: 0.8,
  };


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
        way["highway"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
        relation["highway"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
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

  function isPointInPolygon(point, polygon) {
    let x = point[0], y = point[1];
  
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i][0], yi = polygon[i][1];
      let xj = polygon[j][0], yj = polygon[j][1];
  
      let intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
  
    return inside;
  }
  
  
  function determineAreaType(segment, areaData) {

    if ( areaData ) {
      for (const area of areaData) {
        const { coordinates, type } = area;
    
        if (isPointInPolygon(segment, coordinates)) {
          return type;
        }
      }
    
      return 'unknown';
    }

    const type = segment.type;

    return type;
   
  }
  
  

  const onCreated = async (e) => {
    setCoordinates(null);
    const { layerType, layer } = e;

    if (layerType === 'polyline') {
      const latlngs = layer.getLatLngs();
      const gpsPoints = latlngs.map((latlng) => [latlng.lat, latlng.lng]);
      setFlightPath(gpsPoints);
    }

    if (layerType === 'rectangle') {
      setLayer(layer);
    }
    if ([ 'circle', 'circlemarker','marker'].includes(layerType)) {
      const { _latlngs } = layer;
      setCoordinates(_latlngs[0]);
    }
    if (layerType === 'polyline') {
      const latlngs = layer.getLatLngs();
      layer.setStyle({ color: 'black' });
      setCoordinates(latlngs.map((latlng) => [latlng.lat, latlng.lng]));
    }
  };

  function determineColor(areaType) {
  
    const colorMapping = {
      road: 'red',
      residential: 'yellow',
      commercial: 'yellow',
      park: 'green',
      pond: 'green',
      farmland: 'green',
      infrastructure: 'darkgrey',
      jail: 'darkgrey',
      stadium: 'darkgrey',
      school: 'darkgrey',
      retail: 'yellow',
      hospitality: 'yellow',
      governmental: 'yellow',
      village_green: 'yellow',
      courtyard: 'yellow',
      garages: 'yellow',
      mixed: 'yellow',
      yard: 'yellow',
      plaza: 'green',
      recreation_ground: 'green',
      leisure: 'green',
      meadow: 'green',
      flowerbed: 'green',
      greenfield: 'green',
      forest: 'green',
      farmyard: 'green',
      allotments: 'green',
      plant_nursery: 'green',
      grass: 'green',
      orchard: 'green',
      apiary: 'green',
      animal_keeping: 'green',
      greenhouse_horticulture: 'green',
      bed: 'green',
      industrial: 'yellow',
      construction: 'yellow',
      planned_construction: 'yellow', 
      brownfield: 'yellow', 
      depot: 'yellow', 
      cemetery: 'darkgrey',
      churchyard: 'darkgrey',
      military: 'darkgrey',
      railway: 'darkgrey',
      religious: 'darkgrey',
      education: 'darkgrey',
      scrub: 'darkgrey',
      dead_allotments: 'darkgrey',
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

  const handleGroundDetails = async () => {
    if (!layers) {
      alert('Please draw a shape on the map first.');
      return;
    }
  
    setIsLoading(true);
  
    const bounds = layers.getBounds();
    try {
      const detailedAreaData = await fetchDetailedAreaData(bounds);
      setAreaData(detailedAreaData);
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
    } catch (error) {
      console.error('Error while getting ground profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  function calculateTotalDistance(flightPath) {
    let totalDistance = 0;
    for (let i = 0; i < flightPath.length - 1; i++) {
      totalDistance += calculateDistance(flightPath[i], flightPath[i + 1]);
    }
    return totalDistance;
  }
  
  function calculateRiskScore(flightPath, areaData) {
    let weightedDistance = 0;
    let totalDistance = 0;
    
    flightPath.forEach((segment, index) => {
      if (index < flightPath.length - 1) {
        const segmentDistance = calculateDistance(segment, flightPath[index + 1]);
        const areaType = determineAreaType(segment, areaData);
        const riskWeight = riskWeights[areaType] || 1;
        weightedDistance += segmentDistance * riskWeight;
        totalDistance += segmentDistance;
      }
    });
  
    return totalDistance > 0 ? weightedDistance / totalDistance : 0;
  }
  
  function calculateDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
  
    const lat1 = degreesToRadians(point1[0]); // Convert latitude of point1 from degrees to radians
    const lat2 = degreesToRadians(point2[0]); // Convert latitude of point2 from degrees to radians
    const deltaLat = degreesToRadians(point2[0] - point1[0]); // Difference in latitude
    const deltaLon = degreesToRadians(point2[1] - point1[1]); // Difference in longitude
  
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) * 
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Distance in meters
  }
  
  function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  function calculateFlightTime(flightPath, speed = 10) {
    const totalDistance = calculateTotalDistance(flightPath);
    return totalDistance / speed; // time in seconds
  }
  

  const handleSave = async () => {

    localStorage.setItem('mapCoordinates', JSON.stringify(coordinates));
    setSavedData({
      coordinates: coordinates
    });

    if (!coordinates) {
      alert('Please draw a shape on the map first.');
      return;
    }

    const flightTime = calculateFlightTime(coordinates);
    const riskScore = calculateRiskScore(coordinates, areaData);

    setRiskScore(riskScore);
    setFlightTime(flightTime);
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
          <button className="mt-2 ml-2 px-4 py-2 bg-green-500 text-white rounded" onClick={handleGroundDetails}>Ground Profile</button>

        </div>
      </div>
      <div className="flex flex-col w-full max-w-screen-lg mt-4">
      {isLoading && (
      <p>Loading Ground Profile...</p>
    )}
      {riskScore !== null && (
          <p className="text-lg">Risk Score: {riskScore.toFixed(2)}</p>
        )}
        {flightTime !== null && (
          <p className="text-lg">Flight Time: {flightTime.toFixed(2)} seconds</p>
        )}
        <h2 className="text-xl font-bold mb-2">Saved Data:</h2>
        <pre className="bg-gray-200 p-4 rounded-md overflow-auto">
          {JSON.stringify(savedData.coordinates, null, 2)}
        </pre>
      </div>
    </div>
  );
}

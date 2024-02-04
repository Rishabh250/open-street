import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap, Polygon } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/assets/css/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { API_QUERY, COLOR_MAPPING, LAND_TYPES, MAIN_CATEGORIES, RISK_WEIGHTS, ROAD_CATEGORIES } from '@/utils/constant';

let EditControl;
if (typeof window !== 'undefined') {
  EditControl = require('react-leaflet-draw').EditControl;
}

const Search = () => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider,
        style: 'bar'
      });
      map.addControl(searchControl);

      return () => map.removeControl(searchControl);
    }
  }, [ map ]);

  return null;
};

export default function MapPage({ handleGroundClick }) {

  const [ coordinates, setCoordinates ] = useState(null);
  const [ layers, setLayer ] = useState(null);
  const [ polygons, setPolygons ] = useState([]);
  const [ areaData, setAreaData ] = useState(null);
  const [ riskScore, setRiskScore ] = useState(1);
  const [ flightTime, setFlightTime ] = useState(null);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ layersCord, setLayerCord ] = useState(null);

  const processOverpassApiResponse = (data) => {
    const features = [];

    const types = LAND_TYPES;
    types.forEach(type => {
      const elements = data.elements.filter(element => element.type === 'way' && element.tags && element.tags[type]);
      elements.forEach(element => {
        const coordinates = element.nodes.map(nodeId => {
          const node = data.elements.find(e => e.type === 'node' && e.id === nodeId);

          return node ? [ node.lat, node.lon ] : null;
        }).filter(coord => !!coord);

        if (coordinates.length > 0) {
          features.push({
            type: element.tags[type],
            coordinates: coordinates
          });
        }
      });
    });

    return features;
  };

  const fetchDetailedAreaData = async() => {

    const polygonCoords = [].concat(...coordinates.map(coord => [ coord.lat, coord.lng ]));

    const polygonString = polygonCoords.join(' ');

    const query = API_QUERY({ polygonString });

    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    try {
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      return processOverpassApiResponse(data);
    } catch (error) {

      return [];
    }
  };

  const isPointInPolygon = (point, polygon) => {

    const x = point[0], y = point[1];

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];

      const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  };
  const determineAreaType = (segment, areaData) => {

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

  };

  const onCreated = async (e) => {
    setCoordinates(null);
    const { layerType, layer } = e;

    if (layerType === 'polygon') {
      setLayer(null);
      setPolygons([]);

      layer.setStyle({ color: 'black' });
      setCoordinates(layer.getLatLngs()[0]);
      setLayer(layer);
    }
    if ([ 'circle', 'circlemarker', 'marker' ].includes(layerType)) {
      const { _latlngs } = layer;
      setCoordinates(_latlngs[0]);
    }
    if (layerType === 'polyline') {
      const latlngs = layer.getLatLngs();
      layer.setStyle({ color: 'grey' });
      setCoordinates(latlngs.map((latlng) => [ latlng.lat, latlng.lng ]));
    }
  };

  const determineColor = (areaType) => {

    return COLOR_MAPPING[areaType] || COLOR_MAPPING.default;
  };

  const convertToLatLngBounds = (boundsData) => {
    if (!boundsData || !boundsData._southWest || !boundsData._northEast) {
      console.error('Invalid bounds data: missing properties');

      return null;
    }

    const { lat: swLat, lng: swLng } = boundsData._southWest;
    const { lat: neLat, lng: neLng } = boundsData._northEast;

    if (typeof swLat !== 'number' || typeof swLng !== 'number' || typeof neLat !== 'number' || typeof neLng !== 'number') {
      console.error('Invalid bounds data: coordinates are not numbers');

      return null;
    }

    return L.latLngBounds([ boundsData._southWest, boundsData._northEast ]);
  };

  const handleGroundDetails = async ({ fetchedLayers }) => {

    setIsLoading(true);
    setAreaData(null);
    setPolygons([]);
    setRiskScore(null);
    setFlightTime(null);

    const layer = layers || fetchedLayers;

    if (!layer) {
      alert('Please draw a shape on the map first.');

      return;
    }

    const bounds = fetchedLayers ? fetchedLayers.bounds : layers.getBounds();

    setLayerCord({
      bounds: {
        _southWest: { lat: bounds._southWest.lat, lng: bounds._southWest.lng },
        _northEast: { lat: bounds._northEast.lat, lng: bounds._northEast.lng }
      },
      layerType: 'polygon'
    });

    try {
      const latLngBounds = convertToLatLngBounds(bounds) || bounds;

      const detailedAreaData = await fetchDetailedAreaData(latLngBounds);
      setAreaData(detailedAreaData);

      const newLines = [];
      detailedAreaData.forEach(area => {
        const coordinates = area.coordinates;
        const type = area.type;
        const color = determineColor(type);

        newLines.push({
          positions: coordinates,
          color: color,
          opacity: [ 'red', 'blue' ].includes(color) ? 0 : 0.8
        });
      });

      setPolygons(newLines);
      setIsLoading(false);
    } catch (error) {
      console.error('Error while getting ground profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const degreesToRadians = (degrees) => {
    return degrees * Math.PI / 180;
  };

  const calculateDistance = (point1, point2) => {
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
  };

  const calculateTotalDistance = (flightPath) => {
    let totalDistance = 0;
    for (let i = 0; i < flightPath.length - 1; i++) {
      totalDistance += calculateDistance(flightPath[i], flightPath[i + 1]);
    }

    return totalDistance;
  };

  const calculateRiskScore = (flightPath, areaData) => {
    let weightedDistance = 0;
    let totalDistance = 0;

    flightPath.forEach((segment, index) => {
      if (index < flightPath.length - 1) {
        const segmentDistance = calculateDistance(segment, flightPath[index + 1]);
        const areaType = determineAreaType(segment, areaData);
        const riskWeight = RISK_WEIGHTS[areaType] || 1;
        weightedDistance += segmentDistance * riskWeight;
        totalDistance += segmentDistance;
      }
    });

    return totalDistance > 0 ? weightedDistance / totalDistance : 0;
  };

  const calculateFlightTime = (flightPath, speed = 10) => {
    const totalDistance = calculateTotalDistance(flightPath);

    return totalDistance / speed; // time in seconds
  };

  const handleSave = async () => {

    if (!coordinates) {
      alert('Please draw a coordinates on the map first.');

      return;
    }

    const flightTime = calculateFlightTime(coordinates);
    const riskScore = calculateRiskScore(coordinates, areaData);

    setRiskScore(riskScore);
    setFlightTime(flightTime);
    handleGroundClick({ riskScore, flightTime, layers: layersCord, coordinates });
  };

  const handleDelete = () => {
    localStorage.removeItem('mapCoordinates');
    setCoordinates(null);
  };

  return (
    <div className="h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col w-full h-[90%]">
        <MapContainer center={[ 51.505, -0.09 ]} zoom={13} className="flex-grow">
          <Search />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FeatureGroup>
            <EditControl
              onCreated={onCreated}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                polyline: true,
                marker: false
              }}
            />
            {polygons.map((poly, index) => {
              const { color, positions, opacity } = poly;

              return (
                <Polygon
                  key={index}
                  positions={positions}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: opacity,
                    weight: 1,
                    color: color
                  }}
                />
              );
            })}
          </FeatureGroup>
        </MapContainer>
        <div className="p-4 bg-gray-100">
          <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSave}>Save Data</button>
          <button className="mt-2 ml-2 px-4 py-2 bg-red-500 text-white rounded" onClick={handleDelete}>Delete Data</button>
          <button className="mt-2 ml-2 px-4 py-2 bg-green-500 text-white rounded" onClick={handleGroundDetails}>Ground Profile</button>
        </div>
      </div>
      <div className="flex flex-col w-full max-w-screen-lg mt-4">
        {isLoading &&
          <p>Loading Ground Profile...</p>
        }
        {riskScore !== null &&
          <p className="text-lg">Risk Score: {riskScore.toFixed(2)}</p>
        }
        {flightTime !== null &&
          <p className="text-lg">Flight Time: {flightTime.toFixed(2)} seconds</p>
        }
        <pre className="bg-gray-200 p-4 rounded-md overflow-auto w-full">
          <div className='grid grid-cols-6 md:grid-cols-4 gap-4 w-full'>
            {Object.keys(MAIN_CATEGORIES).map((category, index) =>
              <div key={index} className="flex flex-col">
                <div className="w-4 h-4 rounded-full mb-1" style={{ backgroundColor: MAIN_CATEGORIES[category] }}></div>
                <p className="text-xs whitespace-normal">{category}</p>
              </div>
            )}
          </div>
        </pre>
      </div>
    </div>
  );
}


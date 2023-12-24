import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap, Polygon } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/assets/css/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import L from 'leaflet';

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

export default function MapPage({ handleGroundClick }) {

  const [coordinates, setCoordinates] = useState(null);
  const [layers, setLayer] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [flightPath, setFlightPath] = useState(null);
  const [areaData, setAreaData] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [flightTime, setFlightTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [layersCord, setLayerCord] = useState(null);

  useEffect(() => {

    const user = JSON.parse(localStorage.getItem('user'));

    const fetchGroundProfile = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const docRef = doc(db, 'userGroundProfiles', `${user.uid}`);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            const { layers, riskScore, flightTime, coordinates } = data;

            const cords = JSON.parse(coordinates);


            setIsLoading(true);
            setRiskScore(riskScore);
            setFlightTime(flightTime);
            setCoordinates(JSON.parse(coordinates));
            if (layers) {
              handleGroundDetails({ fetchedLayers: layers });
            }
            setIsLoading(false);

          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching ground profile: ", error);
        }
      }
    };

    fetchGroundProfile();
  }, []);

  
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
    hospital: 'darkred',
    parking: 'darkorange',
    retail: 'darkorange',
    yes: 'yellow',
    motorway: 'red',
    motorway_link: 'red',
    service: 'red',
    tertiary: 'red',
    secondary: 'red',
    trunk_link: 'red',
    trunk: 'red',
    unclassified: 'red',
    primary: 'red',
    secondary_link: 'red',
    cycleway: 'red',
    footway: 'red',
    abandoned: 'red',
    light_rail: 'red',
    rail: 'red',
    second_hand: 'red',
    default: 'transparent',
  };


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
    scrub: 0.8,
    plaza: 0.9,
    recreation_ground: 0.8,
    leisure: 0.8,
    meadow: 0.7,
    flowerbed: 0.7,
    greenfield: 0.7,
    farmyard: 0.7,
    allotments: 0.7,
    plant_nursery: 0.7,
    orchard: 0.7,
    apiary: 0.7,
    animal_keeping: 0.7,
    greenhouse_horticulture: 0.7,
    bed: 0.7,
    village_green: 1.0,
    courtyard: 1.0,
    garages: 1.0,
    mixed: 1.0,
    yard: 1.0,
    brownfield: 1.4,
    depot: 1.4,
    parking: 1.3,
    retail: 1.3,
    motorway: 1.8,
    motorway_link: 1.8,
    service: 1.2,
    tertiary: 1.2,
    secondary: 1.3,
    trunk_link: 1.5,
    trunk: 1.5,
    unclassified: 1.1,
    primary: 1.4,
    secondary_link: 1.3,
    cycleway: 0.9,
    footway: 0.9,
    abandoned: 1.0,
    light_rail: 1.6,
    rail: 1.6,
    second_hand: 1.0,
    default: 1.0,
  };

  async function fetchDetailedAreaData(bounds) {

    const query = `[out:json][timeout:25];
    (
      // Primary roads within the bounding box
      way["highway"="primary"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["highway"="primary"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});

      // Secondary roads within the bounding box
      way["highway"="secondary"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["highway"="secondary"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});

      // Land use data
      way["landuse"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["landuse"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Highway data
      way["highway"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["highway"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Natural features
      way["natural"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["natural"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Amenities
      way["amenity"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["amenity"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Leisure areas
      way["leisure"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["leisure"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Buildings
      way["building"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["building"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Railway data
      way["railway"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["railway"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Aeroway data
      way["aeroway"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["aeroway"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Waterway data
      way["waterway"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["waterway"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Tourism data
      way["tourism"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["tourism"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Historic data
      way["historic"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["historic"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Shop data
      way["shop"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["shop"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      // Hospitals
      node["amenity"="hospital"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      way["amenity"="hospital"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["amenity"="hospital"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
    
      // Parking areas
      node["amenity"="parking"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      way["amenity"="parking"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      relation["amenity"="parking"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      
      // Roads (general query for all types of roads)
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
    let features = [];

    const types = ['landuse', 'highway', 'amenity', 'natural', 'leisure', 'building', 'railway', 'aeroway', 'waterway', 'tourism', 'historic', 'shop', 
    'amenity', 'hospital', 'parking', 'highway'];
    types.forEach(type => {
        const elements = data.elements.filter(element => element.type === 'way' && element.tags && element.tags[type]);
        elements.forEach(element => {
            const coordinates = element.nodes.map(nodeId => {
                const node = data.elements.find(e => e.type === 'node' && e.id === nodeId);
                return node ? [node.lat, node.lon] : null;
            }).filter(coord => !!coord);

            if (coordinates.length > 0) {
                features.push({
                    type: element.tags[type],
                    coordinates: coordinates,
                });
            }
        });
    });

    return features;
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

    if (layerType === 'polygon') {
      layer.setStyle({ color: 'black' });
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

  const convertToLatLngBounds = (boundsData) => {
    if (!boundsData || !boundsData._southWest || !boundsData._northEast) {
      console.error("Invalid bounds data: missing properties");
      return null;
    }
  
    const { lat: swLat, lng: swLng } = boundsData._southWest;
    const { lat: neLat, lng: neLng } = boundsData._northEast;
  
    if (typeof swLat !== 'number' || typeof swLng !== 'number' || typeof neLat !== 'number' || typeof neLng !== 'number') {
      console.error("Invalid bounds data: coordinates are not numbers");
      return null;
    }
  
    return L.latLngBounds([boundsData._southWest, boundsData._northEast]);
  };

  const handleGroundDetails = async ({ fetchedLayers }) => {

    setIsLoading(true);

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
      setIsLoading(false);
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
      <div className="flex flex-col w-full h-[60%]">
      <MapContainer center={[51.505, -0.09]} zoom={13} className="flex-grow">
          <Search />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={onCreated}
              draw={{
                rectangle: false,
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
 <pre className="bg-gray-200 p-4 rounded-md overflow-auto w-full">
  <div className='grid grid-cols-6 md:grid-cols-4 gap-4 w-full'>
    {
      colorMapping && Object.keys(colorMapping).map((key, index) => (
        <div key={index} className="flex flex-col">
          <div className="w-4 h-4 rounded-full mb-1" style={{ backgroundColor: colorMapping[key] }}></div>
          <p className="text-xs whitespace-normal">{key}</p>
        </div>
      ))
    }
  </div>
</pre>

      </div>
    </div>
  );
}

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
  const [riskScore, setRiskScore] = useState(1);
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
    cable: 'blue',
    water_tower: 'blue',
    motorway: 'red',
    motorway_link: 'red',
    service: 'yellow',
    tertiary: 'red',
    trunk_link: 'red',
    trunk: 'red',
    unclassified: 'red',
    primary: 'red',
    secondary_link: 'red',
    residential: 'yellow',
    commercial: 'yellow',
    retail: 'red',
    governmental: 'yellow',
    village_green: 'yellow',
    courtyard: 'yellow',
    garages: 'yellow',
    mixed: 'yellow',
    yard: 'yellow',
    industrial: 'yellow',
    construction: 'yellow',
    planned_construction: 'yellow',
    brownfield: 'yellow',
    depot: 'yellow',
    yes: 'transparent',
    secondary: 'red',
    park: 'green',
    pond: 'green',
    farmland: 'green',
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
    river: 'green',
    infrastructure: 'darkgrey',
    jail: 'darkgrey',
    stadium: 'darkgrey',
    school: 'darkgrey',
    cemetery: 'darkgrey',
    churchyard: 'darkgrey',
    military: 'darkgrey',
    railway: 'darkgrey',
    religious: 'darkgrey',
    education: 'darkgrey',
    scrub: 'darkgrey',
    dead_allotments: 'darkgrey',
    parking: 'darkorange',
    hospital: 'white',
    default: 'transparent'
  };

  const mainCategories = {
    'Roads': 'red',
    'Commercial and Residential': 'yellow',
    'Critical facilities': 'darkgrey',
    'Critical infrastructure': 'black',
    'Parks and open spaces': 'green'
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
    abandoned: 1.0,
    light_rail: 1.6,
    rail: 1.6,
    second_hand: 1.0,
    default: 1.0,
  };

  async function fetchDetailedAreaData(bounds) {

    const polygonCoords = [].concat(...coordinates.map(coord => [coord.lat, coord.lng]));

    const polygonString = polygonCoords.join(' ');

    const query = `[out:json][timeout:25];
    (
      // Primary roads within the bounding box
      way(poly:"${polygonString}")["primary"];
      relation(poly:"${polygonString}")["primary"];

      // Secondary roads within the bounding box
      way(poly:"${polygonString}")["secondary"];
      relation(poly:"${polygonString}")["secondary"];

      // Land use data
      way(poly:"${polygonString}")["landuse"];
      relation(poly:"${polygonString}")["landuse"];
    
      // Highway data
      way(poly:"${polygonString}")["highway"];
      relation(poly:"${polygonString}")["highway"];
    
      // Natural features
      way(poly:"${polygonString}")["natural"];
      relation(poly:"${polygonString}")["natural"];
    
      // Amenities
      way(poly:"${polygonString}")["amenity"];
      relation(poly:"${polygonString}")["amenity"];
    
      // Leisure areas
      way(poly:"${polygonString}")["leisure"];
      relation(poly:"${polygonString}")["leisure"];
    
      // Buildings
      way(poly:"${polygonString}")["building"];
      relation(poly:"${polygonString}")["building"];
    
      // Railway data
      way(poly:"${polygonString}")["railway"];
      relation(poly:"${polygonString}")["railway"];
    
      // Aeroway data
      way(poly:"${polygonString}")["aeroway"];
      relation(poly:"${polygonString}")["aeroway"];
    
      // Waterway data
      way(poly:"${polygonString}")["waterway"];
      relation(poly:"${polygonString}")["waterway"];
    
      // Tourism data
      way(poly:"${polygonString}")["tourism"];
      relation(poly:"${polygonString}")["tourism"];
    
      // Historic data
      way(poly:"${polygonString}")["historic"];
      relation(poly:"${polygonString}")["historic"];
    
      // Shop data
      way(poly:"${polygonString}")["shop"];
      relation(poly:"${polygonString}")["shop"];
      // Hospitals
      node(poly:"${polygonString}")["amenity"="hospital"];
      way(poly:"${polygonString}")["amenity"="hospital"];
      relation(poly:"${polygonString}")["amenity"="hospital"];
    
      // Parking areas
      node(poly:"${polygonString}")["amenity"="parking"];
      way(poly:"${polygonString}")["amenity"="parking"];
      relation(poly:"${polygonString}")["amenity"="parking"];
      
      // Roads (general query for all types of roads)
      way(poly:"${polygonString}")["highway"];
      relation(poly:"${polygonString}")["highway"];

      // Power cables
      way(poly:"${polygonString}")["power"="cable"];
      relation(poly:"${polygonString}")["power"="cable"];

      // Power lines
      way(poly:"${polygonString}")["power"="line"];
      relation(poly:"${polygonString}")["power"="line"];

      // Power towers
      node(poly:"${polygonString}")["power"="tower"];
      way(poly:"${polygonString}")["power"="tower"];
      relation(poly:"${polygonString}")["power"="tower"];

      // Water Towers
      node(poly:"${polygonString}")["man_made"="water_tower"];
      way(poly:"${polygonString}")["man_made"="water_tower"];
      relation(poly:"${polygonString}")["man_made"="water_tower"];
      
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
    'amenity', 'hospital', 'parking', 'highway', 'power', 'man_made'];
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

    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
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
      setLayer(null);
      setPolygons([]);

      layer.setStyle({ color: 'black' });
      setCoordinates(layer.getLatLngs()[0]);
      setLayer(layer);
    }
    if ([ 'circle', 'circlemarker','marker'].includes(layerType)) {
      const { _latlngs } = layer;
      setCoordinates(_latlngs[0]);
    }
    if (layerType === 'polyline') {
      const latlngs = layer.getLatLngs();
      layer.setStyle({ color: 'grey' });
      setCoordinates(latlngs.map((latlng) => [latlng.lat, latlng.lng]));
    }
  };


  function isRoadInsideParkingArea(roadSegment, parkingAreas) {
    return parkingAreas.some(parkingArea => {


      return roadSegment.every(point => {
        return isPointInPolygon(parkingArea, point );
      });
    });
  }
  
  function determineColor(areaType, segmentCoordinates, parkingAreas) {
    console.log('areaType', areaType)

    return colorMapping[areaType] || colorMapping.default;
  }  
  
  
  function segmentRectangle(detailedAreaData) {
    let coordinatesWithType = [];
  
    detailedAreaData.forEach(area => {
      area.coordinates.forEach(coord => {
        coordinatesWithType.push({
          type: area.type, // Each coordinate now knows its segment's type
          coordinate: coord,
        });
      });
    });
  
    return coordinatesWithType;
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

      for (let i = 0; i < coordinates.length - 1; i++) {
        const segment = [coordinates[i], coordinates[i + 1]];
        newLines.push({
          positions: segment,
          color: color,
        });
      }
    });
  
      setPolygons(newLines);
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
      <div className="flex flex-col w-full h-[90%]">
      <MapContainer center={[51.505, -0.09]} zoom={13} className="flex-grow">
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
                marker: false,
              }}
            />
            {polygons.map((poly, index) => {
              return (
                <Polygon
                key={index}
                positions={poly.positions}
                color={poly.color}
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
      Object.keys(mainCategories).map((category, index) => (
        <div key={index} className="flex flex-col">
          <div className="w-4 h-4 rounded-full mb-1" style={{ backgroundColor: mainCategories[category] }}></div>
          <p className="text-xs whitespace-normal">{category}</p>
        </div>
      ))
    }
  </div>
</pre>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap, Polygon, Marker } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
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

  useEffect(() => {
    if (savedData.coordinates.length) {
      setCoordinates(savedData.coordinates);
    }
  }, []);

  const onCreated = (e) => {
    const { layerType, layer } = e;
    if (['rectangle', 'circle', 'circlemarker', 'polyline','marker'].includes(layerType)) {
      const { _latlngs } = layer;
      setCoordinates(_latlngs[0]);
    }
  };

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
            {EditControl && (
              <EditControl
                position="topright"
                onCreated={onCreated}
                draw={{
                  rectangle: true,
                  circle: true,
                  circlemarker: true,
                  polyline: true,
                  marker: true,
                }}
              />
            )}
            {coordinates && <Polygon positions={coordinates} />} {/* You can replace Polygon with Marker if needed */}
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

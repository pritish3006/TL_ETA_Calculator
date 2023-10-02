import './App.css';
import React, { useRef, useEffect, useState } from 'react';
import * as mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1IjoicHJpdGlzaDMwMDYiLCJhIjoiY2xuMjRqdG9mMDQ3NzJrbXN6b2h3am1wcSJ9.42KxKdKZC68olTiqz2viHg';

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(2);

  const traffic_lights = [
    {'name': 'TL1', 'lat': 30.26815, 'lon': -97.74491},
    {'name': 'TL2', 'lat': 30.26644, 'lon': -97.74295},
    {'name': 'TL3', 'lat': 30.26720, 'lon': -97.73950},
    {'name': 'TL4', 'lat': 30.26990, 'lon': -97.74180},
    {'name': 'TL5', 'lat': 30.27050, 'lon': -97.73800},
  ];
 
  const trafficLightsGeoJSON = {
    type: 'FeatureCollection',
    features: traffic_lights.map(light => ({
      type: 'Feature',
      properties: { name: light.name },
      geometry: {
        type: 'Point',
        coordinates: [light.lon, light.lat]
      }
    }))
  };

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom
    });

    map.current.on('load', () => {
        // Load an external image for the traffic light symbol
        map.current.loadImage(
            'https://raw.githubusercontent.com/pritish3006/TL_ETA_Calculator/main/client/public/tl.png?token=GHSAT0AAAAAACHTKAJJCSEM65JK4X5AERFYZI2QLPQ', // image URL
            (error, image) => {
                if (error) throw error;

                // Add the image to the map's style
                map.current.addImage('traffic-light', image);

                // Add the GeoJSON data source for the traffic lights
                map.current.addSource('traffic-lights', {
                    type: 'geojson',
                    data: trafficLightsGeoJSON
                });

                // Add a layer to display the traffic light symbols
                map.current.addLayer({
                    id: 'traffic-lights-layer',
                    type: 'symbol',
                    source: 'traffic-lights',
                    layout: {
                        'icon-image': 'traffic-light',
                        'icon-size': 0.05
                    }
                });
            }
        );
    });

    map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
    });

}, [lng, lat, zoom]);


  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
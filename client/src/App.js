import './App.css';
import React, { useRef, useEffect, useState } from 'react';
import * as mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { computeETA } from './eta_calc';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(2);
  const [clickCount, setClickCount] = useState(0);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [directions, setDirections] = useState(null);
  const trafficLightURL = process.env.TL_IMAGE_URL;


  const traffic_lights = [
    {'name': 'TL1', 'lat': 30.273674, 'lon': -97.744599},
    {'name': 'TL2', 'lat': 30.272768, 'lon': -97.744932},
    {'name': 'TL3', 'lat': 30.271851, 'lon': -97.74253},
    {'name': 'TL4', 'lat': 30.270895, 'lon': -97.745589},
    {'name': 'TL5', 'lat': 30.27302, 'lon': -97.757856},
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

  const handleMapClick = (e) => {
    if(!startPoint) {
      setStartPoint(e.lngLat);
    } else if(!endPoint) {
      setEndPoint(e.lngLat);
    }
    else {
      setStartPoint(null);
      setEndPoint(null);
      setClickCount(0);
      directions.removeRoutes();
    }
  };

useEffect(() => {
  if (map.current) return; // initialize map only once

  // initializing the map object
  map.current = new mapboxgl.Map({  // eslint-disable-line no-unused-vars
    container: mapContainer.current,  // This will render the map in the given div container
    style: 'mapbox://styles/mapbox/streets-v12', // This will render the default map style. You can use your custom style here
    center: [lng, lat], // This will define the default center of the map. Longitude comes first
    zoom: zoom // This will define the default zoom level
  });

  map.current.on('load', () => {
    // Load traffic light image from the given URL
    map.current.loadImage(
      trafficLightURL,
      (error, image) => {
        if (error) throw error; // Throw an error if something goes wrong
        // Adding the loaded image to the map's style
        map.current.addImage('traffic-light', image); // Here traffic-light is the name of the image
        // Adding the traffic lights layer to the map
        map.current.addSource('traffic-lights', { // Here traffic-lights is the name of the layer
          type: 'geojson',  // Here we are using geojson data format
          data: trafficLightsGeoJSON // Here we are using the geojson data that we have created above
        });
        map.current.addLayer({
          id: 'traffic-lights-layer',
          type: 'symbol',
          source: 'traffic-lights',
          layout: {
            'icon-image': 'traffic-light',
            'icon-size': 0.05
          }
        });
      });

    const directionsControl = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving',
      controls: {
        inputs: true,
        instructions: true
      }
    });

    map.current.addControl(directionsControl, 'top-left');
    setDirections(directionsControl);
    map.current.on('click', handleMapClick);

    // new event listener for when a route is generated
    directionsControl.on('route', (e) => {
      if (e.route && e.route.length > 0) {
        const currentRoute = e.route[0];
        const currentLocation = {
         lat : currentRoute.legs[0].steps[0].maneuver.location[1],
         lon : currentRoute.legs[0].steps[0].maneuver.location[0]
        }
        console.log(currentRoute);
           // Check if currentRoute and necessary properties exist
      if (!currentRoute || !currentRoute.geometry || !currentRoute.geometry.coordinates) {
        console.error("Required route properties not found.");
        return;
    } 

        const routeCoordinates = currentRoute.geometry.coordinates;
        const {nearestTrafficLight, eta} = computeETA(currentLocation, routeCoordinates, traffic_lights);

        // displaying the eta on the map
        alert('The Nearest Traffic Light is at: LAT: ${nearestTrafficLight.lat} and LON: ${nearestTrafficLight.lon}\nETA is: ${eta} minutes')
      }
    });

  });

  return () => map.current.remove();

}, []);


  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
# imports
from flask import render_template, request, jsonify
from flask_cors import CORS
import haversine as hs
from typing import List, Tuple

# setting up the traffic_light variable to be used in the calculate_eta function. This is a dict that contains the mock traffic light data.
traffic_lights = [
    {'name': 'TL1', 'lat': 30.26815, 'lon': -97.74491},  # Near Austin Convention Center
    {'name': 'TL2', 'lat': 30.26644, 'lon': -97.74295},  # Near 6th Street
    {'name': 'TL3', 'lat': 30.26720, 'lon': -97.73950},  # Near Republic Square
    {'name': 'TL4', 'lat': 30.26990, 'lon': -97.74180},  # Near State Capitol
    {'name': 'TL5', 'lat': 30.27050, 'lon': -97.73800},  # Near Waterloo Park
]

# get the vehicle's current location from the request
def get_current_location() -> Tuple[float, float]:
    """
    Returns the current location of the vehicle as a tuple of latitude and longitude.
    """
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    return float(lat), float(lon)

# get the vehicle's route from the request
import requests

def get_route(start: Tuple[float, float], end: Tuple[float, float]) -> List[Tuple[float, float]]:
    """
    Returns the route from the starting point to the endpoint as a list of tuples of latitude and longitude.
    """
    # make a request to the Google Maps Directions API
    response = requests.get(f'https://maps.googleapis.com/maps/api/directions/json?origin={start[0]},{start[1]}&destination={end[0]},{end[1]}&key=YOUR_API_KEY')
    
    # parse the response to get the route
    route = []
    for step in response.json()['routes'][0]['legs'][0]['steps']:
        route.append((step['start_location']['lat'], step['start_location']['lng']))
    route.append((end[0], end[1]))
    
    return route







// This is to compute the logic to find the nearest traffic light on the vehicle's route and to compute the ETA accordingly.
const RADIUS_OF_EARTH_KM = 6371; // Radius of the earth in km

function toRadians (degrees) { // Converts degrees to radians
    return degrees * (Math.PI / 180);
} 

export function haversineDistance(p1, p2) {
    // converting the latitudes and longitudes to radians
    const lat1 = toRadians(p1[1]);
    const lon1 = toRadians(p1[0]);
    const lat2 = toRadians(p2[1]);
    const lon2 = toRadians(p2[0]);
    // finding the latitudinal and longitudinal difference
    const dlon = lon2 - lon1;
    const dlat = lat2 - lat1;
    // applying the formula to calculate the distance
    const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) 
    + Math.cos(lat1) * Math.cos(lat2) 
    * Math.sin(dlon / 2) * Math.sin(dlon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return RADIUS_OF_EARTH_KM * c; // returns the distance in km
}

// method to convert the distance to miles
function toMiles(kmdistance) { // and then 'km's
    return kmdistance * 0.621371;
}

/**
 * @param {Array} currentLocation - Array of coordinates of the route
 * @param {Array} routeCoordinates - Array of coordinates of the route
 * @param {Array} trafficLights - Array of traffic lights
 * @returns {Object} - Object containing the nearest traffic light
 */
export function findNearestTrafficLight(currentLocation, routeCoordinates, trafficLights) {
    let nearestTrafficLight = null;
    let shortestDistance = Infinity;
    const threshold = 0.001; // This threshold (in km) determines how close a traffic light must be to be considered "on the route"

    // Check for route coordinates
    if (!Array.isArray(routeCoordinates) || !routeCoordinates.length) {
        console.error("routeCoordinates is either not defined, not an array, or empty.");
        return null;
    }

    for (const light of trafficLights) {
        for (const coord of routeCoordinates) {
            const distanceToCoord = haversineDistance(light, { lat: coord[1], lon: coord[0] });
            
            if (distanceToCoord <= threshold) {
                const distanceToLight = haversineDistance(currentLocation, light);

                if (distanceToLight < shortestDistance) {
                    shortestDistance = distanceToLight;
                    nearestTrafficLight = light;
                }
            }
        }
    }

    return nearestTrafficLight;
}

/**
 * @param {Array} currentLocation - The current location of the vehicle in the form of [lat, lon]
 * @param {Array} TrafficLights - Array of traffic light coordinates
 * @param {Array} SpeedLimit - The speed limit of the road in miles per hour. By default this is set to 30 mph for now.
 * @returns {Object} - The ETA in minutes
 */
export function computeETA(currentLocation, trafficLights, currentRoute, speedLimit = 30) {
    const neearestTrafficLight = findNearestTrafficLight(currentLocation, currentRoute, trafficLights);
    const distance = toMiles(haversineDistance(currentLocation, neearestTrafficLight));
    const eta = (distance / speedLimit) * 60; // in minutes
    // ETA computation can be improved by taking into account realtime and historic traffic data, user speed, other factors based on data availability. This will also prompt moving the computation to the backend.

    return {
        'eta': eta,
        'trafficLight': neearestTrafficLight
    };
}


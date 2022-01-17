import { Cloud } from "../interface";

// Lets use Lappeenranta as default location in case user denies geolocation request
let userLatitude = 61;
let userLongitude = 28;

// Calculate the distance between the client and the cloud and sort the list
export async function sortByDistance(clouds: Cloud[]): Promise<Cloud[]> {
    return getPosition().then(pos => {
        return sortList(clouds, pos);
    }).catch((error) => {
        console.log(error);
        return sortList(clouds, null);
    })
}

function sortList(clouds: Cloud[], pos: GeolocationPosition | null) {
    if (pos) {
        userLatitude = pos.coords.latitude;
        userLongitude = pos.coords.longitude;
    }
    const calculatedList: Cloud[] = [];
    clouds.forEach(element => {
        let distance = 0;
        distance = getDistanceFromLatLonInKm(element.latitude, element.longitude, userLatitude, userLongitude);
        element.distance = distance;
        calculatedList.push(element);
    });
    return calculatedList.sort(({ distance: a }, { distance: b }) => a - b);
}

// Get users geolocation
function getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
    );
}

// Calculate the distance in Km just for flavor using Haversine formula
// This is copied from https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return Math.round(d);
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}
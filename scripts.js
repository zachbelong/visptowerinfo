let searchResult = null;
let currentInfoWindow = null;
const drawnLines = [];
const markers = [];

function initMap() {
    const mapOptions = {
        center: { lat: 49.1925, lng: -98.0019 },
        zoom: 12,
        mapId: '422c64e430bb49e9'
    }

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);

    function calculateDistance(point1, point2) {
        return google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
    }

    function drawLinesAndLabels(startMarker, endMarker) {
        const distance = calculateDistance(startMarker.getPosition(), endMarker.getPosition());
        const line = new google.maps.Polyline({
            path: [startMarker.getPosition(), endMarker.getPosition()],
            geodesic: true,
            strokeColor: 'red',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        line.setMap(map);

        const middlePoint = new google.maps.LatLng(
            (startMarker.getPosition().lat() + endMarker.getPosition().lat()) / 2,
            (startMarker.getPosition().lng() + endMarker.getPosition().lng()) / 2
        );

        const distanceLabel = new google.maps.InfoWindow({
            position: middlePoint,
            content: `<strong>${(distance * 0.000621371).toFixed(2)} miles</strong>`
        });
        distanceLabel.open(map);
        drawnLines.push(line, distanceLabel);
    }

    function clearLinesAndLabels() {
        drawnLines.forEach(element => {
            element.setMap(null);
        });
        drawnLines.length = 0;
    }

    const markerData = [
        { lat: 49.18815, lng: -98.09984, label: 'Morden Elevator', infoContent: "towerdata/mordensouth.html" },
        { lat: 49.19390, lng: -98.15227, label: 'Morden West', infoContent: "towerdata/mordenwest.html" },
        { lat: 49.19376, lng: -97.94633, label: 'Winkler', infoContent: "towerdata/winkler.html" },
        { lat: 49.19105, lng: -98.02699, label: 'GVE', infoContent: "towerdata/gve.html" },
        { lat: 49.09427, lng: -99.34000, label: 'Cartwright', infoContent: "towerdata/cartwright.html" },
        { lat: 49.20524, lng: -98.38161, label: 'Darlingford', infoContent: "towerdata/darlingford.html" },
        { lat: 49.37477, lng: -98.23974, label: 'Miami', infoContent: "towerdata/miami.html" },
        { lat: 49.13411, lng: -97.94426, label: 'Schanzenfeld', infoContent: "towerdata/schanzenfeld.html" },
        { lat: 49.08128, lng: -97.93487, label: 'Hochfeld', infoContent: "towerdata/hochfeld.html" },
        { lat: 49.10988, lng: -97.89314, label: 'Kroekers', infoContent: "towerdata/kroekers.html" },
        { lat: 49.18192, lng: -97.88234, label: 'Reinfeld', infoContent: "towerdata/reinfeld.html" },
        { lat: 49.18997, lng: -97.76180, label: 'Plum Coulee', infoContent: "towerdata/plumcoulee.html" },
        { lat: 49.01377, lng: -97.91324, label: 'Fehrway', infoContent: "towerdata/fehrway.html" },
        { lat: 49.04360, lng: -97.86724, label: 'Reinland', infoContent: "towerdata/reinland.html" },
        { lat: 49.03674, lng: -97.82192, label: 'Schoenwiese', infoContent: "towerdata/schoenwiese.html" },
        { lat: 49.00875, lng: -97.56645, label: 'Gretna', infoContent: "towerdata/gretna.html" },
        { lat: 49.11331, lng: -97.55475, label: 'Altona North', infoContent: "towerdata/altonanorth.html" },
        { lat: 49.08738, lng: -97.55841, label: 'Altona South', infoContent: "towerdata/altonasouth.html" },
        { lat: 49.19892, lng: -97.54673, label: 'Rosenfeld', infoContent: "towerdata/rosenfeld.html" },
        { lat: 49.13209, lng: -97.39287, label: 'St. Joseph', infoContent: "towerdata/stjoseph.html" },
        { lat: 49.04152, lng: -97.39768, label: 'Halbstadt', infoContent: "towerdata/halbstadt.html" },
        { lat: 49.00111, lng: -97.21488, label: 'Emerson', infoContent: "towerdata/emerson.html" },
        { lat: 49.14141, lng: -97.15462, label: 'Dominion City', infoContent: "towerdata/dominioncity.html" },
        { lat: 49.25421, lng: -97.33635, label: 'St. Jean', infoContent: "towerdata/stjean.html" },
        { lat: 49.36698, lng: -97.93917, label: 'Roland', infoContent: "towerdata/roland.html" },
        { lat: 49.35809, lng: -97.58828, label: 'Lowe Farm', infoContent: "towerdata/lowefarm.html" },
        { lat: 49.50488, lng: -98.21054, label: 'Stephenfield', infoContent: "towerdata/stephenfield.html" },
        { lat: 49.51461, lng: -97.99363, label: 'Carman', infoContent: "towerdata/carman.html" },
        { lat: 49.51673, lng: -97.71663, label: 'Sperling', infoContent: "towerdata/sperling.html" },
        { lat: 49.45594, lng: -97.42118, label: 'Rosenort', infoContent: "towerdata/rosenort.html" },
        { lat: 49.56938, lng: -97.18249, label: 'Ste. Agathe', infoContent: "towerdata/stagathe.html" },
        { lat: 49.61375, lng: -97.31802, label: 'Domain', infoContent: "towerdata/domain.html" },
        { lat: 49.67922, lng: -97.44825, label: 'Sanford', infoContent: "towerdata/sanford.html" },
        { lat: 49.71344, lng: -97.59796, label: 'Starbuck', infoContent: "towerdata/starbuck.html" },
        { lat: 49.74314, lng: -97.77912, label: 'Fannystelle', infoContent: "towerdata/fannystelle.html" },
        { lat: 49.71140, lng: -97.25805, label: 'La Salle', infoContent: "towerdata/lasalle.html" },
        { lat: 49.77994, lng: -97.33172, label: 'Oak Bluff', infoContent: "towerdata/oakbluff.html" },
        { lat: 49.90476, lng: -97.77593, label: 'Elie', infoContent: "towerdata/elie.html" },
        { lat: 50.06568, lng: -97.73751, label: 'Marquette', infoContent: "towerdata/marquette.html" },
        { lat: 49.98988, lng: -97.10056, label: 'West St. Paul', infoContent: "towerdata/weststpaul.html" },
        { lat: 49.88773, lng: -97.48983, label: 'Headingley', infoContent: "towerdata/headingley.html" }
    ];

    markerData.forEach(data => {
        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.lat, data.lng),
            icon: 'images/tower.png',
            label: data.label,
            optimized: false,
            map: map
        });
    
        fetch(data.infoContent)
            .then(response => response.text())
            .then(content => {
                const infoWindow = new google.maps.InfoWindow({
                    maxWidth: 1000,
                    content: content
                });
    
                marker.addListener('click', function() {
                    if (currentInfoWindow) {
                        currentInfoWindow.close();
                    }
                    infoWindow.open(map, marker);
                    currentInfoWindow = infoWindow;
                });
            });
    
        markers.push(marker);
    });

    document.getElementById('searchButton').addEventListener('click', function() {
        clearLinesAndLabels();
        const searchInput = document.getElementById('searchInput').value;
        const placesService = new google.maps.places.PlacesService(map);

        placesService.textSearch({ query: searchInput }, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
                const location = results[0].geometry.location;
                const newLocation = { lat: location.lat(), lng: location.lng() };

                if (searchResult) {
                    searchResult.setMap(null);
                }

                searchResult = new google.maps.Marker({
                    position: newLocation,
                    map: map,
                    title: 'Search Result',
                    icon: 'images/location.png',
                    draggable: true
                });

                searchResult.addListener('dragend', function() {
                    clearLinesAndLabels();
                    const newSearchLocation = searchResult.getPosition();
                    const numTowers = parseInt(document.getElementById('numTowers').value);

                    const sortedMarkers = markers.slice().sort((a, b) => {
                        const distanceA = calculateDistance(newSearchLocation, a.getPosition());
                        const distanceB = calculateDistance(newSearchLocation, b.getPosition());
                        return distanceA - distanceB;
                    });

                    const closestMarkers = sortedMarkers.slice(0, numTowers);

                    if (searchResult) {
                        closestMarkers.forEach(function(marker) {
                            const distance = calculateDistance(newSearchLocation, marker.getPosition());
                            if (distance <= 16093.4) {
                                drawLinesAndLabels(searchResult, marker);
                            }
                        });
                    }
                });

                map.setCenter(newLocation);
                map.setZoom(12);

                const numTowers = parseInt(document.getElementById('numTowers').value);

                const sortedMarkers = markers.slice().sort((a, b) => {
                    const distanceA = calculateDistance(searchResult.getPosition(), a.getPosition());
                    const distanceB = calculateDistance(searchResult.getPosition(), b.getPosition());
                    return distanceA - distanceB;
                });

                const closestMarkers = sortedMarkers.slice(0, numTowers);

                closestMarkers.forEach(function(marker) {
                    const distance = calculateDistance(searchResult.getPosition(), marker.getPosition());
                    if (distance <= 16093.4) {
                        drawLinesAndLabels(searchResult, marker);
                    }
                });
            } else {
                alert('Could not find location. Please try a different search term.');
            }
        });
    });

    document.getElementById('location').addEventListener('click', function() {
        clearLinesAndLabels();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                getLocation(userLocation);
                map.setCenter(userLocation);
                map.setZoom(12);
            }, function(error) {
                if (error.code === 1) {
                    navigator.geolocation.getCurrentPosition(function(){}, function(){}, {enableHighAccuracy: true});
                }
            });
        } else {
            alert('You must enable location to use this');
        }
    });

    let userMarker;

    function getLocation(location) {
        const numTowers = parseInt(document.getElementById('numTowers').value);

        const sortedMarkers = markers.slice().sort((a, b) => {
            const distanceA = calculateDistance(location, a.getPosition());
            const distanceB = calculateDistance(location, b.getPosition());
            return distanceA - distanceB;
        });

        const closestMarkers = sortedMarkers.slice(0, numTowers);

        if (userMarker) {
            userMarker.setMap(null);
        }

        userMarker = new google.maps.Marker({
            position: location,
            map: map,
            icon: 'images/location.png',
            title: 'User Location',
            draggable: true
        });

        userMarker.addListener('dragend', function() {
            clearLinesAndLabels();
            getLocation(userMarker.getPosition());
        });

        if (userMarker) {
            closestMarkers.forEach(function(towerMarker) {
                const distance = calculateDistance(location, towerMarker.getPosition());
                if (distance <= 16093.4) {
                    drawLinesAndLabels(userMarker, towerMarker);
                }
            });
            map.setCenter(location);
            map.setZoom(12);
        }   
    }
}

initMap();

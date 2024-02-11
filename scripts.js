let activeMarker = null;
let currentInfoWindow = null;
const drawnItems = [];
const markers = { markers1: [], markers2: [] };
let map;

function addMarkersToMap(markerData, markersArray, icon) {
  markerData.forEach((data) => {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(data.lat, data.lng),
      icon: icon,
      label: data.label,
      optimized: false,
      map: map,
    });

    fetch(data.infoContent)
      .then((response) => response.text())
      .then((content) => {
        const infoWindow = new google.maps.InfoWindow({
          maxWidth: 1000,
          content,
        });
        marker.addListener("click", () => {
          if (currentInfoWindow) currentInfoWindow.close();
          infoWindow.open(map, marker);
          currentInfoWindow = infoWindow;
          // Hide all distance labels when a tower's info window is opened
          drawnItems.forEach((item) => item.label && item.label.close());
        });
      });

    markersArray.push({ marker, isVisible: true });
  });
}

function calculateDistance(point1, point2) {
  return google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
}

function drawLinesAndLabels(referenceMarker) {
  clearLinesAndLabels();

  const numTowers =
    parseInt(document.getElementById("numTowers").value, 10) || Infinity;
  const visibleMarkers = [...markers.markers1, ...markers.markers2].filter(
    (markerInfo) => markerInfo.isVisible
  );

  // Calculate distances to all visible markers.
  const distances = visibleMarkers.map((markerInfo) => ({
    markerInfo,
    distance: calculateDistance(
      referenceMarker.getPosition(),
      markerInfo.marker.getPosition()
    ),
  }));

  // Filter for towers within 10 miles, sort by distance, then take the top numTowers.
  const closestMarkers = distances
    .filter(({ distance }) => distance <= 16093.4) // 10 miles in meters.
    .sort((a, b) => a.distance - b.distance)
    .slice(0, numTowers);

  closestMarkers.forEach(({ markerInfo }) => {
    const { marker } = markerInfo;
    const distance = calculateDistance(
      referenceMarker.getPosition(),
      marker.getPosition()
    );
    const line = new google.maps.Polyline({
      path: [referenceMarker.getPosition(), marker.getPosition()],
      geodesic: true,
      strokeColor: "red",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    line.setMap(map);

    const middlePoint = google.maps.geometry.spherical.interpolate(
      referenceMarker.getPosition(),
      marker.getPosition(),
      0.5
    );
    const distanceLabel = new google.maps.InfoWindow({
      position: middlePoint,
      content: `<strong>${(distance * 0.000621371).toFixed(2)} miles</strong>`,
    });

    drawnItems.push({ line, label: distanceLabel });

    distanceLabel.open(map);
  });
}

function clearLinesAndLabels() {
  drawnItems.forEach(({ line, label }) => {
    if (line) line.setMap(null);
    if (label) label.close();
  });
  drawnItems.length = 0; // Clear the array for the next draw.
}

function updateMarkersVisibility(markersArray, checkboxId) {
  const isChecked = document.getElementById(checkboxId).checked;
  markersArray.forEach((markerInfo) => {
    markerInfo.isVisible = isChecked;
    markerInfo.marker.setVisible(isChecked);
  });
  if (activeMarker) drawLinesAndLabels(activeMarker); // Redraw lines only if there is an active marker
}

function addDragListener(marker) {
  google.maps.event.addListener(marker, "dragend", () =>
    drawLinesAndLabels(marker)
  );
}

function setupEventListeners() {
  document
    .getElementById("searchButton")
    .addEventListener("click", performSearch);
  document
    .getElementById("location")
    .addEventListener("click", getUserLocation);

  ["visptowers", "hsctowers"].forEach((checkboxId) => {
    document.getElementById(checkboxId).addEventListener("change", () => {
      updateMarkersVisibility(
        markers[checkboxId === "visptowers" ? "markers1" : "markers2"],
        checkboxId
      );
    });
  });

  document.getElementById("numTowers").addEventListener("change", () => {
    if (activeMarker) drawLinesAndLabels(activeMarker); // Update lines based on numTowers change
  });
}

function setupMapClickListener() {
  map.addListener("click", () => {
    if (currentInfoWindow) {
      currentInfoWindow.close();
      currentInfoWindow = null;
      drawnItems.forEach((item) => {
        if (item.label) {
          const distance = calculateDistance(
            activeMarker.getPosition(),
            item.line.getPath().getAt(1)
          );
          if (distance <= 16093.4) {
            item.label.open(map);
          }
        }
      });
    }
  });
}

function performSearch() {
  const searchInput = document.getElementById("searchInput").value;
  const placesService = new google.maps.places.PlacesService(map);
  placesService.textSearch({ query: searchInput }, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
      updateActiveMarker(results[0].geometry.location, "images/pin.png");
    } else {
      alert("Could not find location. Please try a different search term.");
    }
  });
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        updateActiveMarker(userLocation, "images/pin.png");
      },
      () => {
        alert("Geolocation failed. Please enable location services.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function updateActiveMarker(location, icon) {
  if (activeMarker) activeMarker.setMap(null); // Remove existing active marker
  activeMarker = new google.maps.Marker({
    position: location,
    map: map,
    icon: icon,
    draggable: true,
  });
  addDragListener(activeMarker);
  map.setCenter(location);
  drawLinesAndLabels(activeMarker); // Draw lines to closest towers
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 49.1925, lng: -98.0019 },
    zoom: 12,
    mapId: "422c64e430bb49e9",
  });

  const markerData1 = [
    {
      lat: 49.18815,
      lng: -98.09984,
      label: "Morden Elevator",
      infoContent: "towerdata/mordensouth.html",
    },
    {
      lat: 49.1939,
      lng: -98.15227,
      label: "Morden West",
      infoContent: "towerdata/mordenwest.html",
    },
    {
      lat: 49.19376,
      lng: -97.94633,
      label: "Winkler",
      infoContent: "towerdata/winkler.html",
    },
    {
      lat: 49.19105,
      lng: -98.02699,
      label: "GVE",
      infoContent: "towerdata/gve.html",
    },
    {
      lat: 49.09427,
      lng: -99.34,
      label: "Cartwright",
      infoContent: "towerdata/cartwright.html",
    },
    {
      lat: 49.20524,
      lng: -98.38161,
      label: "Darlingford",
      infoContent: "towerdata/darlingford.html",
    },
    {
      lat: 49.37477,
      lng: -98.23974,
      label: "Miami",
      infoContent: "towerdata/miami.html",
    },
    {
      lat: 49.13411,
      lng: -97.94426,
      label: "Schanzenfeld",
      infoContent: "towerdata/schanzenfeld.html",
    },
    {
      lat: 49.08128,
      lng: -97.93487,
      label: "Hochfeld",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 49.10988,
      lng: -97.89314,
      label: "Kroekers",
      infoContent: "towerdata/kroekers.html",
    },
    {
      lat: 49.18192,
      lng: -97.88234,
      label: "Reinfeld",
      infoContent: "towerdata/reinfeld.html",
    },
    {
      lat: 49.18997,
      lng: -97.7618,
      label: "Plum Coulee",
      infoContent: "towerdata/plumcoulee.html",
    },
    {
      lat: 49.01377,
      lng: -97.91324,
      label: "Fehrway",
      infoContent: "towerdata/fehrway.html",
    },
    {
      lat: 49.0436,
      lng: -97.86724,
      label: "Reinland",
      infoContent: "towerdata/reinland.html",
    },
    {
      lat: 49.03674,
      lng: -97.82192,
      label: "Schoenwiese",
      infoContent: "towerdata/schoenwiese.html",
    },
    {
      lat: 49.00875,
      lng: -97.56645,
      label: "Gretna",
      infoContent: "towerdata/gretna.html",
    },
    {
      lat: 49.11331,
      lng: -97.55475,
      label: "Altona North",
      infoContent: "towerdata/altonanorth.html",
    },
    {
      lat: 49.08738,
      lng: -97.55841,
      label: "Altona South",
      infoContent: "towerdata/altonasouth.html",
    },
    {
      lat: 49.19892,
      lng: -97.54673,
      label: "Rosenfeld",
      infoContent: "towerdata/rosenfeld.html",
    },
    {
      lat: 49.13209,
      lng: -97.39287,
      label: "St. Joseph",
      infoContent: "towerdata/stjoseph.html",
    },
    {
      lat: 49.04152,
      lng: -97.39768,
      label: "Halbstadt",
      infoContent: "towerdata/halbstadt.html",
    },
    {
      lat: 49.00111,
      lng: -97.21488,
      label: "Emerson",
      infoContent: "towerdata/emerson.html",
    },
    {
      lat: 49.14141,
      lng: -97.15462,
      label: "Dominion City",
      infoContent: "towerdata/dominioncity.html",
    },
    {
      lat: 49.25421,
      lng: -97.33635,
      label: "St. Jean",
      infoContent: "towerdata/stjean.html",
    },
    {
      lat: 49.36698,
      lng: -97.93917,
      label: "Roland",
      infoContent: "towerdata/roland.html",
    },
    {
      lat: 49.35809,
      lng: -97.58828,
      label: "Lowe Farm",
      infoContent: "towerdata/lowefarm.html",
    },
    {
      lat: 49.50488,
      lng: -98.21054,
      label: "Stephenfield",
      infoContent: "towerdata/stephenfield.html",
    },
    {
      lat: 49.51461,
      lng: -97.99363,
      label: "Carman",
      infoContent: "towerdata/carman.html",
    },
    {
      lat: 49.51673,
      lng: -97.71663,
      label: "Sperling",
      infoContent: "towerdata/sperling.html",
    },
    {
      lat: 49.45594,
      lng: -97.42118,
      label: "Rosenort",
      infoContent: "towerdata/rosenort.html",
    },
    {
      lat: 49.56938,
      lng: -97.18249,
      label: "Ste. Agathe",
      infoContent: "towerdata/stagathe.html",
    },
    {
      lat: 49.61375,
      lng: -97.31802,
      label: "Domain",
      infoContent: "towerdata/domain.html",
    },
    {
      lat: 49.67922,
      lng: -97.44825,
      label: "Sanford",
      infoContent: "towerdata/sanford.html",
    },
    {
      lat: 49.71344,
      lng: -97.59796,
      label: "Starbuck",
      infoContent: "towerdata/starbuck.html",
    },
    {
      lat: 49.74314,
      lng: -97.77912,
      label: "Fannystelle",
      infoContent: "towerdata/fannystelle.html",
    },
    {
      lat: 49.7114,
      lng: -97.25805,
      label: "La Salle",
      infoContent: "towerdata/lasalle.html",
    },
    {
      lat: 49.77994,
      lng: -97.33172,
      label: "Oak Bluff",
      infoContent: "towerdata/oakbluff.html",
    },
    {
      lat: 49.90476,
      lng: -97.77593,
      label: "Elie",
      infoContent: "towerdata/elie.html",
    },
    {
      lat: 50.06568,
      lng: -97.73751,
      label: "Marquette",
      infoContent: "towerdata/marquette.html",
    },
    {
      lat: 49.98988,
      lng: -97.10056,
      label: "West St. Paul",
      infoContent: "towerdata/weststpaul.html",
    },
    {
      lat: 49.88773,
      lng: -97.48983,
      label: "Headingley",
      infoContent: "towerdata/headingley.html",
    },
    {
      lat: 49.23807,
      lng: -98.52652,
      label: "Manitou",
      infoContent: "towerdata/manitou.html",
    },
    {
      lat: 49.20554,
      lng: -98.88959,
      label: "Pilot Mound",
      infoContent: "towerdata/pilotmound.html",
    },
  ];

  // HSC Tower Info
  const markerData2 = [
    {
      lat: 50.75752,
      lng: -97.01751,
      label: "Glen Bay Road",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.64075,
      lng: -97.22351,
      label: "Fraserwood",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.50556,
      lng: -97.00241,
      label: "Winnipeg Beach",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.3003,
      lng: -96.93923,
      label: "Petersfield",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.25554,
      lng: -96.95297,
      label: "Clandeboye",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 49.9627,
      lng: -96.98181,
      label: "Springhill",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.09151,
      lng: -97.22076,
      label: "Stoney Mountain",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.22173,
      lng: -97.28118,
      label: "Balmoral",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.3875,
      lng: -97.35397,
      label: "Teulon",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.50643,
      lng: -97.49404,
      label: "Inwood",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.21909,
      lng: -97.44323,
      label: "Argyle",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.13378,
      lng: -97.54898,
      label: "Warren",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 49.91409,
      lng: -97.54211,
      label: "St. Francois-Xavier",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.40589,
      lng: -97.93899,
      label: "St. Laurent",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.30074,
      lng: -97.88818,
      label: "Lake Francis",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.22085,
      lng: -97.78244,
      label: "Woodlands",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.06595,
      lng: -97.82501,
      label: "Little Creek",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 50.00067,
      lng: -97.99255,
      label: "Norquay Colony",
      infoContent: "towerdata/hochfeld.html",
    },
    {
      lat: 49.84329,
      lng: -97.93487,
      label: "Grand Colony",
      infoContent: "towerdata/hochfeld.html",
    },
  ];
  addMarkersToMap(markerData1, markers.markers1, "images/tower.png");
  addMarkersToMap(markerData2, markers.markers2, "images/tower2.png");

  setupEventListeners();
  setupMapClickListener();
}

initMap();

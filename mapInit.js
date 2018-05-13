//GLOBAL VARIABLES INSTANTIATION/INITIALIZATION
//Trigger Splash Screen
$(document).ready(splash);

var loader = $('#spinner');
var queryLayer;
var latitude;
var longitude;
navigator.geolocation.getCurrentPosition((position) => {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
});
var geojsonMarkerOptions = {
  radius: 2,
  fillColor: '#f45342',
  color: '#000000',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8
};
var myMap = L.map('mapid').setView([
39.713863,
-95.721921
], 4);
myMap.center = [
39.713863,
-95.721921
];

//MAP BEGIN
L.esri.basemapLayer('Imagery').addTo(myMap);
L.esri.basemapLayer('ImageryLabels').addTo(myMap);

//Hourly Precipitation
var precipLayer = L.esri.featureLayer({
  url:
    'https://gis.ncdc.noaa.gov/arcgis/rest/services/cdo/precip_hly/MapServer/0',
  pointToLayer(geojson, latLng) {
    return L.circleMarker(latLng, geojsonMarkerOptions);
  },
  onEachFeature(feature, layer) {
    layer.bindPopup(precipPopupHTML(feature));
  }
});

//Nexrad Current Precipitation
var randomFlagger = Math.random();
var nexrad = L.tileLayer.wms(
  'http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi',
  {
    layers: 'nexrad-n0r-900913',
    format: 'image/png',
    transparent: true,
    async: true,
    random: randomFlagger,
    attribution: 'IEM Nexrad - Current'
  }
);

//7-Day Forecast
var forecast = L.esri.featureLayer({
  url:
    'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/wpc_qpf/MapServer/11',
  style(feature) {
    const qpf = feature.properties.qpf;
    switch (qpf) {
      case 0.01:
        return {
          color: '#ff9baa',
          opacity: 0.3
        };
      case 0.1:
        return {
          color: '#ffff00',
          opacity: 0.3
        };
      case 0.25:
        return {
          color: '#ffd300',
          opacity: 0.3
        };
      case 0.5:
        return {
          color: '#c27300',
          opacity: 0.3
        };
      case 0.75:
        return {
          color: '#ff6a00',
          opacity: 0.3
        };
      case 1:
        return {
          color: '#ea2700',
          opacity: 0.3
        };
      case 1.25:
        return {
          color: '#c20000',
          opacity: 0.3
        };
      case 1.5:
        return {
          color: '#780000',
          opacity: 0.3
        };
      case 1.75:
        return {
          color: '#78007a',
          opacity: 0.3
        };
      case 2:
        return {
          color: '#7d00ee',
          opacity: 0.3
        };
      case 2.5:
        return {
          color: '#754bc5',
          opacity: 0.3
        };
      case 3:
        return {
          color: '#00edeb',
          opacity: 0.3
        };
      case 4:
        return {
          color: '#00a0ed',
          opacity: 0.3
        };
      case 5:
        return {
          color: '#0c397a',
          opacity: 0.3
        };
      case 7:
        return {
          color: '#057d00',
          opacity: 0.3
        };
      case 10:
        return {
          color: '#0aca00',
          opacity: 0.3
        };
      case 15:
        return {
          color: '#6dff00',
          opacity: 0.3
        };
      case 20:
        return {
          color: '#ff9baa',
          opacity: 0.3
        };
      default:
        return {
          color: '#ffffff',
          opacity: 0.3
        };
    }
  },
  onEachFeature(feature, layer) {
    layer.bindPopup(
      `Quantitative Precipitation Forecast: ${feature.properties.qpf} inches`
    );
  }
});

//Drought Layer
var droughtMap = L.tileLayer.wms(
  'http://ndmc-001.unl.edu:8080/cgi-bin/mapserv.exe?map=/ms4w/apps/usdm/service/usdm_current_wms.map',
  {
    layers: 'usdm_current',
    format: 'image/png',
    transparent: true,
    async: true,
    attribution: 'NDMC, USDA, NOAA'
  }
);

//EVENT FUNCTIONS
function queryPrecipitation() {
  loader.toggleClass('hide');
  let conditions;
  const state = document.getElementById('state').value;
  if (state !== 'Select State') {
    conditions = `STATE_NAME = '${state}'`;
  } else {
    queryLayer.clearLayers();
    loader.toggleClass('hide');

    return;
  }

  if (queryLayer !== undefined) {
    queryLayer.clearLayers();
  }

  //document.getElementById("toggleHrlyPrecip").checked = false;
  //toggleHrlyPrecip();
  const query = L.esri.query({
    url:
      'https://gis.ncdc.noaa.gov/arcgis/rest/services/cdo/nclimgrid/MapServer/3'
  });
  query.where(conditions);
  query.run((error, latLngBounds, response) => {
    //console.log(latLngBounds);
    queryLayer = L.geoJson(latLngBounds);
    //myMap.addLayer(latLngBounds);
    loader.toggleClass('hide');
    myMap.fitBounds(queryLayer.getBounds(), {
      animate: true,
      duration: 0.75,
      easeLinearity: 0.1
    });
    //console.log(latLngBounds);
  });
}

function nexradListener() {
  let nexRadFlg = false;
  const nexradLegendDiv = $('#radarLegend');
  $('#toggleNexrad').on('click', () => {
    if (nexRadFlg) {
      myMap.removeLayer(nexrad);
      nexradLegendDiv.html('');
      nexradLegendDiv.removeClass('wrapper');
      nexRadFlg = false;
    } else {
      nexrad.addTo(myMap).bringToFront();
      nexradLegendDiv.addClass('wrapper');
      nexradLegendDiv.html(
        "<span style='font-size:8px'>Radar Legend</span><br><img src='radarlegend.png' width='50' height='220'>"
      );
      nexRadFlg = true;
    }
  });
}

nexradListener();

function inputCoordinates() {
  let latLng = `[${prompt(
    'Input Coordinates in Decimal Degrees, Comma-Separated\n\nExample: 39.713863, -95.721921'
  )}]`;
  latLng = JSON.parse(latLng);
  //console.log(latLng.toString());
  if (latLng !== []) {
    myMap.flyTo(latLng, 10);
  }
}
function changeBasemap(id) {
  loader.toggleClass('hide');
  myMap.eachLayer((layer) => {
    if (layer instanceof L.esri.BasemapLayer) {
      myMap.removeLayer(layer);
    }
  });
  const mapType = document.getElementById(id).value;
  if (mapType !== 'Select Basemap') {
    if (
      mapType !== 'Streets' &&
      mapType !== 'Topographic' &&
      mapType !== 'USATopo' &&
      mapType !== 'NationalGeographic'
    ) {
      const labelLayer = `${mapType}Labels`;
      L.esri.
        basemapLayer(labelLayer).
        addTo(myMap).
        bringToBack();
    }
    L.esri.
      basemapLayer(mapType).
      addTo(myMap).
      bringToBack();
  }
  loader.toggleClass('hide');
}

// function toggleHrlyPrecip(){
// var value = document.getElementById("toggleHrlyPrecip").checked;
// if (value === true) {
// precipLayer.addTo(myMap);
// } else {
// myMap.removeLayer(precipLayer);
// }
// }

function droughtListener() {
  let droughtFlg = false;
  $('#toggleDrought').on('click', () => {
    if (droughtFlg) {
      myMap.removeLayer(droughtMap);
      document.getElementById('droughtLegend').innerHTML = '';
      document.getElementById('droughtLegend').removeAttribute('class');
      droughtFlg = false;
    } else {
      droughtMap.addTo(myMap);
      document.getElementById('droughtLegend').setAttribute('class', 'wrapper');
      createDroughtLegend();
      droughtFlg = true;
    }
  });
}

droughtListener();

function moveToCurrLoc() {
  loader.toggleClass('hide');
  try {
    if (latitude !== undefined && longitude !== undefined) {
      const currCoords = [
latitude,
longitude
];
      myMap.flyTo(currCoords, 14);
      L.popup().
        setLatLng([
currCoords[0] + 0.001,
currCoords[1]
]).
        setContent('You are here.<br>(Click blue circle to clear location.)').
        openOn(myMap);
      const currMarker = L.circleMarker(currCoords, {
        style: {
          color: '#779126',
          fillOpacity: 0.25
        },
        radius: 5
      }).addTo(myMap);
      activateCurrMarkerMonitoring(currMarker);
      loader.toggleClass('hide');

      return;
    }
    console.log('Geolocation still loading... Try again.');
  } catch (err) {
    window.alert(`Geolocation failed with the error: ${err}`);
  }
  loader.toggleClass('hide');
}

function activateCurrMarkerMonitoring(marker) {
  marker.on('click', () => {
    myMap.removeLayer(marker);
  });
}

function toggleForecast() {
  const value = document.getElementById('toggleForecast').checked;
  if (value) {
    forecast.addTo(myMap);
    document.getElementById('forecastLegend').setAttribute('class', 'wrapper');
    createForecastLegend();
  } else {
    myMap.removeLayer(forecast);
    document.getElementById('forecastLegend').innerHTML = '';
    document.getElementById('forecastLegend').removeAttribute('class');
  }
}

//HELPER FUNCTIONS
function precipPopupHTML(feature) {
  return `<span style='font: 15px Helvetica, sans-serif;'>Country: ${
    feature.properties.COUNTRY
  }</span><br><span style='font: 15px Helvetica, sans-serif;'>State: ${
    feature.properties.STATE
  }</span><br><span style='font: 15px Helvetica, sans-serif;'>Station Name: ${
    feature.properties.STATION_NAME
  }</span><br><span style='font: 15px Helvetica, sans-serif;'>Elevation: ${Math.round(
    feature.properties.ELEVATION
  )} m</span>`;
}

function openNav() {
  document.getElementById('mySidenav').style.width = '300px';
}

function closeNav() {
  document.getElementById('mySidenav').style.width = '0';
  $('#name').toggleClass('hide');
}

function getColor(qpf) {
  switch (qpf) {
    case 0.01:
      return '#ff9baa';
    case 0.1:
      return '#ffff00';
    case 0.25:
      return '#ffd300';
    case 0.5:
      return '#c27300';
    case 0.75:
      return '#ff6a00';
    case 1:
      return '#ea2700';
    case 1.25:
      return '#c20000';
    case 1.5:
      return '#780000';
    case 1.75:
      return '#78007a';
    case 2:
      return '#7d00ee';
    case 2.5:
      return '#754bc5';
    case 3:
      return '#00edeb';
    case 4:
      return '#00a0ed';
    case 5:
      return '#0c397a';
    case 7:
      return '#057d00';
    case 10:
      return '#0aca00';
    case 15:
      return '#6dff00';
    case 20:
      return '#ff9baa';
    default:
      return 'ffffff';
  }
}

function createForecastLegend() {
  const legend = document.getElementById('forecastLegend');
  let i;
  const grades = [
    0.01,
    0.1,
    0.25,
    0.5,
    0.75,
    1,
    2,
    2.5,
    3,
    4,
    5,
    7,
    10,
    15,
    20
  ];
  for (i in grades) {
    legend.innerHTML +=
      `<div class='colorBox' style='background-color: ${getColor(
        grades[i]
      )};'></div>` + `&nbsp;${grades[i]}"`;
    if (grades[i] !== 20) {
      legend.innerHTML += '<br>';
    }
  }
}

function createDroughtLegend() {
  const legend = document.getElementById('droughtLegend');
  let i;
  const colors = [
'#ffff00',
'#ffcc66',
'#df8600',
'#dc0000',
'#5c0000'
];
  const grades = [
    'Abnormally Dry',
    'Moderate Drought',
    'Severe Drought',
    'Extreme Drought',
    'Exceptional Drought'
  ];
  for (i in grades) {
    legend.innerHTML +=
      `<div class='colorBox' style='background-color: ${colors[i]};'></div>` +
      `&nbsp;${grades[i]}`;
    if (grades[i] !== 20) {
      legend.innerHTML += '<br>';
    }
  }
}

function setForecastOpacity() {
  forecast.setStyle({
    fillOpacity: document.getElementById('forecastOpacity').value / 100.0
  });
}

function setRadarOpacity() {
  nexrad.setOpacity(document.getElementById('radarOpacity').value / 100.0);
}

function setDroughtOpacity() {
  droughtMap.setOpacity(
    document.getElementById('droughtOpacity').value / 100.0
  );
}

function clearHTML(id) {
  const element = $(`#${id}`);
  element.toggleClass('hide');
}

function togglePopups() {
  $('.popup').toggleClass('hide');
}

function splash() {
  $('#splash').removeClass('hide');
}

$('#menu').on('click', () => {
  $('#name').toggleClass('hide');
});

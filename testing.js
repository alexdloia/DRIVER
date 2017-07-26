var myMap = L.map("mapid").setView([30.395060, -97.735197],1);
myMap.center = [30.395060, -97.735197];
L.esri.basemapLayer("Imagery").addTo(myMap);
L.esri.basemapLayer("ImageryLabels").addTo(myMap);
/*L.esri.featureLayer({
    url: 'https://gis.ncdc.noaa.gov/arcgis/rest/services/cdo/precip_hly/MapServer/0'})
.addTo(myMap);*/
var queryLayer;

function testQueryColor() {
    var conditions = prompt("Enter query conditions: ");

    try {
        if(queryLayer !== undefined) {
            queryLayer.clearLayers();
        }

        var geojsonMarkerOptions = {
            radius: 2,
            fillColor: "#f45342",
            color: "#000000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        var query = L.esri.query({
            url: "https://gis.ncdc.noaa.gov/arcgis/rest/services/cdo/precip_hly/MapServer/0"
        });
        query.where(conditions);
        query.run(function (error, latLngBounds, response) {
            //console.log(latLngBounds);
            queryLayer = L.geoJson(latLngBounds, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);


                },
                onEachFeature: function (feature, layer) {
                    console.log(feature.attributes);
                    layer.bindPopup("<span style='font: 15px Helvetica, sans-serif;'>Country: " + feature.attributes.COUNTRY + "</span><br><span style='font: 15px Helvetica, sans-serif;'>State: " + feature.attributes.STATE + "</span><br><span style='font: 15px Helvetica, sans-serif;'>Station Name: " + feature.attributes.STATION_NAME + "</span><br><span style='font: 15px Helvetica, sans-serif;'>Elevation: " + feature.attributes.ELEVATION + "</span>");
                }
            }).addTo(myMap)
            //map.addLayer(latLngBounds);
            //map.fitBounds(latLngBounds);
        });
    }
    catch(err){
        window.alert(err);
    }
}

function ask() {
    var latLng = "[" + prompt("Input Coordinates in Decimal Degrees, Comma-Separated") + "]";
    try {
        latLng = JSON.parse(latLng);
        console.log(latLng.toString());
        if (latLng !== []) {
            myMap.setView(latLng, 10);
        }
    }
    catch(err){
        window.alert("Invalid input!");
        myMap.setView(myMap.center, 1);
    }

}
function changeMap(id) {
    myMap.eachLayer(function(layer){
        if(layer instanceof L.esri.BasemapLayer) {
            myMap.removeLayer(layer);
        }
    });
    var mapType = document.getElementById(id).value;
    L.esri.basemapLayer(mapType).addTo(myMap);
    if(mapType !== "Streets" || mapType !== "Topographic" || mapType !== "USATopo" || mapType !== "NationalGeographic") {
        var labelLayer = mapType+"Labels";
        L.esri.basemapLayer(labelLayer).addTo(myMap);
    }
}




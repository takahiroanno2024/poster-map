function onLocationFound(e) {
  const radius = e.accuracy / 2;

  const locationMarker = L.marker(e.latlng).addTo(map)
    .bindPopup("現在地").openPopup();
  const locationCircle = L.circle(e.latlng, radius).addTo(map);

  map.setView(e.latlng, 14);
}

function onLocationError(e) {
  const latlong = [35.670687, 139.562997]
  const zoom = 12
  map.setView(latlong, zoom);
}

const baseLayers = {
  'OpenStreetMap': osm,
  'Google Map': googleMap,
  '国土地理院地図': japanBaseMap,
};

const overlays = {
  '期日前投票所':  L.layerGroup(),
};

var map = L.map('map', {
  layers: [
    overlays['期日前投票所']
  ],
  preferCanvas:true,
});
japanBaseMap.addTo(map);
const layerControl = L.control.layers(baseLayers, overlays).addTo(map);

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.locate({setView: false, maxZoom: 14});


let areaList;

Promise.all([getAreaList()]).then(function(res) {
  areaList = res[0];

  for (let [key, areaInfo] of Object.entries(areaList)) {
    // console.log(areaInfo['area_name']);
    fetch(`https://uedayou.net/loa/東京都${areaInfo['area_name']}.geojson`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch geojson for ${areaInfo['area_name']}`);
        }
        return response.json();
      })
      .then((data) => {
        const polygon = L.geoJSON(data, {
          color: 'black',
          fillColor: "black",
          fillOpacity: 0.1,
          weight: 2,
        }
        );
        polygon.addTo(map);
      })
      .catch((error) => {
        console.error('Error fetching geojson:', error);
      });
  }
}).catch((error) => {
  console.error('Error in fetching data:', error);
});

loadVoteVenuePins(overlays['期日前投票所']);
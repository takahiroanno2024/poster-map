async function getAreaList() {
  const arealistResponse = await fetch('/data/arealist.json');
  const arealist = await arealistResponse.json();
  return arealist;
}

async function getProgress() {
  const progressResponse = await fetch('/data/summary.json');
  const progress = await progressResponse.json();
  return progress;
}

async function getProgressCountdown() {
  const progressResponse = await fetch('/data/summary_absolute.json');
  const progress = await progressResponse.json();
  return progress;
}

async function getVoteVenuePins() {
  const response = await fetch('/data/vote_venue.json')
  return response.json();
}

async function getBoardPins(block=null, smallBlock=null) {
  let response
  if (block==null) {
    response = await fetch('/data/all.json')
  } else {
    response = await fetch(`/data/block/${block}.json`)
  }
  const data = await response.json();

  if (smallBlock==null) {
    return data
  } else {
    const smallBlockSplit = smallBlock.split('-')
    const areaName = smallBlockSplit[0]
    const smallBlockId = Number(smallBlockSplit[1])
    const areaList = await getAreaList();
    const areaId = Number(findKeyByAreaName(areaList, areaName))
    const filteredData = filterDataByAreaIdAndSmallBlock(data, areaId, smallBlockId);

    return filteredData
  }

}

async function loadVoteVenuePins(layer) {
  const pins = await getVoteVenuePins();
  pins.forEach(pin => {
    var marker = L.marker([pin.lat, pin.long], {
      icon: grayIcon
    }).addTo(layer);
    marker.bindPopup(`<b>期日前投票所: ${pin.name}</b><br>${pin.address}<br>期間: ${pin.period}<br>座標: <a href="https://www.google.com/maps/search/${pin.lat},+${pin.long}" target="_blank" rel="noopener noreferrer">(${pin.lat}, ${pin.long})</a>`);
  });
}


function progressBox(progressValue, position){
  var control = L.control({position: position});
  control.onAdd = function () {

      var div = L.DomUtil.create('div', 'info progress')

      div.innerHTML += '<p>完了率 (全域)</p>'
      div.innerHTML += `<p><span class="progressValue">${progressValue}</span>%</p>`

      return div;
  };

  return control
}

function progressBoxCountdown(progressValue, position){
  var control = L.control({position: position});
  control.onAdd = function () {

      var div = L.DomUtil.create('div', 'info progress')

      div.innerHTML += '<p>残り</p>'
      div.innerHTML += `<p><span class="progressValue">${progressValue}</span>ヶ所</p>`

      return div;
  };

  return control
}

// Base map
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})
const googleMap = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  maxZoom: 18,
  subdomains:['mt0','mt1','mt2','mt3'],
  attribution: '&copy; Google'
});
const japanBaseMap = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
})

const grayIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
  iconSize: [20, 32.8],
  popupAnchor: [1, -10],
  shadowSize: [32.8, 32.8],
  className: "icon-gray",
});


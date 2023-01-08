var CONFIGURATION = {
    "locations": [],
    "mapOptions": {"center":{"lat":38.0,"lng":-100.0},"fullscreenControl":true,"mapTypeControl":false,"streetViewControl":false,"zoom":4,"zoomControl":true,"maxZoom":17,"mapId":""},
    "mapsApiKey": "AIzaSyDEXl0-Is8YJhcL4I9P8fEvh_hMSLr_T5A",
    "capabilities": {"input":true,"autocomplete":false,"directions":false,"distanceMatrix":false,"details":false,"actions":false}
};

function initMap() {
    new LocatorPlus(CONFIGURATION);
}

const map_display = document.getElementById('map-display');
map_display.addEventListener('click', (event) => {
    if(map_display.innerHTML === "" || map_display.innerHTML === null) return;
    try{
        // console.log(map_display.innerHTML);
        let locations = JSON.parse(map_display.innerHTML);
        // console.log("CLICKED!\n");
        // console.log(locations);
        CONFIGURATION.locations = locations;
        initMap();
    }catch(error){
        // console.log(error);
    }
});
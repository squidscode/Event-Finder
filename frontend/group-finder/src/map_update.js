const map_display = document.getElementById('map-display');

function map_update(locationArray){
    let locations = [];

    for(let plan in locationArray){
        if(+locationArray[plan].route.points[0].lat.$numberDecimal === undefined || +locationArray[plan].route.points[0].lng.$numberDecimal === undefined){
            continue;
        }

        let location = {};
        location.title = locationArray[plan].title;
        location.coords = {};
        location.location_details = locationArray[plan].location_details;
        location.timeframe = locationArray[plan].time + ' ' + locationArray[plan].frequency;
        location.coords.lat = +locationArray[plan].route.points[0].lat.$numberDecimal;
        location.coords.lng = +locationArray[plan].route.points[0].lng.$numberDecimal;
        if(locationArray[plan].description !== undefined) location.description = locationArray[plan].description;
        if(locationArray[plan].owner !== undefined) location.user_info = '[' + locationArray[plan].owner + '] ';

        locations.push(location);
    }

    map_display.innerHTML = JSON.stringify(locations);
    map_display.click();
}

export {map_update};
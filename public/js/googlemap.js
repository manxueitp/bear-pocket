var map; // global map variable
var markers = []; // array to hold map markers

//----------------------------------------------------------google map show places-----------------------------------
var renderMap= function(spends,idname,zoom){
  var mapOptions = {
    center: new google.maps.LatLng(spends[0].location.geo[1],spends[0].location.geo[0]), // NYC
    zoom: zoom,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById(idname), mapOptions);
}

var renderPlaces = function(spends) {
  var infowindow =  new google.maps.InfoWindow({
      content: ''
  });
  clearMarkers();
  markers = [];
  
  for(var i=0;i<spends.length;i++){

    var latLng = {
      lat: spends[i].location.geo[1], 
      lng: spends[i].location.geo[0]
    }

    // make and place map maker.
    var marker = new google.maps.Marker({
        map: map,
        position: latLng,
        title : spends[i].price+ "<br>" + spends[i].shop + "<br>" + spends[i].location.name
    });

    bindInfoWindow(marker, map, infowindow, '<b> $'+spends[i].price + "</b> ("+spends[i].note+") <br>" + spends[i].location.name);

    markers.push(marker);
  }
}

var bindInfoWindow = function(marker, map, infowindow, html) {
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(html);
        infowindow.open(map, marker);
    });
}

function clearMarkers(){
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null); // clears the markers
  } 
}
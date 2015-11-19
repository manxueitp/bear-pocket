var desiredWidth;
var geocoder = new google.maps.Geocoder;
var hasLocation = false;

//----------------------------------------------------------default input -----------------------------------
var renderTime=function(){
  var now=new Date();
  var month=dateFormat(now,"mmmm");
  var date= dateFormat(now,"dd");
  var year=dateFormat(now,"yyyy");
  var time=dateFormat(now,"isoTime");
  var today=dateFormat(now,"isoDate");
  document.getElementById('input-month').value = month;
  document.getElementById('input-sdate').value = date;
  document.getElementById('input-spendtime').value = time;
  
  console.log(month);
  console.log(date);
  console.log(year);
  console.log(time);
}
//----------------------------------------------------------Input Location-------------------------------
var renderLocation=function(){
  if(navigator.geolocation){
     navigator.geolocation.watchPosition(successCallback, errorCallback, {});
     function successCallback(currentPosition) {
        if (hasLocation) return false;

        hasLocation = true;
        //alert("reading user's current location");
        
        var lat = currentPosition.coords.latitude,
        long = currentPosition.coords.longitude;

        var latlng={lat: lat, lng: long};
 
        var mapElem = document.getElementById('map');
        mapElem.innerHTML = '<img src="http://maps.googleapis.com/maps/api/staticmap?markers=' + lat + ',' + long + '&zoom=20&size=500x300&sensor=false" />';         
        
        //get name of location
        geocoder.geocode({'location': latlng}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
              //window.alert(results[1].formatted_address);
              document.getElementById('input-location').value = results[1].formatted_address;
             } else {
              window.alert('No results found');
            }
          } else {
            window.alert('Geocoder failed due to: ' + status);
          }
        });
        //geocode reverse end
      }
        function errorCallback(e) {
          alert(e);
        }

        

      } else {
        alert("Geolocation is not supported by this browser.");
      }
}

var defaultInput=function(){
  renderTime();
  renderLocation();
}
//---------------------------------------------------------take photos by phonegap-----------------------------------
// function takePicture() {

//   navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
//       destinationType: Camera.DestinationType.FILE_URI
//   });
// }

// function onSuccess(imageData) {
//     var image = document.getElementById('mypicture');
//     //image.src = "data:image/jpeg;base64," + imageData;
//     console.log(imageData);
//     image.src = imageData;

// }

// function onFail(message) {
//     alert('Failed because: ' + message);
// }

//---------------------------------------------------------take photos by browser-----------------------------------

    
    
    // desiredWidth = window.innerWidth;
        
    //     if(!("url" in window) && ("webkitURL" in window)) {
    //         window.URL = window.webkitURL;   
    //     }
    

  
  
    //Credit: https://www.youtube.com/watch?v=EPYnGFEcis4&feature=youtube_gdata_player
  function gotPic(event) {

    console.log("got Pic");
        if(event.target.files.length == 1 && 
           event.target.files[0].type.indexOf("image/") == 0) {
            $("#display-img").attr("src",URL.createObjectURL(event.target.files[0]));
            var imgURL=URL.revokeObjectURL(URL.createObjectURL(event.target.files[0]));
            console.log(imgURL);
        }
  }
   
  function changeBar(){
    var changeValue = this.value*10+'% Happy';
    $(this).next().text(changeValue);   
  }

//----------------------------------------------------------call function-------------------------

window.addEventListener('load', defaultInput());
$("#takePictureField").on("change",gotPic);
$("#input-mood").on("change",changeBar);
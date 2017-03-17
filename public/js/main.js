// CUSTOM JS FILE //
var map; // global map variable
var markers = []; // array to hold map markers
var icon;
var now=new Date();
var month=dateFormat(now,"mmmm");
var date= dateFormat(now,"dd");
var year=dateFormat(now,"yyyy");
var time=dateFormat(now,"isoTime");
var today=dateFormat(now,"isoDate");
var nowmonth = dateFormat(now,"mm");
//var priceTotalMonth=[];
var monthTotalPrice=0;
var monthTotalAmount=0;
//var happypointTotal=0;
var dateInMonth=['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'];

//so slow to grab current location from google map api, so it's better to use user's spend data to locate their location.
// function getCurrentMap(){
//   if(navigator.geolocation){
//     navigator.geolocation.watchPosition(successCallback, errorCallback, {});
//     function successCallback(currentPosition) {
//       var lat = currentPosition.coords.latitude;
//       var lng = currentPosition.coords.longitude;
//       console.log(lat);
//       console.log(lng);
//       var mapOptions = {
//         center: new google.maps.LatLng(lat,lng), 
//         zoom: 10,
//         mapTypeId: google.maps.MapTypeId.ROADMAP
//       };
//       map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
//     }
//     function errorCallback(e) {
//       alert(e);
//     }
//   } else {
//     alert("Geolocation is not supported by this browser.");
//   }
// }

function init() {
  //getCurrentMap();
  getData(today);
}
//______________________________________________________________________________________
//get today's data
var getData = function(date){
   jQuery.ajax({
    url : '/api/get/'+date,
    dataType : 'json',
    success : function(response) {
      var spends = response.spends;
      renderMap(spends);
      renderPlaces(spends);
    }
  })  
}
//----------------------------------------------------------google map show places-----------------------------------
var renderMap= function(spends){
  var mapOptions = {
    center: new google.maps.LatLng(spends[0].location.geo[1],spends[0].location.geo[0]), // NYC
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
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
    console.log(markers);
  }
  
  renderSpends(spends); 
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
//--------------------------------------------render spend----------------------------------------------
function renderSpends(spends){
    //console.log(spends);
      document.getElementById('cd-timeline').innerHTML="";
      for(var i=0;i<spends.length;i++){
          if(spends[i].category=="eating"){
            icon= "fa-cutlery";
          }else if (spends[i].category=="rental"){
            icon="fa-home";
          }else if (spends[i].category=="drink"){
            icon="fa-coffee";
          }
          else if (spends[i].category=="food"){
            icon="fa-beer"
          }
          else if (spends[i].category=="living"){
            icon="fa-bed";
          }
          else if (spends[i].category=="transport"){
           icon="fa-subway";
          }
          else if (spends[i].category=="entertainment"){
           icon="fa-gamepad";
          }
          else if (spends[i].category=="shopping"){
           icon="fa-shopping-cart";
          }
          else{
           icon= "fa-cullery";
          }
          var happypoint= spends[i].mood*10;
          
          //console.log("spends[i].month="+spends[i].month);
          //console.log("spends[i].category="+spends[i].category);
           
         
          var htmlToAdd= '<div class="cd-timeline-block wow fadeInUp animated">'+
                '<div class="cd-timeline-img'+ ' cd-'+spends[i].category+' cd-timeline-block wow fadeInLeft animated">'+
                  '<i class="fa '+icon+' icon"></i>'+
                '</div>'+

                '<div class="cd-timeline-content">'+
                  '<div class="row">'+
                  '<span class="cd-date">'+spends[i].month+'.'+spends[i].sdate+'<br/>'+spends[i].spendtime+'</span>'+
                    '<div class="col-sm-6 words">'+
                    '<h1 class="price-words">$'+spends[i].price+'</h1>'+
                    '<div><img class="imgbar" src=img/happy.png><div class="purple-bar"><div class="purple-bar-container" id="bar'+[i]+'" style="width: 0%;"></div></div><h1>'+happypoint+'% Happiness'+'</h1></div>'+
                    '<p>'+spends[i].note+'</p>'+
                    '<p>'+spends[i].location.name+'</p>'
                    +'</div>'+
                    
                    '<div class="col-sm-6 centered ">'+
                     '<img class="ifShow" src='+spends[i].url+' width="400">'+
                    '</div>'+
                    '<button class="btn-delete margin-top-5 deletebtn wow fadeInLeft animated" data-id="'+spends[i]._id+'" id="btn['+i+']"><a>Delete</a></button>'+
                  '</div>'+
                '</div>'+ 
              '</div> '+
            '</div>'+
            '</div>';

          jQuery("#cd-timeline").append(htmlToAdd);
           $('#bar' + [i]).css('width', happypoint + '%');
           if(spends[i].url=''){
            $('.ifShow').css({display:'none'});
           }
           $('.simpleClass').css({display:'none'});
      }
//---------------delete btn-------------------------------------------------------
      $('button').on('click', function(e){
         e.preventDefault();
        var id = $(this).data('id');
        $.get('/api/delete/' + id);
        $(this).parent().remove();
     })
     
}
//--------------------------------------------------------------------------------------------
google.maps.event.addDomListener(window, 'load', init);
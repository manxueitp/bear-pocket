// CUSTOM JS FILE //
var map; // global map variable
var markers = []; // array to hold map markers
var icon;

function init() {
  
  var mapOptions = {
    center: new google.maps.LatLng(40.74649,-74.0094), // NYC
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
  renderPlaces();
}
//----------------------------------------------------------default input -----------------------------------
var renderTime=function(){
  var now=new Date();
  var month=dateFormat(now,"mmmm");
  var date= dateFormat(now,"d");
  var year=dateFormat(now,"yyyy");
  var time=dateFormat(now,"shortTime");
  document.getElementById('input-month').value = month;
  document.getElementById('input-sdate').value = date;
  document.getElementById('input-spendtime').value = time;
  
  console.log(month);
  console.log(date);
  console.log(year);
  console.log(time);
}

var renderLocation=function(){
  if(navigator.geolocation){
     navigator.geolocation.watchPosition(successCallback, errorCallback, {});
     function successCallback(currentPosition) {
        alert("reading user's current location");
        
        var lat = currentPosition.coords.latitude,
        long = currentPosition.coords.longitude;
 
        var mapElem = document.getElementById('map');
        mapElem.innerHTML = '<img src="http://maps.googleapis.com/maps/api/staticmap?markers=' + lat + ',' + long + '&zoom=20&size=300x300&sensor=false" />';         
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
//---------------------------------------------------------take photos-----------------------------------
function takePicture() {

  navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
      destinationType: Camera.DestinationType.FILE_URI
  });
}

function onSuccess(imageData) {
    var image = document.getElementById('mypicture');
    //image.src = "data:image/jpeg;base64," + imageData;
    console.log(imageData);
    image.src = imageData;

}

function onFail(message) {
    alert('Failed because: ' + message);
}
//----------------------------------------------------------google map show places-----------------------------------
var renderPlaces = function() {
  var infowindow =  new google.maps.InfoWindow({
      content: ''
  });

  jQuery.ajax({
    url : '/api/get',
    dataType : 'json',
    success : function(response) {
      console.log(response);
      var spends = response.spends;
      // first clear any existing markers, because we will re-add below
      clearMarkers();
      markers = [];
      

      // now, loop through the animals and add them as markers to the map
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

        bindInfoWindow(marker, map, infowindow, '<b>'+spends[i].price + "</b> ("+spends[i].shop+") <br>" + spends[i].location.name);

        markers.push(marker);
      }
      
      renderSpends(spends);

      setChartDefaults();
      buildDoughnutChart(spends);

    }
  })
};
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

function renderSpends(spends){
  
  
      for(var i=0;i<spends.length;i++){

        console.log('hello');

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

          var htmlToAdd= '<div class="cd-timeline-block wow fadeInUp animated">'+
                '<div class="cd-timeline-img'+ ' cd-'+spends[i].category+' cd-timeline-block wow fadeInLeft animated">'+
                  '<i class="fa '+icon+' icon"></i>'+
                '</div>'+

                '<div class="cd-timeline-content">'+
                  '<div class="row">'+
                  '<span class="cd-date">'+spends[i].month+'.'+spends[i].sdate+'<br/>'+spends[i].spendtime+':00'+'</span>'+
                    '<div class="col-sm-6 words">'+
                    '<h1 class="price-words">$'+spends[i].price+'</h1>'+
                    '<h1>'+spends[i].stuffname+'</h1>'+
                    '<p>'+spends[i].shop+'</p>'+
                    '<p>'+spends[i].location.name+'</p>'
                    +'</div>'+
                    
                    '<div class="col-sm-6 centered ">'+
                     '<img src='+spends[i].url+' width="400">'+
                    '</div>'+
                    '<button class="btn-delete  .margin-top-5 deletebtn wow fadeInLeft animated" data-id="'+spends[i]._id+'" id="btn['+i+']"><a>Delete</a></button>'+
                  '</div>'+
                '</div>'+ 
              '</div> '+
            '</div>'+
            '</div>';

            jQuery("#cd-timeline").append(htmlToAdd);

            console.log(htmlToAdd);

      }
//----------------------------------------------------------------------
      for(var i=0;i<spends.length;i++){

        var htmlToAdd = '<div class="col-md-4">'+
          '<img src='+spends[i].url+' width="200">'+
          '<h1>'+spends[i].price+'</h1>'+
          '<h1>'+spends[i].stuffname+'</h1>'+
          '<h1>'+spends[i].shop+'</h1>'+
          '<h1>'+spends[i].note+'</h1>'+
          '<button class="btn-submit .margin-top-5 deletebtn wow fadeInLeft animated" data-id="'+spends[i]._id+'" id="btn['+i+']"><a>Delete</a></button>'
        '</div>';
      
        jQuery("#spends-holder").append(htmlToAdd);
      }

      $('button').on('click', function(e){
         e.preventDefault();
        var id = $(this).data('id');
        $.get('/api/delete/' + id);
        $(this).parent().remove();
     })
    
  //}
  //})  
}


//--------------chart----------------------------------

  function setChartDefaults(){
  // make it responsive
  Chart.defaults.global.responsive = true;
  // set the default line
  Chart.defaults.global.scaleLineColor = '#fff';
  // set the font family
  Chart.defaults.global.scaleFontFamily = "'Quattrocento Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
  // set the font color
  Chart.defaults.global.scaleFontColor = "#fff";
}


//--------------------------------------------
function buildDoughnutChart(spends){

  var eatingTotal=0
  var foodTotal=0;
  var drinkTotal = 0;
  var rentalTotal=0;
  var livingTotal=0;
  var transportTotal=0;
  var entertainmentTotal=0;
  var shoppingTotal = 0;
  
  for(var i=0;i<spends.length;i++){
    if(spends[i].category=='drink') {
      drinkTotal+=spends[i].price;
    }else if(spends[i].category=='food') {
      foodTotal+=spends[i].price;
    }
    else if(spends[i].category=='eatingTotal') {
      eatingTotal+=spends[i].price;
    }
    else if(spends[i].category=='rental'){
      rentalTotal+=spends[i].price;
    }
    else if(spends[i].category=='living') {
      livingTotal+=spends[i].price;
    }
    else if(spends[i].category=='transport'){
      transportTotal+=spends[i].price;
    }
    else if(spends[i].category=='entertainment') {
      entertainmentTotal+=spends[i].price;
    }
    else if(spends[i].category=='shopping') {
      shoppingTotal+=spends[i].price;
    }

  } 

  // let's call a function to render these counts on the page
  renderCounts(eatingTotal,drinkTotal);
  //foodTotal,rentalTotal, livingTotal, transportTotal, entertainmentTotal, shoppingTotal

  // data is an array of objects
  // each holds the value and color of a segment of the chart
  var data = [
      {
          value: eatingTotal,
          color:"#d86b94",
          label: "Eating"
      },
      {
          value: foodTotal, 
          color: "#f68680",
          label: "Food"
      },
      {
          value: drinkTotal, 
          color: "#f9a160",
          label: "Drink"
      },
      {
          value: rentalTotal, 
          color: "#efd232",
          label: "Rental"
      },
      {
          value: livingTotal, 
          color: "#f9a160",
          label: "Drink"
      }, 
      {
          value: transportTotal, 
          color: "#82a9f9",
          label: "Transport"
      },
      {
          value: entertainmentTotal, 
          color: "#82d4f9",
          label: "Entertainment"
      },
      {
          value: shoppingTotal, 
          color: "#82f9cb",
          label: "Shopping"
      } 

  ]

  // create chart options (this is optional)
  // see list of options:
  // http://www.chartjs.org/docs/#doughnut-pie-chart-chart-options
  var options = {
     segmentShowStroke : false,
     legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"    
  } 

  // first, get the context of the canvas where we're drawing the chart
  var ctx = document.getElementById("doughnutChart").getContext("2d");
  
  // now, create the donought chart, passing in:
  // 1. the data (required)
  // 2. chart options (optional)
  var myDoughnutChart = new Chart(ctx).Doughnut(data,options);  
  // create the legend
  var chartLegend = myDoughnutChart.generateLegend();
  // append it above the chart
  $('#doughnutChartLegend').append(chartLegend);
}

function renderCounts(eatingTotal,drinkTotal){
  document.getElementById('eatingCount').innerHTML = '$'+eatingTotal;
  document.getElementById('drinkCount').innerHTML = '$'+ drinkTotal;

}
//--------------------------------------------------------------------------------------------
$( "#btn-photo" ).click(takePicture());
//document.getElementById('btn-photo').addEventListener('click', renderFoods);
window.addEventListener('load', defaultInput());
google.maps.event.addDomListener(window, 'load', init);

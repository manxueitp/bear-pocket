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
var nowmonth = dateFormat(now,"m");
//var priceTotalMonth=[];
var monthTotalPrice=0;
var monthTotalAmount=0;
//var happypointTotal=0;
var dateInMonth=['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'];

function init() {
  
  var mapOptions = {
    center: new google.maps.LatLng(40.74649,-74.0094), // NYC
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  getData(today);

  $(".showbar").hide();
  $("#see-month").show();

  $('#see-month').click(function(){
  $(".showbar").slideToggle();
  $("#see-month").show();
  });
}

//get today's data
var getData = function(date){
   jQuery.ajax({
    url : '/api/get/'+date,
    dataType : 'json',
    success : function(response) {
//      console.log(response);
      var spends = response.spends;

      renderPlaces(spends);
    }
  })  
}

//--------------------------------------------------------------searchDate-----------------------------------------
var showMonth=function(month){
  var datenum=daysInMonth(month,year);
  //console.log(datenum);
  var searchmP=year+'-'+month;
  var counter = 0;
  var dateInMonth=['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'];
  var monthDate=[];
  
  var newdate=parseInt(date);

  var dataOfMonth=[];
  var newCounter = 0;

  getDateData(0);

    function getDateData(dateCounter){
      var priceTotal=0;
      //console.log(newCounter);

        $.getJSON('api/search?monthPurchased='+searchmP+'&sdate='+ dateInMonth[dateCounter], function(data) {
          //console.log('THE MONTH DATA FOR ' + searchmP + ' ' + dateInMonth[dateCounter] + ' is ' + data);
          var priceTotal=0;
          for(var j=0; j<data.length;j++){
              priceTotal+=data[j].price;
              
            }
          var newDay = {};
          newDay['purchasedValue']=priceTotal;
          newDay['purchasedAmount']=data.length;
          newDay['date'] = dateInMonth[dateCounter];
          dataOfMonth.push(newDay);

          monthTotalPrice+=Math.floor(priceTotal);
          monthTotalAmount+=data.length;
          var monthTotal={};
          monthTotal['purchasedValue']=monthTotalPrice;
          monthTotal['purchasedAmount']=monthTotalAmount;
          monthTotal['month'] = month;
          
         //console.log("Month Total Price-->"+ monthTotalPrice);
         //console.log("Month Total Amount -->"+ monthTotalAmount);
         
          counter++;
          newCounter++;
          if(newCounter<newdate) getDateData(newCounter);
          if(newCounter>=newdate){
//            console.log('month data is ' + dataOfMonth);
            renderDates(dataOfMonth);
          } 
          if(counter==(newdate-1)) {console.log();}
          });          
        } 
}


function renderDates(datesArray){
    //console.log(datesArray);
    document.getElementById('showDate').innerHTML="";
    for(var j=0; j<datesArray.length;j++){
      var price=Math.floor( datesArray[j].purchasedValue);
      // do something with it on the page
     

    var htmlToAdd=  '<div class="col-xs-4 col-sm-3 col-md-2 centered">'+
             '<div class="showdate" id="'+j+'">'+
               '<span id="showdate'+j+'" class="circle">'+'</span>'+
               '<h4>'+'$'+price+'</h4>'+
               '<h5>'+nowmonth+'-'+datesArray[j].date+'-15'+'</h5>'+
               '<p>'+datesArray[j].purchasedAmount+' things</p>'+
             '</div>'+
         '</div>' 
    
      jQuery("#showDate").append(htmlToAdd);
      if(price>100){
          $('#showdate' + j).css({'width': '60px', 'height': '60px'});
        }else if(price<=100){
          var radius = Math.floor(price/100*30 + 30);
//          console.log('radius'+radius);
          $('#showdate' + j).css({'width': radius+'px', 'height': radius+'px'});
        }
        
        //var queryDate = year + '-' + nowmonth + '-'+ dateInMonth[j];
        //console.log('queryDate'+queryDate);
    }

    $( '.showdate').click(function(){
            var id= $(this).attr('id');
            var num=parseInt(id);
            //console.log('num'+num);

            var queryDate = year + '-' + nowmonth + '-'+ dateInMonth[num];
             console.log('queryDate'+queryDate);
             //console.log('queryDate in function'+queryDate);
            getData(queryDate);
         });

}
function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}
//----------------------------------------------------------show month-----------------------------------


//----------------------------------------------------------google map show places-----------------------------------
var renderPlaces = function(spends) {
  var infowindow =  new google.maps.InfoWindow({
      content: ''
  });

  // first clear any existing markers, because we will re-add below
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

        bindInfoWindow(marker, map, infowindow, '<b>'+spends[i].price + "</b> ("+spends[i].shop+") <br>" + spends[i].location.name);

        markers.push(marker);
      }
      
      renderSpends(spends);
      setChartDefaults();
      buildDoughnutChart(spends);
  
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
                     '<img class="margin-bottom-10" src='+spends[i].url+' width="400">'+
                    '</div>'+
                    '<button class="btn-delete margin-top-5 deletebtn wow fadeInLeft animated" data-id="'+spends[i]._id+'" id="btn['+i+']"><a>Delete</a></button>'+
                  '</div>'+
                '</div>'+ 
              '</div> '+
            '</div>'+
            '</div>';

          jQuery("#cd-timeline").append(htmlToAdd);
           $('#bar' + [i]).css('width', happypoint + '%');
      }
//---------------delete btn-------------------------------------------------------
    

      $('button').on('click', function(e){
         e.preventDefault();
        var id = $(this).data('id');
        $.get('/api/delete/' + id);
        $(this).parent().remove();
     })
     
}

//----------------------------see other month----------------------------------------

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

  //document.getElementById('#doughnutChartLegend').innerHTML="";
  $('#doughnutChartLegend').empty();
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
    else if(spends[i].category=='eating') {
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

  // http://www.chartjs.org/docs/#doughnut-pie-chart-chart-options
  var options = {
     segmentShowStroke : false,
     legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"    
  } 

  // first, get the context of the canvas where we're drawing the chart
  var ctx = document.getElementById("doughnutChart").getContext("2d");
  
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
//$( "#btn-photo" ).click(takePicture());
//document.getElementById('btn-photo').addEventListener('click', renderFoods);

google.maps.event.addDomListener(window, 'load', init);
document.getElementById('see-month').addEventListener('click', showMonth(nowmonth));

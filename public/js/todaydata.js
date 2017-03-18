function init() {
  getData(today);

  // $(".showbar").hide();
  // $("#see-month").show();

  // $('#see-month').click(function(){
  //   $(".showbar").slideToggle();
  //   $("#see-month").show();
  // });
}

//get today's data
var getData = function(date){
   jQuery.ajax({
    url : '/api/get/'+date,
    dataType : 'json',
    success : function(response) {
      var spends = response.spends;
      renderMap(spends,"today-map");
      renderPlaces(spends);
    }
  })  
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

google.maps.event.addDomListener(window, 'load', init);
document.getElementById('see-month').addEventListener('click', showMonth(nowmonth));


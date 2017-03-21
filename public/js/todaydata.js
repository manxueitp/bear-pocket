function init() {
  getData(today);
}

//get today's data
var getData = function(date){
   jQuery.ajax({
    url : '/api/get/'+date,
    dataType : 'json',
    success : function(response) {
      var spends = response.spends;
      var totalPrice = getTotalPrice(spends);
      renderMap(spends,"today-map",12);
      renderPlaces(spends);
      buildDoughnutChart(spends,totalPrice);
    }
  })  
}

function buildDoughnutChart(spends,totalPrice){
  $('#doughnutChartLegend').empty();

  renderCounts(totalPrice);
  var data = [];

  var data = getDoughnutData(totalPrice);
  console.log(data);

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

function renderCounts(totalPrice){
  document.getElementById('eatingCount').innerHTML = '$'+ totalPrice.eatingTotal;
  document.getElementById('drinkCount').innerHTML = '$'+ totalPrice.drinkTotal;

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



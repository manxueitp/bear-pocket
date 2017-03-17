var showMonth=function(month){
  //month in this function is nowmonth(mm)
  var datenum=daysInMonth(month,year);
  //console.log(datenum);
  
  var searchmP=year+'-'+month;
//  console.log("searchmP"+searchmP);
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
      monthTotal['month'] = month;//mm
     
      counter++;
      newCounter++;
      if(newCounter<newdate) getDateData(newCounter);
      if(newCounter>=newdate){
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
      //console.log('radius'+radius);
      $('#showdate' + j).css({'width': radius+'px', 'height': radius+'px'});
    }
  }

  $( '.showdate').click(function(){
    var id= $(this).attr('id');
    var num=parseInt(id);
    //console.log('num'+num);

    var queryDate = year + '-' + nowmonth + '-'+ dateInMonth[num];
    getData(queryDate);
  });
}
function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}
//----------------------------------------------------------show month-----------------------------------
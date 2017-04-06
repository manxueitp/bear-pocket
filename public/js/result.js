function init() {
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
      renderMap(spends,"map-canvas",10);
      renderPlaces(spends);
      renderSpends(spends); 
    }
  })  
}
//--------------------------------------------render spend----------------------------------------------
function renderSpends(spends){
  document.getElementById('cd-timeline').innerHTML="";       
  for (var i=0;i<spends.length;i++) {
    var icon = renderIcon(spends[i]);
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
     if(spends[i].url==''){
      $('.ifShow').remove();
     }
     $('.simpleClass').css({display:'none'});         
  } 

  $('button').on('click', function(e){
     e.preventDefault();
    var id = $(this).data('id');
    $.get('/api/delete/' + id);
    $(this).parent().remove();
  })   
}
//--------------------------------------------------------------------------------------------
google.maps.event.addDomListener(window, 'load', init);
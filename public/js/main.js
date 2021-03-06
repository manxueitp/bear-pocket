var icons=[];
var now=new Date();
var month=dateFormat(now,"mmmm");
var date= dateFormat(now,"dd");
var year=dateFormat(now,"yyyy");
var time=dateFormat(now,"isoTime");
var today=dateFormat(now,"isoDate");//yyyy-mm-dd
var nowmonth = dateFormat(now,"mm");

//get icon (category) of current spend(spinds[i])
function renderIcon(spend){
  console.log(spend);
  if(spend){
    if(spend.category=="eating"){
      icon= "fa-cutlery";
    }else if (spend.category=="rental"){
      icon="fa-home";
    }else if (spend.category=="drink"){
      icon="fa-coffee";
    }
    else if (spend.category=="health"){
      icon="fa-medkit"
    }
    else if (spend.category=="living"){
      icon="fa-bed";
    }
    else if (spend.category=="transport"){
     icon="fa-subway";
    }
    else if (spend.category=="entertainment"){
     icon="fa-gamepad";
    }
    else if (spend.category=="shopping"){
     icon="fa-shopping-cart";
    }
    else{
     icon= "fa-cutlery";
    }  
    return icon;
  }else{
    return;
  }
}

//get total price of spends
function getTotalPrice(spends){
  var eatingTotal=0.0;
  var healthTotal=0.0;
  var drinkTotal = 0.0;
  var rentalTotal=0.0;
  var livingTotal=0.0;
  var transportTotal=0.0;
  var entertainmentTotal=0.0;
  var shoppingTotal = 0.0;
  var priceInAll = 0.0;
  var totalPrice = {};

  for(var i=0;i<spends.length;i++){
    if(spends[i].category=='drink') {
      drinkTotal+=spends[i].price;
      priceInAll+=spends[i].price;
      totalPrice.drinkTotal = drinkTotal;
    }
    else if(spends[i].category=='health') {
      healthTotal+=spends[i].price;
      priceInAll+=spends[i].price;
      totalPrice.healthTotal = healthTotal;
    }
    else if(spends[i].category=='eating') {
      eatingTotal+=spends[i].price;
      priceInAll+=spends[i].price;
      totalPrice.eatingTotal = eatingTotal;
    }
    else if(spends[i].category=='rental'){
      rentalTotal+=spends[i].price;
      priceInAll+=spends[i].price;
      totalPrice.rentalTotal = rentalTotal;
    }
    else if(spends[i].category=='living') {
      livingTotal+=spends[i].price;
      priceInAll+=spends[i].price;
      totalPrice.livingTotal = livingTotal;
    }
    else if(spends[i].category=='transport'){
      transportTotal+=spends[i].price;
      priceInAll+=spends[i].price;
      totalPrice.transportTotal = transportTotal;
    }
    else if(spends[i].category=='entertainment') {
      entertainmentTotal+=spends[i].price;
      priceInAll+=spends[i].price;
      totalPrice.entertainmentTotal = entertainmentTotal;
    }
    else if(spends[i].category=='shopping') {
      shoppingTotal+=spends[i].price;
      priceInAll+=spends[i].price;
      totalPrice.shoppingTotal = shoppingTotal;
    }
  } 
  totalPrice.priceInAll = priceInAll;
  return totalPrice; 
}

//get data need when drawing the Doughnut
function getDoughnutData(totalPrice){
  var drink_data = {}, health_data = {}, eating_data = {}, rental_data = {}, living_data = {}, transport_data = {}, entertainment_data={}, shopping_data={};
  var data = [];
  if(totalPrice.drinkTotal){
    drink_data.value = totalPrice.drinkTotal;
    drink_data.color = "#f9a160";
    drink_data.label = "Drink";
    data.push(drink_data);
  }
  if(totalPrice.eatingTotal){
    eating_data.value = totalPrice.eatingTotal;
    eating_data.color = "#d86b94";
    eating_data.label = "Meal";
    data.push(eating_data);
  }
  if(totalPrice.healthTotal){
    health_data.value = totalPrice.healthTotal;
    health_data.color = "#f68680";
    health_data.label = "Healthy Care";
    data.push(health_data);
  }
  if(totalPrice.rentalTotal){
    rental_data.value = totalPrice.rentalTotal;
    rental_data.color = "#efd232";
    rental_data.label = "Rental";
    data.push(rental_data);
  }
  if(totalPrice.livingTotal){
    living_data.value = totalPrice.livingTotal;
    living_data.color = "#8486e5";
    living_data.label = "living";
    data.push(living_data);
  }
  if(totalPrice.transportTotal){
    transport_data.value = totalPrice.transportTotal;
    transport_data.color = "#82a9f9";
    transport_data.label = "Transport";
    data.push(transport_data);
  }
  if(totalPrice.entertainmentTotal){
    entertainment_data.value = totalPrice.entertainmentTotal;
    entertainment_data.color = "#82d4f9";
    entertainment_data.label = "Entertainment";
    data.push(entertainment_data);
  }
  if(totalPrice.shoppingTotal){
    shopping_data.value = totalPrice.shoppingTotal;
    shopping_data.color = "#82f9cb";
    shopping_data.label = "Shopping";
    data.push(shopping_data);
  }
  return data;
}

function sortByPrice(data, keyname){
  var items = data;
  items.sort(function(a, b) {
    return parseFloat(a[keyname]) - parseFloat(b[keyname]);
  }).reverse();
  return items;
}
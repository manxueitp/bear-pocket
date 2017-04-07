var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var geocoder = require('geocoder'); // geocoder library
var moment = require('moment');
var fs=require('fs');
//var multer  = require('multer'); 

moment().format();

// our db model
var Spend = require("../models/spend.js");

// S3 File dependencies
var AWS = require('aws-sdk');
var awsBucketName = process.env.AWS_BUCKET_NAME;
var s3Path = process.env.AWS_S3_PATH; 
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
var s3 = new AWS.S3();

// file processing dependencies
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

//-------------------------------------------------------------------------------
router.get('/', function(req, res) {
  res.render('result.html')
});

// simple route to show an HTML page
router.get('/add-spend', function(req,res){
  res.render('input.html')
})

router.get('/view-today', function(req,res){
  res.render('today.html')
})

router.get('/submit-spend', function(req,res){
  res.render('result.html')
})

router.get('/search-month', function(req,res){
  res.render('month.html')
})

router.get('/add-with-image', function(req,res){
  res.render('input.html')

})



// /**----api/create/image-------------------------------------------------------------------------//

router.post('/api/create/image', multipartMiddleware, function(req,res) {
//    console.log('the incoming files >> ' + JSON.stringify(req.files)); 
//   console.log('the incoming data >> ' + JSON.stringify(req.body));
    console.log('the incoming image file >> ' + JSON.stringify(req.files.image.size));
    // pull out the information from the req.body
    var price = req.body.price;
    var stuffname = req.body.stuffname;
    var category = req.body.category;
    var month = req.body.month;
    var sdate = req.body.sdate; 
    var spendtime = req.body.spendtime;
    var shop = req.body.shop;
    var location = req.body.location;
    var note = req.body.note;
    var url = req.body.url;
    var mood = req.body.mood;
    
    var currentYear = new Date().getFullYear();
 
    var monthNumber = convertMonthNameToNumber(month);
    if(monthNumber<10){
      monthNumber='0'+monthNumber;
    }
    //var timePurchased = currentYear + '-' + monthNumber + '-'+ sdate + 'T' + spendtime + '.000Z';
    var timePurchased = currentYear + '-' + monthNumber + '-'+ sdate + 'T' + spendtime + '.000Z';
    var datePurchased = currentYear + '-' + monthNumber + '-'+ sdate;
    var monthPurchased = currentYear + '-' + monthNumber;

    var size = req.files.image.size;
    var filename = req.files.image.name; // actual filename of file
    var path = req.files.image.path; // will be put into a temp directory
    var mimeType = req.files.image.type; // image/jpeg or actual mime type
    
    if(!category) category = "eating";

    var spendObj = {
      price: price,
      stuffname: stuffname,
      category:category,
      month:month,
      sdate:sdate,
      spendtime:spendtime,
      shop:shop,
      //location:location,
      note:note,
      //url:url,
      mood:mood,
      timePurchased: timePurchased,
      datePurchased: datePurchased,
      monthPurchased: monthPurchased
    };
    
    console.log('timePurchased >> ' + timePurchased);
    // location thing
    if(!location) return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})

    geocoder.geocode(location, function (err,data){
      if (!data || data==null || err || data.status == 'ZERO_RESULTS'){
        var error = {status:'ERROR', message: 'Error finding location'};
        return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})
        //change to a pop up alert
      }

      var lon = data.results[0].geometry.location.lng;
      var lat = data.results[0].geometry.location.lat;
  
      spendObj.location = {
        geo: [lon,lat], 
        name: data.results[0].formatted_address 
      }

      getImageUrl();
    })//location end (file)
  
  function getImageUrl(){
    if(size > 0){
      saveImageToS3();
    }else{
      var url=''; 
      saveNewSpend(url);  
    }
  }

  function saveNewSpend(url){
    spendObj['url'] = url; 
    console.log("url in saveNewSpend "+ spendObj['url']);     
    var spend = new Spend(spendObj);
    console.log("spend in saveNewSpend "+spend);
    spend.save(function(err,data){
      if(err){
        var error = {
          status: "ERROR",
          message: err
        }
        return res.json(err)
      }
      var jsonData = {
        status: "OK",
        spend: data
      }
      //res.json(jsonData);  
      return res.redirect('/submit-spend'); 
    });//save end
  }

  function saveImageToS3(){
    var cleanedFileName = cleanFileName(filename);
    fs.readFile(path, function(err, file_buffer){
      var s3bucket = new AWS.S3({params: {Bucket: awsBucketName}});
      var params = {
        Key: cleanedFileName,
        Body: file_buffer,
        ACL: 'public-read',
        ContentType: mimeType
      };
      s3bucket.putObject(params, function(err, data) {
        if (err) {
          console.log(err)
          return;
        } else {
          console.log("Successfully uploaded image to s3 bucket");
          //add the s3 url our spend object from above
          var s3Url = s3Path + cleanedFileName;
          console.log("s3Url in saves3Image function" + s3Url);
          saveNewSpend(s3Url);
        }
      }); // end of putObject function
    });// end of read file
  }
})//end route

function saveNewSpend(spendObj,url){
  spendObj['url'] = url; 
  console.log("url in saveNewSpend "+ spendObj['url']);     
  var spend = new Spend(spendObj);
}

function saveImageToS3(path,cleanedFileName,mimeType,spendObj){
  fs.readFile(path, function(err, file_buffer){
    var s3bucket = new AWS.S3({params: {Bucket: awsBucketName}});
    var params = {
      Key: cleanedFileName,
      Body: file_buffer,
      ACL: 'public-read',
      ContentType: mimeType
    };
    s3bucket.putObject(params, function(err, data) {
      if (err) {
        console.log(err)
        return;
      } else {
        console.log("Successfully uploaded image to s3 bucket");
        //add the s3 url our spend object from above
        var s3Url = s3Path + cleanedFileName;
        console.log("s3Url in saves3Image function" + s3Url);
        spendObj['url'] = url; 
        console.log("url in saveNewSpend "+ spendObj['url']);     
        var spend = new Spend(spendObj);
      }
    }); // end of putObject function
  });// end of read file
}

function cleanFileName (filename) {
  var fileParts = filename.split(".");
  var fileExtension = fileParts[fileParts.length-1]; //get last part of file
  d = new Date();
  timeStr = d.getTime();
  
  //name without extension
  newFileName = fileParts[0];
  return newFilename = timeStr + "_" + fileParts[0].toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_') + "." + fileExtension;   
}
//------------------------------------------------------------------------------------------//

function convertMonthNameToNumber(monthName) {
  var myDate = new Date(monthName + " 1, 2000");
  var monthDigit = myDate.getMonth();
  return isNaN(monthDigit) ? 0 : (monthDigit + 1);
}
//------------------------------------------------------------------------------------------//
router.get('/api/get', function(req, res){
  
  Spend.find(function(err, data){
    // if err or no animals found, respond with error 
    if(err || data == null){
      var error = {
        status:'ERROR',
        message: 'Could not find spend'
      }
      return res.json(error);
    }

    var jsonData = {
      status: 'OK',
      spends: data
    } 

    return res.json(jsonData);

  })

})
//------------------------------------------------------------------------------------------//
router.get('/api/get/:datePurchased', function(req, res){

  //var date = req.query.date;
  var requestedDate = req.params.datePurchased;
//  console.log(requestedDate);
  
  //Spend.find().sort('-timePurchased').exec(function(err, data){
    // if err or no animals found, respond with error 
  Spend
    .find({datePurchased:requestedDate})
    .sort('-timePurchased')
    .exec(function(err,data){
    // if err or no animals found, respond with error 
    if(err || data == null){
      var error = {
        status:'ERROR',
        message: 'Could not find spend'
      }
      return res.json(error);
    }

    var jsonData = {
      status: 'OK',
      spends: data
    } 
    
    
    return res.json(jsonData);
    

  })
})

// _______________________________________________________________________________________/**

router.get('/api/get/:id', function(req, res){

  var requestedId = req.param('id');

  // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model.findById
  Spend.findById(requestedId, function(err,data){

    // if err or no user found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that spend'};
       return res.json(error);
    }

    // otherwise respond with JSON data of the animal
    var jsonData = {
      status: 'OK',
      spend: data
    }

    return res.json(jsonData);
  
  })
})


//----------------------------------------------------------------------------------------------------//
router.post('/api/update/:id', function(req, res){

   var requestedId = req.param('id');

   var dataToUpdate = {}; // a blank object of data to update

    // pull out the information from the req.body and add it to the object to update
    var price, stuffname, category, month, sdate, spendtime, shop, location, tag, note, url, mood;

    // we only want to update any field if it actually is contained within the req.body
    // otherwise, leave it alone.
    if(req.body.price) {
      price = req.body.price;
      // add to object that holds updated data
      dataToUpdate['price'] = price;
    }
    if(req.body.stuffname) {
      stuffname = req.body.stuffname;
      // add to object that holds updated data
      dataToUpdate['stuffname'] = stuffname;
    }
    if(req.body.category) {
      category = req.body.category;
      // add to object that holds updated data
      dataToUpdate['category'] = category;
      
    }
    if(req.body.month) {
      month = req.body.month;
      // add to object that holds updated data
      dataToUpdate['month'] = month;
    }
    if(req.body.sdate) {
      sdate = req.body.sdate;
      // add to object that holds updated data
      dataToUpdate['sdate'] = sdate;
    }
    if(req.body.spendtime) {
      spendtime = req.body.spendtime;
      // add to object that holds updated data
      dataToUpdate['spendtime'] = spendtime;
    }
    if(req.body.shop) {
      shop = req.body.shop;
      // add to object that holds updated data
      dataToUpdate['shop'] = shop;
    }
    if(req.body.note) {
      note = req.body.note;
      // add to object that holds updated data
      dataToUpdate['note'] = note;
    }
    if(req.body.url) {
      url = req.body.url;
      // add to object that holds updated data
      dataToUpdate['url'] = url;
    }
    if(req.body.mood) {
      mood = req.body.mood;
      // add to object that holds updated data
      dataToUpdate['url'] = mood;
    }
    //update location
     if(req.body.location) {
      location = req.body.location;
    }

    // if there is no location, return an error
    if(!location) return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})

    geocoder.geocode(location, function (err,data) {

      if (!data || data==null || err || data.status == 'ZERO_RESULTS'){
        var error = {status:'ERROR', message: 'Error finding location'};
        return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})
      }

      var lon = data.results[0].geometry.location.lng;
      var lat = data.results[0].geometry.location.lat;

      dataToUpdate['location'] = {
        geo: [lon,lat], // need to put the geo co-ordinates in a lng-lat array for saving
        name: data.results[0].formatted_address // the location name
      }

    //location end

    console.log('the data to update is ' + JSON.stringify(dataToUpdate));

    // now, update that animal
    // mongoose method findByIdAndUpdate, see http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate  
    Spend.findByIdAndUpdate(requestedId, dataToUpdate, function(err,data){
      // if err saving, respond back with error
      if (err){
        var error = {status:'ERROR', message: 'Error updating spend'};
        return res.json(error);
      }

      console.log('updated the spend!');
      console.log(data);

      // now return the json data of the new spend
      var jsonData = {
        status: 'OK',
        spend: data
      }

      return res.json(jsonData);

    })
   });  
})

//------------------------------------------------------------------------------//
router.get('/api/delete/:id', function(req, res){

  var requestedId = req.param('id');

  // Mongoose method to remove, http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
  Spend.findByIdAndRemove(requestedId,function(err, data){
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that spend to delete'};
      return res.json(error);
    }

    var jsonData = {
      status: 'OK',
      message: 'Successfully deleted id ' + requestedId
    }

    res.json(jsonData);

  })

})

// /api/search?datePurchased=2015-11-18
//-----------------query-------------------------------------------------------------//
router.get('/api/search',function(req,res){

//  console.log('the query is ' + req.query.datePurchased);

  var searchQuery = {};

  if(req.query.datePurchased){
    searchQuery['datePurchased'] =  req.query.datePurchased
  }

  if(req.query.timePurchased){
    searchQuery['timePurchased'] =  req.query.timePurchased
  }

  if(req.query.monthPurchased){
    searchQuery['monthPurchased'] =  req.query.monthPurchased
  }
  
  if(req.query.sdate){
    searchQuery['sdate'] =  req.query.sdate
  }

  if(req.query.category){
    searchQuery['category'] =  req.query.category
  }  

  // Spend.find(searchQuery,function(err,data){
  //   res.json(data);
  // })

  Spend.find(searchQuery,function(err,data){
    res.json(data);
  })

})

//------------------------------------------------------------------------------//

module.exports = router;
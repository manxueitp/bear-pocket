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
var s3Path = process.env.AWS_S3_PATH; // TODO - we shouldn't hard code the path, but get a temp URL dynamically using aws-sdk's getObject
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
  
  // var jsonData = {
  // 	'name': 'canlory-data',
  // 	'api-status':'OK'
  // }
// // respond with json data
  // res.json(jsonData)

  res.render('index.html')
});

// simple route to show an HTML page
router.get('/add-spend', function(req,res){
  res.render('index.html')
})

router.get('/submit-spend', function(req,res){
  res.render('result.html')
})

router.get('/add-with-image', function(req,res){
  res.render('input.html')

})


// /**-----------------------------------------------------------------------------//

router.post('/api/create', function(req, res){

    
    //return res.redirect('/add-meal');
    console.log('the data we received is --> ')
    console.log(req.body);
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
    var datePurchased = currentYear + '-' + monthNumber + '-'+ sdate;
    //var yMD=dateFormat(datePurchased,"yyyy-mm-dd");
    //console.log("datePurchased"+currentYear+"cY"+monthNumber+"mN"+sdate+"sD");
    
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
      url:url,
      mood:mood,
      datePurchased: datePurchased
    };
    
    // location thing
    if(!location) return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})

    geocoder.geocode(location, function (err,data) {

      if (!data || data==null || err || data.status == 'ZERO_RESULTS'){
        var error = {status:'ERROR', message: 'Error finding location'};
        return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})
      }

      var lon = data.results[0].geometry.location.lng;
      var lat = data.results[0].geometry.location.lat;
  
      spendObj.location = {
        geo: [lon,lat], 
        name: data.results[0].formatted_address 
      }
     // location end

    var  spend = new Spend(spendObj);
   
    spend.save(function(err,data){
      // if err saving, respond back with error
      if (err){
        var error = {
          status:'ERROR', 
          message: 'Error saving spend'
        }
        return res.json(error);
      }

      console.log('saved a new spend!');
      console.log(data);
      
      var jsonData = {
        status: 'OK',
        spend: data
      }

      //return res.json(jsonData);
      //return res.render('result.html');
      return res.redirect('/submit-spend')

    }) 

    }); 
});
// /**----api/create/image-------------------------------------------------------------------------//

router.post('/api/create/image', multipartMiddleware, function(req,res){

    
    
    console.log('the incoming data >> ' + JSON.stringify(req.body));
    console.log('the incoming image file >> ' + JSON.stringify(req.files.image));
    // pull out the information from the req.body
    
    var currentYear = new Date().getFullYear();
    var monthNumber = convertMonthNameToNumber(month);
    var datePurchased = currentYear + '-' + monthNumber + '-'+ sdate;
    //var yMD=dateFormat(datePurchased,"yyyy-mm-dd");
    //console.log("datePurchased"+currentYear+"cY"+monthNumber+"mN"+sdate+"sD");
    
    var spendObj = {
      price: req.body.price,
      stuffname: req.body.stuffname,
      category:req.body.category,
      month:req.body.month,
      sdate:req.body.sdate,
      spendtime:req.body.spendtime,
      shop:req.body.shop,
      //location:location,
      note:req.body.note,
      mood: req.body.mood,
      datePurchased: datePurchased
    };
    
    // location thing
    if(!location) return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})

    geocoder.geocode(location, function (err,data) {

      if (!data || data==null || err || data.status == 'ZERO_RESULTS'){
        var error = {status:'ERROR', message: 'Error finding location'};
        return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})
      }

      var lon = data.results[0].geometry.location.lng;
      var lat = data.results[0].geometry.location.lat;
  
      spendObj.location = {
        geo: [lon,lat], 
        name: data.results[0].formatted_address 
      }
     // -----location 
     
     //image thing (file)
      var filename = req.files.image.name; // actual filename of file
      var path = req.files.image.path; // will be put into a temp directory
      var mimeType = req.files.image.type; // image/jpeg or actual mime type

      var cleanedFileName = cleanFileName(filename);
      fs.readFile(path, function(err, file_buffer){

      // reference to the Amazon S3 Bucket
      var s3bucket = new AWS.S3({params: {Bucket: awsBucketName}});
      
      // Set the bucket object properties
      // Key == filename
      // Body == contents of file
      // ACL == Should it be public? Private?
      // ContentType == MimeType of file ie. image/jpeg.
      var params = {
        Key: cleanedFileName,
        Body: file_buffer,
        ACL: 'public-read',
        ContentType: mimeType
      };

        // Put the above Object in the Bucket
      s3bucket.putObject(params, function(err, data) {
        if (err) {
          console.log(err)
          return;
        } else {
          console.log("Successfully uploaded data to s3 bucket");

          // now that we have the image
          // we can add the s3 url our spend object from above
          spendObj['url'] = s3Path + cleanedFileName;
          console.log(spendObj['url']);
         
          var spend = new Spend(spendObj);

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

            return res.json(jsonData);        
          })

        }

      }); // end of putObject function
     });// end of read file

    })//location end (file)
  })

function cleanFileName (filename) {
    
    // cleans and generates new filename for example userID=abc123 and filename="My Pet Dog.jpg"
    // will return "abc123_my_pet_dog.jpg"
    var fileParts = filename.split(".");
    
    //get the file extension
    var fileExtension = fileParts[fileParts.length-1]; //get last part of file
    
    //add time string to make filename a little more random
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
  console.log(requestedDate);
  //Spend.find().sort('datePurchased').exec(function(err, data){
    // if err or no animals found, respond with error 
  Spend.find({datePurchased:requestedDate},function(err,data){
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

module.exports = router;
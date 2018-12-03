
const CLAUDINARY_URL = 'https://api.cloudinary.com/v1_1/fr7/upload';

const CLAUDINARY_UPLOAD_PRESET = "xewk1otu"
$(document).ready(function () {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  $.get("/api/user_data").then(function (data) {
    $(".member-name").text(data.email);
  });
  

var fileUpload = document.getElementById('file-upload');

if(fileUpload != null){
  attachListener(fileUpload);

}

$("#add-pic-btn").on("click", function(event) {
  event.preventDefault();

  // Grabs user input
  var url = $("#receipt").val().trim();
  var date = moment($("#purchase").val().trim()).format("YYYY-MM-DD HH:mm:ss");
  var namepic = $("#name").val().trim();
  var price = $("#price").val().trim()
  var warrantyl =  moment($("#lengtWarranty").val().trim()).format("YYYY-MM-DD HH:mm:ss");
  var storename = $("#store").val().trim();


  // Creates local "temporary" object for holding employee data
  var products = {
    dateOfpurchase: date,
    Product: namepic,
    price: price,
    Warranty: warrantyl,
    store: storename,
    info: url
  };
console.log(products);
});
});

const picker = datepicker('#purchase');
const picker2 = datepicker("#lengtWarranty");

console.log(picker)

function attachListener(fileUpload) {
  var imgPreview = document.getElementById('img-preview');


  fileUpload.addEventListener('change', function (event) {
    var file = event.target.files[0];
    var formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLAUDINARY_UPLOAD_PRESET);
    //console.log(file);
    axios({
        url: CLAUDINARY_URL,
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: formData
    }).then(function(res){
        imgPreview.src = res.data.secure_url;
        //append(imgPreview.src);

        console.log(imgPreview.src);

        $("#receipt").val(imgPreview.src);
        console.log(imgPreview.src);


    }).catch(function(err){
        console.log(err);

    });
  });
}







//var cloudinary = require("cloudinary-core"); // If your code is for ES5
//import cloudinary from “cloudinary-core”;    // If your code is for ES6 or higher

//var cl = new cloudinary.Cloudinary({cloud_name: "demo", secure: true});



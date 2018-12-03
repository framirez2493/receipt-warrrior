let picker, picker2
const CLAUDINARY_URL = 'https://api.cloudinary.com/v1_1/fr7/upload';
const CLAUDINARY_UPLOAD_PRESET = "xewk1otu"

$(document).ready(function () {
    // This file just does a GET request to figure out which user is logged in
    // and updates the HTML on the page
    $.get("/api/user_data").then(function (data) {
        $(".member-name").text(data.email);
    });

    // clear URL entries on reload amd clear modal
    
    clearModal()


    // receipt Upload event listener, preview, gets URL from cloudinary
    var receiptUpload = document.getElementById('receipt-upload');
    if (receiptUpload != null) {
        attachListener1(receiptUpload, 'receipt-preview', "#getreceipturl");
    }

    // warranty Upload event listener preview, gest URL from cloudinary
    var warrantyUpload = document.getElementById('warranty-upload');
    if (warrantyUpload != null) {
        attachListener1(warrantyUpload, 'warranty-preview',"#getwarrantyurl");
    }

    // create calendar input with the popout calendar
    const picker = datepicker('#getpurchasedate');
    const picker2 = datepicker("#getproductwarranty");


    // event handler when picture is the upload button is pressed
    $("#addRecord").on("click", function (event) {
        event.preventDefault();

        //disable button while processing request
        $("#addRecord").prop("disabled", true)

        // Grabs user input
        let receipturl = $("#getreceipturl").val().trim();
        let warrantyurl = $("#getwarrantyurl").val().trim();
        let productname = $("#getproductname").val().trim();
        let purchaseprice = $("#getproductprice").val().trim()
        let warrantyexp = moment($("#getproductwarranty").val().trim()).format("YYYY-MM-DD HH:mm:ss");
        let purchasedate = moment($("#getpurchasedate").val().trim()).format("YYYY-MM-DD HH:mm:ss");
        let productstore = $("#getproductstore").val().trim();
        let productnotes = $("#getproductnotes").val().trim();

        // Creates local "temporary" object for holding employee data
        let product2add = {}
        product2add = {
            purchase_date: purchasedate,
            product_name: productname,
            product_price: purchaseprice,
            warranty_expire_date: warrantyexp,
            store: productstore,
            receipt_URL: receipturl,
            warranty_URL: warrantyurl,
            notes: productnotes 
        };
        
        // Check if values are empty
        if (productname==="" || warrantyexp ==="Invalid date" || purchasedate === "Invalid date") {
            let status = "FAIL"
            let failreason = "Missing Data: Please make sure at least the Product Name, Warranty Expiration Date, and Purchase Date is supplied."
            addModal(product2add, status, failreason)
   
        } else {
        // gonna Try to Add
            console.log(product2add)
            submitNewProduct(product2add)
        }




    });

});


// picture preview tool for receipt and uploader to cloudinary
// imgloc refers to the preview location
// urlresult refers to the ID where to place the resulting URL string
function attachListener1(receiptUpload, previewselector, urlresult) {
    var imgPreview = document.getElementById(previewselector);
  
  
    receiptUpload.addEventListener('change', function (event) {
      var file = event.target.files[0];
      var formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLAUDINARY_UPLOAD_PRESET);

      // disable while uploading image and change message
      
      axios({
        url: CLAUDINARY_URL,
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: formData
      }).then(function (res) {
        imgPreview.src = res.data.secure_url;
        //append(imgPreview.src);
  
        console.log(urlresult, imgPreview.src);
  
        $(urlresult).val(imgPreview.src);
        console.log(urlresult, imgPreview.src);
  
  
      }).catch(function (err) {
        console.log(err);
  
      });
    });
  }
  

// clear modal data
function clearModal() {
    //clear URL's
    $("#getreceipturl").html("");
    $("#getwarrantyurl").html("");

    // clear current entries
    $('#modalstatus').html("")
    $('#modalstatusreason').html("")
    $("#purchasedate").html("")
    $("#prodname").html("")
    $("#warrantyexp").html("")
    $("#prodprice").html("")
    $("#store").html("")
    $("img#receipturl").attr("src", "/images/receipt.png")
    $("img#warrantyurl").attr("src", "/images/warranty.png")
    $("#notes").html("")
}

// udpate modal data   
function addModal(data, status, statusreason) {
    clearModal()

    // update with new entries
    $('#modalstatus').html(status)
    $('#modalstatusreason').html(statusreason)
    $("#purchasedate").html(data.purchase_date)
    $("#prodname").html(data.product_name)
    $("#warrantyexp").html(data.warranty_expire_date)
    $("#prodprice").html(data.product_price)
    $("#store").html(data.store)
    $("#receipturl").attr("src", data.receipt_URL)
    $("#warrantyurl").attr("src", data.warranty_URL)
    $("#notes").html(data.notes)
    $("#addModal").modal("show")

    // re-enable button after add
    $("#addRecord").prop("disabled", false)
}



// this function actually calls the API method that updates the database
function submitNewProduct(newProduct) {
    // this api call will add the user object also  
    $.post("/api/v2/product", newProduct, function (returnNewProduct) {
        console.log(returnNewProduct)
        if (returnNewProduct.id > 0) {
            let status = "SUCCESS"
            let statusmessage = "item successfully added"
            addModal(returnNewProduct, status, statusmessage)
        } else {
            let status = "FAILURE"
            let statusmessage = "item had issues adding"
            addModal(returnNewProduct, status, statusmessage) 
        }
        console.log("My stuff has been submitted to DB!", newProduct)
    })
}



/*
The get functions below
*/

function getlist() {
    $.get("/api/v2/product", function (data) {
        console.log(data)
        console.log("Data is above")
        let newdata = JSON.stringify(data)
        console.log("New DAta", newdata)
        $("#resultproductlist").html(newdata)
    })
}
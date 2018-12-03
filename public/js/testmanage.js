let picker, picker2, maintable
const CLAUDINARY_URL = 'https://api.cloudinary.com/v1_1/fr7/upload';
const CLAUDINARY_UPLOAD_PRESET = "xewk1otu"

$(document).ready(function () {
    // This file just does a GET request to figure out which user is logged in
    // and updates the HTML on the page
    $.get("/api/user_data").then(function (data) {
        $(".member-name").text(data.email);
    });


    // this is the TABLE for the main web page 
    // product list display    see testlist.html
    maintable = $('#productlisttable').DataTable({
        "responsive": true,
        "select": "on",
        "ajax": {
            url: "/api/v2/productdata",
            get: 'GET'
        },
        "columns": [
            { data: 'warranty_expire_date' },
            { data: 'purchase_date' },
            { data: 'product_name' },
            { data: 'product_price' },
            {
                'data': null,
                "defaultContent": '<i class="fa fa-remove productdelete" style="color:red;font-size:2rem"></i> <i class="fa fa-edit productedit" style="font-size:2rem"></i>'
            },
        ],
        "columnDefs": [
            {
                "targets": [0, 1],
                render: function (data) {
                    return moment(data).format('YYYY-MM-DD')
                }
            },
            {
                responsivePriority: 1,
                targets: 4
            },
            {
                responsivePriority: 1,
                targets: 2
            }, 
            {
                responsivePriority: 1,
                targets: 0
            }, 
        ],
        "scrollY": '50vh',
        "scrollCollapse": true,
        "paging": false,
        "order": [
            [0, "asc"]
        ]
    })


    // create calendar input with the popout calendar
    const picker = datepicker('#up_purchasedate');
    const picker2 = datepicker("#up_warrantyexp");

    // act on delete button on table
    $('#productlisttable tbody').on("click", ".productdelete", function () {
        let data = maintable.row($(this).parents('tr')).data();
        console.log(data)
        showDeleteModal("DELETE REQUEST", "Are you sure you want to delete this record?", data)
    })

    // act on edit button on table
    $('#productlisttable tbody').on("click", ".productedit", function () {
        let data = maintable.row($(this).parents('tr')).data();
        console.log(data)
        showUpdateModal("UPDATE REQUEST", "Stuff inside here to update", data)
        // alert("Update Operation: " + data['product_name'] + "'s ID is: " + data['id'])
    })

    // delete button inside the delete modal that opens up
    // this click handler will cause the delete to happen
    $(document).on("click", "#confirmdelete", function () {
        let idinfo = $(this).data("id")
        console.log("Before you delete: ", idinfo)
        submitDeleteProduct(idinfo)
    })


    // update button isnide the update modal that opens up
    //  this click handler will update the modal 
    $(document).on("click", "#confirmupdate", function () {
        // capture updated information
        let idinfo = $(this).data("id")
        $("#confirmupdate").attr('data-id', idinfo)
        captureDataAndUpdate()
    })


    // receipt Upload event listener, preview, gets URL from cloudinary
    var receiptUpload = document.getElementById('receipt-upload');
    if (receiptUpload != null) {
        attachListener1(receiptUpload, 'up_receipturl', "#getreceipturl");
    }

    // warranty Upload event listener preview, gest URL from cloudinary
    var warrantyUpload = document.getElementById('warranty-upload');
    if (warrantyUpload != null) {
        attachListener1(warrantyUpload, 'up_warrantyurl', "#getwarrantyurl");
    }


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


// extract data from modal fomr for updates.  And submit Update request
function captureDataAndUpdate() {
    //disable button while processing request
    $("#confirmupdate").prop("disabled", true)

    // Grabs user input
    let updateProduct = {}
    console.log('i am in the updateme function!')
    // build updateProduct object in correct format to add to database
    updateProduct.id = $("#confirmupdate").data("id")
    updateProduct.product_name = $("#up_prodname").val().trim()
    updateProduct.product_price = $("#up_prodprice").val().trim()
    updateProduct.warranty_expire_date = moment($("#up_warrantyexp").val().trim()).format("YYYY-MM-DD HH:mm:ss");
    updateProduct.purchase_date = moment($("#up_purchasedate").val().trim()).format("YYYY-MM-DD HH:mm:ss");
    updateProduct.store = $("#up_store").val().trim()
    updateProduct.receipt_URL = $("#getreceipturl").val().trim()
    updateProduct.warranty_URL = $("#getwarrantyurl").val().trim()
    updateProduct.notes = $("#up_notes").val().trim()
    console.log("I am in updateme", updateProduct)
    submitUpdateProduct(updateProduct)

}


// this is the function to show the modal that allows input to update the product info
function showUpdateModal(status, statusmessage, data) {

    $("#confirmupdate").attr('data-id', data.id)

    $("#up_status").val(status)
    $("#up_statusmessage").val(statusmessage)
    $("#up_purchasedate").val(data.purchase_date)
    $("#up_prodname").val(data.product_name)
    $("#up_warrantyexp").val(data.warranty_expire_date)
    $("#up_prodprice").val(data.product_price)
    $("#up_store").val(data.store)
    $("#up_receipturl").attr("src", data.receipt_URL)
    $("#up_warrantyurl").attr("src", data.warranty_URL)
    $("#up_notes").val(data.notes)



    // reset button and messages before showing module
    $("#confirmupdate").prop("disabled", false)
    $("#up_statusmessage").html("")
    $("#confirmupdate").html("UPDATE INFO")

    // show modal
    $("#updateModal").modal("show")
}


// this is the modal that lists the detail fo the object to delete    
function showDeleteModal(status, statusmessage, data) {

    $("#confirmdelete").attr('data-id', data.id)

    $("#status").html(status)
    $("#statusmessage").html(statusmessage)

    $("#prodcreate").html(data.createdAt)
    $("#produpdate").html(data.updatedAt)
    $("#purchasedate").html(data.purchase_date)
    $("#prodname").html(data.product_name)
    $("#warrantyexp").html(data.warranty_expire_date)
    $("#prodprice").html(data.product_price)
    $("#store").html(data.store)
    $("#receipturl").attr("src", data.receipt_URL)
    $("#warrantyurl").attr("src", data.warranty_URL)
    $("#notes").html(data.notes)


    $("#deleteModal").modal("show")
}







// this function actually calls the API method that updates the database
function submitUpdateProduct(updateProduct) {
    // this api call will add the user object also  
    $.ajax({
        method: "PUT",
        url: "/api/v2/product",
        data: updateProduct
    }).then(function (updateProduct) {
        console.log("I have updated the product!", updateProduct)

        // reload table
        maintable.ajax.reload()

        //change status message on screen
        $("#up_statusmessage").html("Success!")
        $("#confirmupdate").html("Please close this window!")
    })
}




// this function actually calls the API method that updates the database
function submitDeleteProduct(delProduct) {
    console.log("I am inside the submit Delete functin")
    $.ajax({
        method: "DELETE",
        url: "/api/v2/product/" + delProduct,
    }).then(function () {
        console.log("I have deleted ", delProduct)
        location.reload()
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


function getbyid() {
    productID = $("#productid").val().trim()
    let url = "/api/v2/product/" + productID
    console.log("get by id: ", productID)
    $.get(url, function (data) {
        console.log(data)
        console.log("Data is above")
        let newdata = JSON.stringify(data)
        console.log("New DAta", newdata)
        $("#resultproductid").html(newdata)
    })
}
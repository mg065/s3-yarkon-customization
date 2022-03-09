

var total_files_bytes;
$('#download_all').on('change',function(){
    if ($('#download_all').is(':checked')){
        total_files_bytes = $(".tick-box").attr("file_size")
    }
});

function initializeObj(args) {
    var obj_list = []
    let i = 0
    // document.querySelectorAll('.download_files_table tr').forEach((element) => {
        $(".tick-box:checked").each(function (){
            var selected_file = {
                "name": args[i],
                // "total_bytes": Number(element.children[1].innerText),
                "total_bytes":document.getElementsByClassName("tick-box").fn1.getAttribute("file_size"),
                "downloaded_bytes": 0
            }
            obj_list.push(selected_file)
            i++
    })
    i = 0
    return obj_list

}

var downloadStatus;
$("#cancelDownload").on('click', function () {

    if (downloadStatus == "completed") {
        return;
    }
    else{
        window.stop()
    }
    
});

var inactive_items_length = $('.download_link_btn').length
var download_selected_items = []


// Download Selected Files.
var file_obj = []
function downloadSelectedFiles() {
    // showLoader();
    downloadStatus = "pending"

    console.log("Into Selected Download function")
    var urls = download_selected_items;
    var zip = new JSZip();
    var count = 0;
    var count2 = 0;
    var zipFilename = "SelectedFiles.zip";
    var nameFromURL = [];
    var the_arr = "";
    for (var i = 0; i < urls.length; i++) {
        the_arr = [urls[i].split('/')[5].split('?')[0]];
        nameFromURL[i] = the_arr.pop();


    }
    file_obj = initializeObj(nameFromURL)
    // hideLoader();

    urls.forEach(function (url) {
        var filename = nameFromURL[count2];
        count2++;

        // loading a file and adding it into a zip file
        console.log("Downloading" + parseInt(count2) + "/" + urls.length)
        var txt = "Downloading" + parseInt(count2) + "/" + urls.length
        $(".modal-title").text("Downloading")
        $("#download-label").text("")
        JSZipUtils.getBinaryContent(url, {
            progress: function (e) {
                if ($("#download_all").is(":checked") || $(".tick-box:checked").length > 1){
                name = e.path.split('/')[5].split('?')[0]
                for (let i = 0; i < file_obj.length-1; i++) {
                    if (file_obj[i].name == name) {
                        file_obj[i].downloaded_bytes = e.loaded
                    }
                }
                var loaded = 0
                var total = 0
                for (i = 0; i < file_obj.length; i++) {
                    total = file_obj[i].total_bytes
                    loaded += file_obj[i].downloaded_bytes

                    
                }
                console.log(parseInt(loaded / total * 100))
                $(".progressbar").progressbar({
                        
                        value: Math.ceil(parseInt((loaded / total) * 100))
                });
                
            }
            else{
                $(".progressbar").progressbar({     
                    value: Math.ceil(parseInt(e.percent))
                });
            }
        },
            callback: function (err, data) {

                if (err) {
                    // throw err; // or handle the error
                    $('#download-btn').prop('enabled',true)
                    $('#download-btn').removeClass("btn btn-info disabled").addClass("btn btn-info")
                    $('#download-btn').focus(function() {
                        this.blur();
                    });
                    $( ".progressbar" ).progressbar( "destroy" );

                }
                else if (downloadStatus == "cancelled") {
                    console.log("Download Cancelled")
                    return;
                }
                else {

                    zip.file(filename, data, {
                        binary: true
                    });
                    count++;
                    if (count === urls.length) {

                        $(".modal-title").text("Please wait")
                        $("#download-label").text("Processing...")
                        $( ".progressbar" ).progressbar({
                            value:false
                        });
                        console.log('all downloaded')
                        zip.generateAsync({
                            type: 'blob'
                        }).then(function (content) {
                            saveAs(content, zipFilename);
                            downloadStatus = "completed"
                            $('.btn-info').removeClass('btn btn-info disabled').addClass('btn btn-info')
                            // $(".modal-footer").hide()
                            $("#cancelDownload").click()
                            
                        });
                    }
                }
            }
        });
    });
}


// Event Handling for select/deselect all.
$("#download_all").change(function () {
    if (this.checked) {
        $('#download-btn').prop('disabled',false)
        $(".tick-box").each(function () {
            this.checked = true;
            $(".download_link_btn").removeClass('download_link_btn').addClass('download_link_btn_active');
            $('#download-btn').prop('disabled',false)

        });
        inactive_items_length = $(".download_link_btn").length;
    } else {
        
        $('#download-btn').prop('disabled',true)

        $(".tick-box").each(function () {
            this.checked = false;
            
            $(".download_link_btn_active").removeClass('download_link_btn_active').addClass('download_link_btn');
        });
        inactive_items_length = $('.download_link_btn').length
    }
});


// Event Handling for multiple select/deselect.
$(".tick-box").change(function () {
    if($(".tick-box:checked").length > 0){
        $('#download-btn').prop('disabled',false)
    }
    else{
        $('#download-btn').prop('disabled',true)
    }
    if (!this.checked) {
        $("#download_all").each(function () {
            this.checked = false;
        });
        this.parentElement.parentElement.lastElementChild.children[0].removeAttribute('class')
        this.parentElement.parentElement.lastElementChild.children[0].setAttribute('class', 'download_link_btn')
    } else {
        // $('#download-btn').prop('disabled',false)
        this.parentElement.parentElement.lastElementChild.children[0].removeAttribute('class')
        this.parentElement.parentElement.lastElementChild.children[0].setAttribute('class', 'download_link_btn_active')
        inactive_items_length = $('.download_link_btn').length
        if (inactive_items_length == 0) {
            $("#download_all").each(function () {
                this.checked = true;
            });
        }
    }
});


// Event of Download selected items.
$('#download').off("click");
$("#download-btn").on("click", function () {
    
    download_selected_items = []
    $('.download_link_btn_active').each(function () {
        var href = $(this).attr('href');
        download_selected_items.push(href)
        // do something with href if you want
    })
    if (download_selected_items.length != 0) {
        $('.btn-info').removeClass('btn btn-info').addClass('btn btn-info disabled')            

        if (download_selected_items.length == 1) {

            alert("One selected file will be downloaded into a Zip folder.\nKindly do not close the page until its completely downloaded.");

            downloadSelectedFiles();
        } else {
            message = (download_selected_items.length).toString() + " selected files will be downloaded into a Zip folder.\nKindly do not close the page until its completely downloaded."
            alert(message);
            downloadSelectedFiles();
        }
    } else {
        alert("No Files Selected!");
    }
});

// Loader Show
function showLoader() {
    var over = '<div id="trialLoader"></div>';
    $(over).appendTo('body');
}

// Loader Hide
function hideLoader() {
    var over = $('#trialLoader');
    over.remove();
}

// for forcibly downloading a file
function forceDownload(url, fileName) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(this.response);
        var tag = document.createElement('a');
        tag.href = imageUrl;
        tag.download = fileName;
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
    }
    xhr.send();
}



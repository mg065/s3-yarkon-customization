yarkon.onReady = function (yarkon) {

        $("#bs-navbar-collapse-1 > form").css('display', 'block')
        setTimeout(function(){
            $(".bs-navbar-context button.navbar-btn").removeAttr("disabled");
            $("#bs-navbar-collapse-1 > form > button").removeAttr("disabled")
            $("#bs-navbar-collapse-1 > button").css('display','none');
        }, 1000);

    yarkon.onInitMenu(function(e, args) {

            if (args.menu === yarkon.Menu.TreeMenu ||
                    args.menu === yarkon.Menu.GridDocMenu ||
                    args.menu === yarkon.Menu.GridFolderMenu ||
                    args.menu === yarkon.Menu.GridCanvasMenu ||
                    args.menu === yarkon.Menu.SearchGridDocMenu ||
                    args.menu === yarkon.Menu.SearchGridFolderMenu ||
                    args.menu === yarkon.Menu.SearchGridCanvasMenu) {
                args.remove = [
                'Properties', 'Share'
                ];


            }

            if (args.menu === yarkon.Menu.GridDocMenu) {
            args.add = [{

            menuEntry: {

                id: 'share_file_by_email',

                label: 'Share',

                icon: 'fa-envelope', // Any font-awesome icon

                click: function(item) {

                    aws_region = aws_region
                    Selected_Files_to_share = yarkon.getSelectedItems();
                    No_of_Selected_Files = yarkon.getSelectedItems().length;

		    if (No_of_Selected_Files > 0)
                        document.getElementById("no_of_selected_files").innerHTML = No_of_Selected_Files.toString();
                    else
                        document.getElementById("no_of_selected_files").innerHTML = "1"

                    $('#share-file-by-email-yarkon').modal('show');

                    console.log('Share: ' + JSON.stringify(Selected_Files_to_share, null, ""));
		    console.log('Share: ' + JSON.stringify(item, null, ""));
                },

                enabler: function(item) {

                    return true;
                }
            },

            insertBefore: 'Cut'
        }, {

            menuEntry: {

                id: 'my_separator',

                label: '-'
            },

            insertBefore: 'Cut'
        }]
    }
        
});

}

function removeClickEventsOnFiles(){
        $('.file').parent().on('dblclick',e=>false);
    }
    setInterval(removeClickEventsOnFiles,500);

    function shareEmailYarkon(){
    $("#share-email-yarkon-form").validate({
                 rules: {
                        clientShareName:
                            {
                            required: true,
                            minlength: 3
                            },

                        clientShareEmail:
                            {
                            required: true,
                            email: true,
                            minlength: 7
                            },

                        linkExpiration:
                            {
                            required: true
                            }
                        },

                        messages: {
                            clientShareName: {
                                required: "Please enter your name",
                            },
                            clientShareEmail: {
                                required: "Please enter guest email address",
                                email: "Please enter a valid email address"
                            },
                            linkExpiration: {
                                required: "Please enter Expire in Hours",
                            }
                        },
                 submitHandler: function (form) {
                    let shareName = $('#clientShareName').val()
                    let shareEmail = $('#clientShareEmail').val()
                    let hourExpire = $('#linkExpiration').val()

                    if (shareName == "" || shareName.length < 3 ){
                        $("#error_file_link_name").html("Please Fill the Valid Name field");
                        return false
                        }
                    else{
                        $("#error_file_link_name").html("");
                        }

                    if (shareEmail == "" || shareEmail.length <= 7){
                        $("#error_file_link_email").html("Please Fill the Valid Email address");
                        return false
                        }
                    else{
                        $("#error_file_link_email").html("");
                        }

                    if (hourExpire == "" || (hourExpire < 8 || hourExpire > 168)){
                        $("#error_file_link_expire").html("Out of Range");
                        return false
                        }
                    else{
                        $("#error_file_link_expire").html("");
                        }
                    share_file_details = {
                            share_Name  :  shareName,
                            share_Email :  shareEmail,
                            hour_Expire :  hourExpire,
                            Selected_Files_to_Share  :  Selected_Files_to_share,
                            No_of_Selected_Files : No_of_Selected_Files,
                            aws_Region  :  aws_region
                        }
                    url = $('#urlShareEmailYarkon').val()
                    $.ajax({
                        url: url,
                        type:"POST",
                        data:{
                            Share_file_details: JSON.stringify(share_file_details)
                            }
                    }).done(function( data ){
                        if (data){
                                if (data.status == true){
                                    console.log("status:",data.status)
                                    alert("Email has been sent successfully")
                                    form.clientShareName.value = ''
                                    form.clientShareEmail.value = ''
                                    form.linkExpiration.value = $('#linkExpiration').val()
                                    }
                                else{
                                    console.log("status:",data.status)
                                    alert("Error Message:",data.error);
                                    }
                                }
                        $("#error_file_link_name").html("")
                        $("#error_file_link_email").html("")
                        $('#share-file-by-email-yarkon').modal('hide');
                    }).fail(function(error){

                        console.log(error)
                        alert(error)
                    });
                    return false;
                 }
             })
}

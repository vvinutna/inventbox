$(document).ready(function () {

    $('#usageCalcForm').validate({ // initialize the plugin
        rules: {
            startDate: {
                required: true
            }
        },
        errorPlacement: function(error,element) {
            return true;
        },
        submitHandler: function (form) { // for demo
            console.log('IN SUBMITHANDLER');
            //addNewMember(form);
        }
    });

});
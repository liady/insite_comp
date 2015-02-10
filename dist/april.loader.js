;(function($, global){
    "use strict";

    var base = "//dm-util.s3.amazonaws.com/insite-contest/";
    if($("#aprilFoolsPrankster").length) return;
    $("<div/>").load(base+"insite.april.html #aprilFoolsPrankster",function(){
        $(this).find("#aprilFoolsPrankster").appendTo("body");
        $.getScript("//cdn.firebase.com/js/client/2.1.2/firebase.js",function(){
            $.getScript(base+"insite.april.js");
        });
    });

}(jQuery, window));
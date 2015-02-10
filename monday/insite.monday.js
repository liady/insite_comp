;(function($, global){
    "use strict";

    function pad(n){return n<10? "0"+n : n;}

    function randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    var x=randomDate(new Date(2012, 0, 1), new Date());

    var i = document.createElement("img");
    i.src="http://garfield.com/uploads/strips/"+x.getFullYear()+"-"+pad(x.getMonth()+1)+"-"+pad(x.getDate())+".jpg";
    document.body.appendChild(i);

}(window.jQuery, window));
    
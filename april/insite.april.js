(function ($, global) {
    // Get a reference to the presence data in Firebase.
    var userListRef = new Firebase("https://insiteapril.firebaseio.com/users");
    var actionsRef = new Firebase("https://insiteapril.firebaseio.com/actions");

    var myId;
    var touts={};

    function getMessageId(snapshot) {
        return "e"+snapshot.key().replace(/[^a-z0-9\-\_]/gi, '');
    }
    function fillUsers() {

        var randColors = randomColor({hue: 'blue', count: 18});
        // Update our GUI to show someone"s online status.
        userListRef.on("child_added", function (snapshot) {
            var user = snapshot.val();
            if(myId==getMessageId(snapshot)) return;
            $("<div/>")
                .attr("id", getMessageId(snapshot))
                .addClass("userNameDiv")
                .text(user.name)
                .attr("style","background-color:"+randomColor({luminosity: 'bright'}))
                .appendTo("#presenceDiv");
        });

        // Update our GUI to remove the status of a user who has left.
        userListRef.on("child_removed", function (snapshot) {
            $("#presenceDiv").children("#" + getMessageId(snapshot))
                .remove();
        });

        // Update our GUI to change a user"s status.
        userListRef.on("child_changed", function (snapshot) {
            var user = snapshot.val();
            $("#presenceDiv").children("#" + getMessageId(snapshot))
                .text(user.name);
        });
    }

    function addCurrentUser() {
        // A helper function to let us set our own state.
        function setUserStatus(skipStorage) {
            var name= $(".afpUserName").text();
            if(!skipStorage)
                localStorage.setItem("insiteUserName",name);
            // Set our status in the list of online users.
            myUserRef.set({
                name: name,
                status: "online"
            });
        }

            // Generate a reference to a new location for my user with push.
            var myUserRef = userListRef.push();
            myId = getMessageId(myUserRef);
            var name = localStorage.getItem("insiteUserName") || "Guest"+Math.floor(Math.random() * 50) + 2;
            $(".afpUserName").text(name);

            $(".afpUserName").on("keyup", function(e) {
                if(e.keyCode==13 || e.keyCode==27){
                    $(this).blur();
                    $(".afpTitleSpan").focus();
                }
            });
            $(".afpUserName").on("keypress", function(e) {
                if(e.keyCode!=8 && e.keyCode!=46){
                    if($(this).text().length>12){
                        e.preventDefault();
                        // $(this).blur();
                        // $(".afpTitleSpan").focus();
                    }
                }else {
                    if($(this).text().length<2){
                        e.preventDefault();
                    }
                }
            });
            $(".afpUserName").on("keydown", function(e) {
                if(e.keyCode==8 || e.keyCode==46){
                    if($(this).text().length<2){
                        e.preventDefault();
                    }
                }
            });
            $(".afpUserName").on("blur", function(e) {
                $(this).removeClass("active");
                setUserStatus();
            });
            $(".afpUserName").on("focus", function(e) {
                $(this).addClass("active");
                setUserStatus();
            });
            // Get a reference to my own presence status.
            var connectedRef = new Firebase("https://insiteapril.firebaseio.com//.info/connected");

            connectedRef.on("value", function (isOnline) {
                if (isOnline.val()) {
                    // If we lose our internet connection, we want ourselves removed from the list.
                    myUserRef.onDisconnect().remove();

                    // Set our initial online status.
                    setUserStatus(true);
                } else {

                    // We need to catch anytime we are marked as offline and then set the correct status. We
                    // could be marked as offline 1) on page load or 2) when we lose our internet connection
                    // temporarily.
                    setUserStatus(true);
                }
            });
        }

        function bindActions(){
            $(".afp_container").on("click.act",".userNameDiv", function(){
                var victimId = $(this).attr("id");
                actionsRef.push({
                    from:$(".afpUserName").text(),
                    to:victimId,
                    action:"cage",
                    params : {}
                });
            });
            actionsRef.on("child_added", function (snapshot) {
                var val = snapshot.val();
                if(val.to==myId){
                    notify(val.from);
                    doAction(val.action, val.params);
                    snapshot.ref().remove();
                }
            });
        }

    function start() {
        $("body").addClass("afpBodyGrayTrans");
        $(".veryHidden").removeClass("veryHidden");
        fillUsers();
        addCurrentUser();
        bindActions();
    }

    function notify(name){
        $("#afp_message_bar .afpPranker").text(name);
        $("#afp_message_bar").slideDown("normal", "easeInOutBack");

        var t=setTimeout(function(){
            hideNotification();
        },5500);
        $("#afp_message_bar").off("click").on("click",function(){
            clearTimeout(t);
          $(this).slideUp("normal", "easeInOutBack");
        });
    }

    function doAction(actionRef, params){
        var actionslist = {
            "video" : playVideo,
            "gray" : doGray,
            "blur" : doBlur,
            "cage" : doCage
        };
        (actionslist[actionRef]||$.noop)(params);
    }

    function playVideo(){
        $('.ytclass').remove();
        clearTimeout(touts.video);
        $('<iframe class="ytclass" width="420" height="345" src="http://www.youtube.com/embed/oHg5SJYRHA0?autoplay=1&showinfo=0&controls=0" frameborder="0" allowfullscreen></iframe>')
        .attr("id","player")
        .appendTo("body");
        touts.video = setTimeout(function(){
            hideNotification();
            $('.ytclass').remove();
        },15000);
        return;
    }

    function doGray(){
        clearTimeout(touts.gray);
        $("body").addClass("afpBodyGray");
        touts.gray = setTimeout(function(){
            hideNotification();
            $("body").removeClass("afpBodyGray");
        },18000);
    }

    function doBlur(){
        clearTimeout(touts.blur);
        $("body").addClass("afpBodyBlur");
        touts.blur = setTimeout(function(){
            hideNotification();
            $("body").removeClass("afpBodyBlur");
        },14000);
    }

    function doCage(){
        clearTimeout(touts.cage);
        $("img").each(function(i,e){
            var w = $(e).width();
            var h = $(e).height();
            if($(e).attr("old_src"))
             return;
            $(e).attr("old_src",$(e).attr("src"));
            $(e).attr("src","http://www.placecage.com/"+w+"/"+h);
        });
        touts.cage = setTimeout(function(){
            hideNotification();
            $("[old_src]").each(function(i,e){
                $(e).attr("src",$(e).attr("old_src"));
                $(e).removeAttr("old_src");
            });
        },12000);
    }

    function hideNotification(){
        $("#afp_message_bar").slideUp("normal", "easeInOutBack");
    }

$(function(){
    setTimeout(function(){
        start();
    },0);

});


}(jQuery, window));

jQuery.easing.jswing=jQuery.easing.swing;jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(e,f,a,h,g){return jQuery.easing[jQuery.easing.def](e,f,a,h,g)},easeInQuad:function(e,f,a,h,g){return h*(f/=g)*f+a},easeOutQuad:function(e,f,a,h,g){return -h*(f/=g)*(f-2)+a},easeInOutQuad:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f+a}return -h/2*((--f)*(f-2)-1)+a},easeInCubic:function(e,f,a,h,g){return h*(f/=g)*f*f+a},easeOutCubic:function(e,f,a,h,g){return h*((f=f/g-1)*f*f+1)+a},easeInOutCubic:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f+a}return h/2*((f-=2)*f*f+2)+a},easeInQuart:function(e,f,a,h,g){return h*(f/=g)*f*f*f+a},easeOutQuart:function(e,f,a,h,g){return -h*((f=f/g-1)*f*f*f-1)+a},easeInOutQuart:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f+a}return -h/2*((f-=2)*f*f*f-2)+a},easeInQuint:function(e,f,a,h,g){return h*(f/=g)*f*f*f*f+a},easeOutQuint:function(e,f,a,h,g){return h*((f=f/g-1)*f*f*f*f+1)+a},easeInOutQuint:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f*f+a}return h/2*((f-=2)*f*f*f*f+2)+a},easeInSine:function(e,f,a,h,g){return -h*Math.cos(f/g*(Math.PI/2))+h+a},easeOutSine:function(e,f,a,h,g){return h*Math.sin(f/g*(Math.PI/2))+a},easeInOutSine:function(e,f,a,h,g){return -h/2*(Math.cos(Math.PI*f/g)-1)+a},easeInExpo:function(e,f,a,h,g){return(f==0)?a:h*Math.pow(2,10*(f/g-1))+a},easeOutExpo:function(e,f,a,h,g){return(f==g)?a+h:h*(-Math.pow(2,-10*f/g)+1)+a},easeInOutExpo:function(e,f,a,h,g){if(f==0){return a}if(f==g){return a+h}if((f/=g/2)<1){return h/2*Math.pow(2,10*(f-1))+a}return h/2*(-Math.pow(2,-10*--f)+2)+a},easeInCirc:function(e,f,a,h,g){return -h*(Math.sqrt(1-(f/=g)*f)-1)+a},easeOutCirc:function(e,f,a,h,g){return h*Math.sqrt(1-(f=f/g-1)*f)+a},easeInOutCirc:function(e,f,a,h,g){if((f/=g/2)<1){return -h/2*(Math.sqrt(1-f*f)-1)+a}return h/2*(Math.sqrt(1-(f-=2)*f)+1)+a},easeInElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return -(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e},easeOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return g*Math.pow(2,-10*h)*Math.sin((h*k-i)*(2*Math.PI)/j)+l+e},easeInOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k/2)==2){return e+l}if(!j){j=k*(0.3*1.5)}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}if(h<1){return -0.5*(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e}return g*Math.pow(2,-10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j)*0.5+l+e},easeInBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*(f/=h)*f*((g+1)*f-g)+a},easeOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*((f=f/h-1)*f*((g+1)*f+g)+1)+a},easeInOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}if((f/=h/2)<1){return i/2*(f*f*(((g*=(1.525))+1)*f-g))+a}return i/2*((f-=2)*f*(((g*=(1.525))+1)*f+g)+2)+a},easeInBounce:function(e,f,a,h,g){return h-jQuery.easing.easeOutBounce(e,g-f,0,h,g)+a},easeOutBounce:function(e,f,a,h,g){if((f/=g)<(1/2.75)){return h*(7.5625*f*f)+a}else{if(f<(2/2.75)){return h*(7.5625*(f-=(1.5/2.75))*f+0.75)+a}else{if(f<(2.5/2.75)){return h*(7.5625*(f-=(2.25/2.75))*f+0.9375)+a}else{return h*(7.5625*(f-=(2.625/2.75))*f+0.984375)+a}}}},easeInOutBounce:function(e,f,a,h,g){if(f<g/2){return jQuery.easing.easeInBounce(e,f*2,0,h,g)*0.5+a}return jQuery.easing.easeOutBounce(e,f*2-g,0,h,g)*0.5+h*0.5+a}});


(function(a,b){if(typeof define==="function"&&define.amd){define([],b)}else{if(typeof exports==="object"){var c=b();if(typeof module==="object"&&module&&module.exports){exports=module.exports=c}exports.randomColor=c}else{a.randomColor=b()}}}(this,function(){var c={};p();var g=function(s){s=s||{};var u,t,w;if(s.count){var v=s.count,r=[];s.count=false;while(v>r.length){r.push(g(s))}return r}u=q(s);t=d(u,s);w=e(u,t,s);return k([u,t,w],s)};function q(t){var s=l(t.hue),r=n(s);if(r<0){r=360+r}return r}function d(r,u){if(u.luminosity==="random"){return n([0,100])}if(u.hue==="monochrome"){return 0}var t=b(r);var v=t[0],s=t[1];switch(u.luminosity){case"bright":v=55;break;case"dark":v=s-10;break;case"light":s=55;break}return n([v,s])}function e(u,t,s){var v,r=o(u,t),w=100;switch(s.luminosity){case"dark":w=r+20;break;case"light":r=(w+r)/2;break;case"random":r=0;w=100;break}return n([r,w])}function k(s,r){switch(r.format){case"hsvArray":return s;case"hsv":return a("hsv",s);case"rgbArray":return i(s);case"rgb":return a("rgb",i(s));default:return j(s)}}function o(z,s){var v=m(z).lowerBounds;for(var t=0;t<v.length-1;t++){var A=v[t][0],x=v[t][1];var y=v[t+1][0],w=v[t+1][1];if(s>=A&&s<=y){var r=(w-x)/(y-A),u=x-r*A;return r*s+u}}return 0}function l(t){if(typeof parseInt(t)==="number"){var s=parseInt(t);if(s<360&&s>0){return[s,s]}}if(typeof t==="string"){if(c[t]){var r=c[t];if(r.hueRange){return r.hueRange}}}return[0,360]}function b(r){return m(r).saturationRange}function m(t){if(t>=334&&t<=360){t-=360}for(var r in c){var s=c[r];if(s.hueRange&&t>=s.hueRange[0]&&t<=s.hueRange[1]){return c[r]}}return"Color not found"}function n(r){return Math.floor(r[0]+Math.random()*(r[1]+1-r[0]))}function f(r,s){return(r+s)%360}function j(s){var r=i(s);function u(w){var v=w.toString(16);return v.length==1?"0"+v:v}var t="#"+u(r[0])+u(r[1])+u(r[2]);return t}function h(u,t,w){var v=w[0][0],s=w[w.length-1][0],r=w[w.length-1][1],x=w[0][1];c[u]={hueRange:t,lowerBounds:w,saturationRange:[v,s],brightnessRange:[r,x]}}function p(){h("monochrome",null,[[0,0],[100,0]]);h("red",[-26,18],[[20,100],[30,92],[40,89],[50,85],[60,78],[70,70],[80,60],[90,55],[100,50]]);h("orange",[19,46],[[20,100],[30,93],[40,88],[50,86],[60,85],[70,70],[100,70]]);h("yellow",[47,62],[[25,100],[40,94],[50,89],[60,86],[70,84],[80,82],[90,80],[100,75]]);h("green",[63,158],[[30,100],[40,90],[50,85],[60,81],[70,74],[80,64],[90,50],[100,40]]);h("blue",[159,257],[[20,100],[30,86],[40,80],[50,74],[60,60],[70,52],[80,44],[90,39],[100,35]]);h("purple",[258,282],[[20,100],[30,87],[40,79],[50,70],[60,65],[70,59],[80,52],[90,45],[100,42]]);h("pink",[283,334],[[20,100],[30,90],[40,86],[60,84],[80,80],[90,75],[100,73]])}function i(z){var y=z[0];if(y===0){y=1}if(y===360){y=359}y=y/360;var H=z[1]/100,D=z[2]/100;var G=Math.floor(y*6),B=y*6-G,x=D*(1-H),w=D*(1-B*H),E=D*(1-(1-B)*H),u=256,A=256,C=256;switch(G){case 0:u=D,A=E,C=x;break;case 1:u=w,A=D,C=x;break;case 2:u=x,A=D,C=E;break;case 3:u=x,A=w,C=D;break;case 4:u=E,A=x,C=D;break;case 5:u=D,A=x,C=w;break}var F=[Math.floor(u*255),Math.floor(A*255),Math.floor(C*255)];return F}function a(s,r){return s+"("+r.join(", ")+")"}return g}));
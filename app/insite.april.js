;(function($, global){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://dm-util.s3.amazonaws.com/insite-contest/insite.april.html', true);
    xhr.responseType = 'document';
    xhr.onload = function(e) {
      var doc = e.target.response;

      var doc_container = doc.querySelector('div');
      $("body").append($(doc_container));

    };
    xhr.send();
}(jQuery, window))
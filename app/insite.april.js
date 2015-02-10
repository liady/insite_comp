;(function($, global){
    var xhr = new XMLHttpRequest();
    // xhr.open('GET', 'http://dm-util.s3.amazonaws.com/insite-contest/insite.april.html', true);
    xhr.open('GET', 'http://localhost:8000/dist/insite.april.html', true);
    xhr.responseType = 'document';
    xhr.onload = function(e) {
      var doc = e.target.response;
      var doc_container = doc.getElementById('aprilFoolsPrankster');
      $("body").append($(doc_container));
      $(doc_container).show();
    };
    xhr.send();
}(jQuery, window));
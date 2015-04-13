$(function(){
  // Load Binds
  $.get("data/ninja_binds.txt", function(data) {
    var binds = JSON.parse(data);

    binds.forEach(function(e, i, a) {
      var key = Object.keys(e)[0];
      var bind = e[key];

      // loop through the JSON and apply it to the HTML
      if (bind.title != "" || bind.color != "") {
        var $bind = $("#" + key);
        if (bind.action != "") { $bind.attr("title", bind.action); }
        if (bind.color != "") { $bind.css("background-color", bind.color); }
        if (bind.title != "") { $("h2", $bind).html(bind.title); }
      }

    });
  });
});


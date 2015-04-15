$(function(){

  var binds = [];
  var edit_index = -1;
  var edit_key_id = null;

  function loadBindsFromJSON(file) {
    // Load Binds
    $.get("data/" + file, function(data) {
      binds = JSON.parse(data);

      binds.forEach(function(e, i, a) {
        var key = Object.keys(e)[0];
        var bind = e[key];

        // loop through the JSON and apply it to the HTML

        // Load New
        if (bind.title != "" || bind.color != "") {
          var $bind = $("#" + key);
          if (bind.action != "") {
            $bind.attr("title", bind.action);
            $bind.addClass("has_action");
          }
          if (bind.color != "") { $bind.css("background-color", bind.color); }
          if (bind.title != "") { $("h2", $bind).html(bind.title); }
        }

      });

    });
  }

  // Stupid hack to clear them for now
  function clearBinds() {
    $("#bind_container h2").html("");
    $("#bind_container div").css("background-color","");
    $("#bind_container div").attr("title","");
    $("#bind_container div").removeClass("has_action");
  }

  // Initial load
  loadBindsFromJSON("ninja_binds.txt");

  /*
   * Other
   */

  $(".key").each(function() {
    $(this).prepend('<i class="fa fa-pencil"></i>');
  });

  $(".key i").click(function() {
    var $key_editor = $("#key_editor");
    var key_id = $(this).parent("div").attr("id");
    var key_name = $(this).siblings("div").html();
    $key_editor.show();
    $("h3 span", $key_editor).html(key_name);
    //console.log(binds);
    // Look for the bind in the JSON
    binds.forEach(function(e, i, a) {
      var key = Object.keys(e)[0];
      if (key == key_id) {
        var bind = e[key];
        console.log(e[key]);
        console.log(i);
        edit_index = i;
        edit_key_id = key_id;
        $("#edit_key_title").val(bind.title);
        $("#edit_key_action").val(bind.action);
        $('#picker').colpickSetColor(bind.color);
        return false;
      }
    });
  });

  $("#key_save").click(function() {
    console.log(binds[edit_index]);
    console.log(binds[edit_index][edit_key_id]);
    var bind = binds[edit_index][edit_key_id];
    var $bind = $("#" + edit_key_id);
    bind.title = $("#edit_key_title").val();
    bind.action = $("#edit_key_action").val();
    bind.color = "#" + $(".colpick_hex_field input").val();
    console.log(bind);

    if (bind.action != "") {
      $bind.attr("title", bind.action);
      $bind.addClass("has_action");
    }
    if (bind.color != "") { $bind.css("background-color", bind.color); }
    if (bind.title != "") { $("h2", $bind).html(bind.title); }
  });

  $("#close_editor").click(function() {
   $("#key_editor").hide();
  });

  $('#picker').colpick({
    flat:true,
    layout:'hex',
    colorScheme:'dark',
    submit:0
  });

  /*
   * Examples for debugging
   */
  $("#kbx-to-xon").click(function(e) {
    kbx_to_xon(binds);
  });

  $("#parse-vanilla").click(function(e) {
    // cfg to kbx JSON
    $.get("data/vanilla-config.cfg", function(data) {
      var cfg_array = data.split("\n");
      xon_to_kbx(cfg_array);
    });
    e.preventDefault();
  });

  $("#load-parsed-cfg").click(function(e) {
    clearBinds();
    loadBindsFromJSON("vanilla_binds.txt");
  });

  $("#load-ninja-binds").click(function(e) {
    clearBinds();
    loadBindsFromJSON("ninja_binds.txt");
  });

  /*
   * Parsing Functions
   */

  // object to map kbx names to xonotic cfg
  var kbx_names = {
    "esc": "escape",
    "backtick": "backquote",
    "up": "uparrow",
    "right": "rightarrow",
    "down": "downarrow",
    "left": "leftarrow",
    "num_0": "kp_ins",
    "num_period": "kp_del",
    "num_3": "kp_pgdn",
    "num_6": "kp_rightarrow",
    "num_9": "kp_pgup",
    "num_8": "kp_uparrow",
    "num_7": "kp_home",
    "num_4": "kp_leftarrow",
    "num_1": "kp_end",
    "num_2": "kp_downarrow",
    "num_5": "kp_5",
    "num_enter": "kp_enter",
    "num_plus": "kp_plus",
    "num_minus": "kp_minus",
    "num_multiply": "kp_multiply",
    "num_slash": "kp_slash",
    "minus": "-",
    "plus": "=",
    "left_bracket": "[",
    "right_bracket": "]",
    "space_bar": "space",
    "mouse_wheel_up": "mwheelup",
    "mouse_wheel_down": "mwheeldown"
  };

  // object to map xonotic cfg names to kbx
  var xon_names = {
    "escape": "esc",
    "backquote": "backtick",
    "-": "minus",
    "=": "plus",
    "[": "left_bracket",
    "]": "right_bracket",
    "space": "space_bar",
    "uparrow": "up",
    "leftarrow": "left",
    "downarrow": "down",
    "rightarrow": "right",
    "kp_slash": "num_slash",
    "kp_multiply": "num_multiply",
    "kp_minus": "num_minus",
    "kp_home": "num_7",
    "kp_uparrow": "num_8",
    "kp_pgup": "num_9",
    "kp_plus": "num_plus",
    "kp_leftarrow": "num_4",
    "kp_5": "num_5",
    "kp_rightarrow": "num_6",
    "kp_end": "num_1",
    "kp_downarrow": "num_2",
    "kp_pgdn": "num_3",
    "kp_enter": "num_enter",
    "kp_ins": "num_0",
    "kp_del": "num_period",
    "mwheelup": "mouse_wheel_up",
    "mwheeldown": "mouse_wheel_down"
  };

  function kbx_to_xon(kbx_json) {
    var output = [];
    kbx_json.forEach(function(e, i, a) {
      var key = Object.keys(e)[0];
      var bind = e[key];
      var k = key.replace("key_","");
      if (kbx_names[k] != undefined) {
        output.push('bind ' + kbx_names[k] + ' "' + bind.action + '" // ' + bind.title);
      } else {
        output.push('bind ' + k + ' "' + bind.action + '" // ' + bind.title);
      }
    });
    console.log(output.join("\n"));
  }

  function xon_to_kbx(cfg_array) {
    var output = [];
    cfg_array.forEach(function(e, i, a) {
      var re = /^bind (.+) "(.+)"( (.+))?/i;
      var raw = e.match(re);
      if (raw) {
        //console.log(raw);
        var bind = raw[1].toLowerCase();
        var action = raw[2];

        var key = xon_names[bind] || bind;
        key = "key_" + key;

        var o = {};
        o[key] = { "title": action, "action": action, "color": "" };
        output.push(o);

      } else {
        console.warn(e);
      }
    });
    console.log(output);
    console.log(JSON.stringify(output));
  }

});

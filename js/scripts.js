$(function(){

  var global = {};
  var xonotic_config_import = {
    binds: [],
    other: [] 
  };
  var xonotic_config_import;
  var binds = [];
  var presets = {
    'Xonotic Default': 'http://z.github.io/kbx/data/vanilla-config.cfg',
    'Ninja Bind': 'http://z.github.io/kbx/data/ninja_binds.cfg',
  };
  var xonotic_function_colors = [

    "#55BA63", // dark green; drop item/weapon
    "#98D1A9", // light green; switch to weapons
    "#BAB0BF", // grey; say others
    "#C2DBF2", // light blue; say Status report
    "#D0DF59", // light green; movement
    "#F58D80", // light red; change bind sets
    "#FAB07F", // orange; menu, etc.
    "#FFD75F"  // yellow; adjust views
  ];

  function loadConfigFromURL(url) {
    $.get(url, function(data) {
      $('#textarea_xonotic_config_import').html(data);
      splitBindsFromConfig(data);
    });
  }

  function splitBindsFromConfig(config) {
      // TODO verify Windows's newline character(s) also work here
      var lines = config.split("\n");
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].match(/^bind /)) {
          xonotic_config_import.binds.push(lines[i]);
        } else {
          xonotic_config_import.other.push(lines[i]);
        }
      } 
  }
  function joinBindsIntoConfig() {
    return xonotic_config_import.other.concat(xonotic_config_import.binds).join('\n');
  }



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
          if (bind.action != "") { $bind.attr("title", bind.action); }
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
  }

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

  function main() {

    // setup settings dialog
    $("#dialog_settings").dialog({
      autoOpen: false,
      modal: true,
      title: "Settings",
      buttons: {
        "Show": function() {
          alert('show');
          $(this).dialog("close");
        },
        "Export": function() {
          alert('export');
          $(this).dialog("close");
        },
        Cancel: function() {
          $(this).dialog("close");
        }
      },
      //close: function() {
      //  form[ 0 ].reset();
      //  allFields.removeClass( "ui-state-error" );
      //}
    });
    // button to open settings dialog
    $('#button_settings').click(function() {
      $("#dialog_settings")
        .dialog("option",{
          height: $( window ).height() * .8,
          width: $( window ).width() * .8,
        })
        .dialog("open")
      ;
      $('#textarea_xonotic_config_import')
        .height($('#dialog_settings').height()*.7)
        .width($('#dialog_settings').width()-50)
      ;
    });
    // preset select menu
    $.each(presets, function(title, url) {
      $('#preset').append($('<option>', {
        value: title,
        text: title
      }));
    });
    $('#preset').selectmenu().selectmenu("option", "width", "auto");
    // preset load button
    $('#button_load_preset').button().click(function() {
      var preset = $("#preset option:selected" ).text();
      loadConfigFromURL(presets[preset]);
    });


    // Initial load
    //loadBindsFromJSON("ninja_binds.txt");

    $("#kbx-to-xon").click(function(e) {
    kbx_to_xon(binds);
    });

    //$("#parse-vanilla").click(function(e) {
    //// cfg to kbx JSON
    //$.get("data/vanilla-config.cfg", function(data) {
    //  var cfg_array = data.split("\n");
    //  xon_to_kbx(cfg_array);
    //});
    //e.preventDefault();
    //});

    //$("#load-parsed-cfg").click(function(e) {
    //clearBinds();
    //loadBindsFromJSON("vanilla_binds.txt");
    //});

    //$("#load-ninja-binds").click(function(e) {
    //clearBinds();
    //loadBindsFromJSON("ninja_binds.txt");
    //});
  }

  main();

});
// vim: set expandtab ts=2 sw=2:

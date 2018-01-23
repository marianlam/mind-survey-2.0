/*
* JSPSYCH-SURVEY-RATE-BY-DRAGGING
* a jspsych plugin for rating items by dragging them on a scale
*/
jsPsych.plugins["rate-by-dragging"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "rate-by-dragging",
    parameters: {
      title: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Survey Title',
        description: 'Title to display at the top of the page.',
        default_value: ''
      },
      question: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Survey Question',
        description: 'Question to display for the current trial.',
        default_value: ''
      },
      instructions: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Survey Instructions',
        description: 'Instructions to display for the current trial',
        default_value: ''
      },
      draggables: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        pretty_name: 'Draggables',
        array: true,
        default_value: undefined,
        nested: {
          image_source: {
            type: jsPsych.plugins.parameterType.IMAGE,
            pretty_name: 'Image Source for a Draggable',
            description: 'Image to display for an individual draggable',
            default_value: undefined
          },
          image_title: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Image Title for a Draggable',
            description: 'Title of an individual image',
            default_value: ''
          },
          caption: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Image Caption for a Draggable',
            description: 'Caption that is associated with an individual draggable',
            default_value: ''
          }
        }
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button Label',
        description: 'Label of the button.',
        default_value: 'Continue'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    var startTime = (new Date()).getTime();

    var html = "";
    // inject CSS for trial
    html += "<style>";
    html +=
    "body { width: auto; min-width: 1000px; font-family: sans-serif; }"+
    "#title { text-align: center; margin: 5% auto -2% auto; font-family: sans-serif; font-weight: bold; "+
             "font-size: 1.25em; color: #FF8C00; border-bottom: solid #aaa 2px; width: 62%; }"+
    "#main-content { margin: 0 auto; width: 875px; }"+
    "#question { text-align: right; float: left; width: 60%; margin: 5.25% 3% 15px -3%;"+
                "color: #222; }"+
    "#instructions { float: left; width: 35%; margin: 6% 0; padding-left: 4%; border-left: solid #aaa 2px;"+
                    "color: #777; font-size: .9em; margin-bottom: 15px; text-align: left; }"+
    "#scale-container { padding-top: 35%; border-bottom: solid 5px #ccc; border-top: dashed 1px #ccc;"+
                       "border-left: dashed 1px #ccc; border-right: dashed 1px #ccc; height: 285px;"+
                       "position: relative; clear: both; }"+
    ".character-container { width: 5%; height: 50px; position: absolute; bottom: 0; pointer-events: none; }"+
    ".character-image { pointer-events: all; }"+
    ".line { width: 48%; height: 100%; border-right: solid 5px #ccc; position: absolute;"+
            "bottom: -4px; z-index: -10; }"+
    "img { border: 2px solid #ccc; }"

    html +=
    ".line-label { color: #ccc; float: left; width: 33.3%; position: absolute; bottom: -30px; }"+
    "#label-1 { left: 0px; text-align: left; }"+
    "#label-2 { left: 42%; text-align: left; }"+
    "#label-3 { right: 0px; text-align: right; }"+
    "#caption { margin-top: 50px; visibility: hidden; }"+
    "#caption-image { float: left; width: 150px; height: 150px; }"+
    "#caption-div { margin: 0 auto; width: 75%; height: 175px; float: left; text-align: left; padding-left: 3%; color: #777; }"+
    "#caption-div h3 { margin-top: -0.25%; font-family: sans-serif; text-transform: capitalize; }"+
    "#caption-div p { margin-top: -2.5%; }"+
    "#next-button { position: absolute; right: 0px; bottom: -60px; }"

    html += "</style>";

    // show title text
    html += "<div id='title'><h1>"+trial.title+"</h1></div>"

    // show question and instructions text
    html += "<div id='main-content'>" +
    "<div id='starter-info'>"+
    "<div id='question'><h2>"+trial.question+"</h2></div>"+
    "<div id='instructions'><h3>"+trial.instructions+"</h3></div>"+
    "</div>"

    // add draggables and captions
    html += "<div id='scale-container'>";

    // add submit button
    html+= "<input type='submit' id='next-button' value='"+trial.button_label+"'</input>";

    var default_height = 50;
    for (var i = 0; i < trial.draggables.length; i++) {
      html+= "<div id='"+"draggable_"+i+"' class='character-container' style='position:absolute; left: -20px; height: "+(default_height+(i*45))+"px;'>"+
      "<img src='"+trial.draggables[i].image_source+"' alt='"+trial.draggables[i].image_title+"' width='100%' class='character-image'"+
      "data-caption='<h3>"+trial.draggables[i].image_title+"</h3><p>"+trial.draggables[i].caption+"</p>'/>"+
      "<div class='line'></div>"+
      "</div>"
    }

    html += "<div class='line-label' id='label-1'>incapable</div>"+
    "<div class='line-label' id='label-2'>somewhat capable</div>"+
    "<div class='line-label' id='label-3'>entirely capable</div>"+
    "</div>"+
    "<div id='caption'>"+
    "<img id='caption-image'></img>"+
    "<div id='caption-div'></div>"+
    "</div>"+
    "</div>"

    display_element.innerHTML = html;

    var leftOffset = 0;
    var draggable = document.querySelector(".character-image");
    var all_draggables = document.querySelectorAll(".character-image");
    var scale_container = document.querySelector("#scale-container");
    var SCALE_LEFT_BOUND = - (draggable.offsetWidth / 2) + 4;
    var SCALE_RIGHT_BOUND = (scale_container.offsetWidth - (draggable.offsetWidth / 2) - 1);
    var priority_list = [];

    for (var i = 0; i < all_draggables.length; i++) {
      priority_list.push(all_draggables[i]);
    }
    for (var i = 0; i < all_draggables.length; i++) {
      all_draggables[i].addEventListener("mousedown", mouseDown, false);
    }
    for (var i = 0; i < all_draggables.length; i++) {
      all_draggables[i].addEventListener("mouseover", mouseOver, false);
    }
    window.addEventListener("mouseup", mouseUp, false);

    function moveContainer(event) {
      /* get x-coordinate of mouse */
      var x = event.pageX - scale_container.offsetLeft - leftOffset;

      /* if the x-coordinate is within the limits of the scale */
      x = Math.max(x, SCALE_LEFT_BOUND);
      x = Math.min(x, SCALE_RIGHT_BOUND);
      if (x <= SCALE_RIGHT_BOUND && x >= SCALE_LEFT_BOUND) {
        /* move the div containing the character */
        x = x - 1;
        div.style.position = "absolute";
        div.style.left = x + "px";
        /* prevent browser from going to a new URL */
        event.preventDefault();

        /* after one element moves, check ALL other elements to see if they can drop down */
        for (var el = 0; el < all_draggables.length; el++) {
          /* first move ALL elements down */
          var container_div = all_draggables[el].parentElement;
          height = 50;
          container_div.style.height = height + "px";
          /* then check if any element collides with any other elements */
          for (var el2 = 0; el2 < all_draggables.length; el2++) {
            if (all_draggables[el] == priority_list[el2]) {continue;}
            var collision = checkForOverlap(all_draggables[el], priority_list[el2]);
            /* if it does, increase the height of the draggables and check again */
            if (collision) {
              height += 15;
              container_div.style.height = height + "px";
              el2 = 0;
            }
          }
        }
      }
    }
    function mouseUp() {
      window.removeEventListener("mousemove", moveContainer, true);
    }
    function mouseDown(event) {
      div = this.parentElement;
      leftOffset = event.pageX - this.getBoundingClientRect().left;
      window.addEventListener("mousemove", moveContainer, true);
      priority_list.splice(priority_list.indexOf(this), 1);
      priority_list = [this].concat(priority_list);
    }
    function mouseOver() {
      document.querySelector('#caption-div').innerHTML = this.dataset.caption;
      document.querySelector('#caption').style.visibility = 'visible';
      document.querySelector('#caption-image').src = this.src;
    }

  // collect data
  display_element.querySelector('#next-button').addEventListener('click', function(e) {
    e.preventDefault();

    // measure response time
    var endTime = (new Date()).getTime();
    var response_time = endTime - startTime;

    // get final position of all draggables
    var final_locations = [];
    for (var i = 0; i < all_draggables.length; i++) {
      final_locations.push({
        "id": all_draggables[i].parentElement.id,
        "x": ((0|parseFloat(all_draggables[i].parentElement.style.left)) - SCALE_LEFT_BOUND)/(SCALE_RIGHT_BOUND - SCALE_LEFT_BOUND)
      });
    }

    // save data
    var trial_data = {
      "rt": response_time,
      "final_locations": JSON.stringify(final_locations)
    };

    // next trial
    display_element.innerHTML = '';
    jsPsych.finishTrial(trial_data);
  });

  // helper function
  function checkForOverlap(el1, el2) {
    /* get size of elements and their positions relative to the viewport */
    var bounds1 = el1.getBoundingClientRect();
    var bounds2 = el2.getBoundingClientRect();
    var firstIstLeftmost = (bounds1.left <= bounds2.left);
    var leftest = firstIstLeftmost ? bounds1 : bounds2;
    var rightest = firstIstLeftmost ? bounds2 : bounds1;
    /* change to >= if border overlap should count */
    if (leftest.right > rightest.left) {
      var firstIsTopmost = (bounds1.top <= bounds2.top);
      var topest = firstIsTopmost ? bounds1 : bounds2;
      var bottomest = firstIsTopmost ? bounds2 : bounds1;
      /* change to >= if border overlap should count */
      return topest.bottom > bottomest.top;
    }
    else return false;
  }

};

return plugin;
})();

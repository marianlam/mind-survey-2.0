/* now we know that the DOM is ready */
document.addEventListener("DOMContentLoaded", function(event) {
  console.log("DOM fully loaded and parsed");

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

      /* after one element moves, check ALL other elements to see if they can drop down.
         this is done by moving the element down, checking if it collides with any other
         elements. if it does, it moves up and checks again. */
      for (var el = 0; el < all_draggables.length; el++) {
        var container_div = all_draggables[el].parentElement;
        console.log(all_draggables[el].parentElement.style.height);
        console.log(all_draggables[el].parentElement.style.left);
        height = 50;
        container_div.style.height = height + "px";
        /* check for overlaps and increase height of container_div */
        for (var el2 = 0; el2 < all_draggables.length; el2++) {
          if (all_draggables[el] == priority_list[el2]) {continue;}
          var collision = checkForOverlap(all_draggables[el], priority_list[el2]);
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
});

function mouseOver() {
  document.querySelector('#caption-div').innerHTML = this.dataset.caption;
  document.querySelector('#caption').style.visibility = 'visible';
  document.querySelector('#caption-image').src = this.src;
}

function checkForOverlap(el1, el2) {

    /* get size of elements and their positions relative to the viewport */
    var bounds1 = el1.getBoundingClientRect();
    var bounds2 = el2.getBoundingClientRect();

    var firstIstLeftmost = (bounds1.left <= bounds2.left);
    var leftest = firstIstLeftmost ? bounds1 : bounds2;
    var rightest = firstIstLeftmost ? bounds2 : bounds1;

    /* change to >= if border overlap should count */
    if(leftest.right > rightest.left) {

        var firstIsTopmost = (bounds1.top <= bounds2.top);
        var topest = firstIsTopmost ? bounds1 : bounds2;
        var bottomest = firstIsTopmost ? bounds2 : bounds1;

        /* change to >= if border overlap should count */
        return topest.bottom > bottomest.top;
    }
    else return false;

}

var DragManager = function() {
  var dragObject = {};

  var self = this;

  this.onDragStart = function(dragObject) {
      return true;
  };
  this.onDragEnd = function(dragObject) {
      return true;
  };
  this.onDragCancel = function (dragObject) {};

  function onMouseDown(e) {
    if (e.which != 1) return;

    var elem = e.target.closest('.card');

    if (!elem || elem.parentNode == View.deckHolder) return;

    dragObject.elem = elem;
    dragObject.parentElem = elem.parentNode;
    dragObject.downX = e.pageX;
    dragObject.downY = e.pageY;

    var coords = getCoords(dragObject.elem);
    dragObject.shiftX = dragObject.downX - coords.left;
    dragObject.shiftY = dragObject.downY - coords.top;

    
    if (self.onDragStart(dragObject) == false) {
      self.onDragCancel(dragObject);
      cancelDrag(dragObject);
    }
    startDrag(e);

    return;
  }

  function onMouseMove(e) {
    if (!dragObject.elem) return;

    dragObject.elem.style.left = e.pageX - dragObject.shiftX + 'px';
    dragObject.elem.style.top = e.pageY - dragObject.shiftY + 'px';

    return;
  }

  function onMouseUp(e) {
    if (!dragObject.elem) return;
    finishDrag(e);
  }

  function finishDrag(e) {
    var dropElem = findDroppable(e);

    if (!dropElem) {
      self.onDragCancel(dragObject);
    } else {
      console.log(dropElem);
      dragObject.dropElem = dropElem;
      if (self.onDragEnd(dragObject) == false) {
        console.log("here");
        self.onDragCancel(dragObject);
        //cancelDrag(dragObject);
      }
    }

    cancelDrag();
  }

  function cancelDrag () {
    console.log("cancelDrag");
    dragObject.elem.style.zIndex = 0;
    dragObject.elem.style.left = 0;
    dragObject.elem.style.top = 0;
    dragObject.elem.style.position = 'relative';
    dragObject = {};
  }

  function startDrag(e) {
    var elem = dragObject.elem;
    document.body.appendChild(elem);
    elem.style.zIndex = 9999;
    elem.style.position = 'absolute';
    elem.style.left = e.pageX - dragObject.shiftX + 'px';
    elem.style.top = e.pageY - dragObject.shiftY + 'px';
  }

  function findDroppable(event) {
    dragObject.elem.classList.add("hidden");

    var elem = document.elementFromPoint(event.clientX, event.clientY);

    dragObject.elem.classList.remove("hidden");

    if (elem == null) {
      return null;
    }

    if (elem.closest('.card')) {
      return elem.closest('.card');
    } else if (elem.closest('.stack')) {
      return elem.closest('.stack');
    } else return elem.closest('.final'); 
  }

  document.onmousemove = onMouseMove;
  document.onmouseup = onMouseUp;
  document.onmousedown = onMouseDown;
};

function getCoords(elem) { // кроме IE8-
  var box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
};

var dragManager = new DragManager();
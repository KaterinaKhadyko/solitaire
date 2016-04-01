var deckHolder = document.getElementById("deck");


var cards = new Array(52);
for (var i = 0; i < cards.length; i++) {
	cards[i] = i + 1;
}
cards = shuffle(cards);
createCardElement(cards);
dealTheCards();
openCards();

function getRandom(min, max) {

	return parseInt(Math.random() * (max - min) + min);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function createCardElement (array) {
	
	for (var i = 0; i < array.length; i++) {
		var element = document.createElement("div");
		element.classList.add("card");
		element.setAttribute("id", array[i]);
		deckHolder.appendChild(element);
	}
	return element;
}



function dealTheCards() {
	var stacks = document.getElementsByClassName("stack");
	
	for (var i = 0; i < stacks.length; i++) {
		var lastCard = deckHolder.lastElementChild;
		stacks[i].appendChild(lastCard);
		
		for (var stackIndex = i; stackIndex > 0; stackIndex--) {
			var nextCardParent = getLastChild(stacks[i]);
			var nextCard = deckHolder.lastElementChild;
			nextCardParent.appendChild(nextCard);
		}

	}

}



function getLastChild(elem) {
	if (elem.lastElementChild) {
		return getLastChild(elem.lastElementChild);
	} else {
		return elem;
	}
}

function openCards() {
	var stacks = document.getElementsByClassName("stack");
	var suit;
	for (var i = 0; i < stacks.length; i++) {
		var lastStackCard = getLastChild(stacks[i]);
		var id = lastStackCard.getAttribute("id");
		if (id < 27) {
			lastStackCard.classList.add("red");
		} else {
			lastStackCard.classList.add("black");
		}
		lastStackCard.style.backgroundImage = "url(images/" + id + ".png)";
		makeDragable(lastStackCard);
	}
}

function makeDragable (elem) {
	elem.classList.add("dragable");
}

function getStacksCoords() {
	var stacks = document.getElementsByClassName("stack");
	var coords = [];
	var stack1 = document.getElementById("stack1");
	var stack2 = document.getElementById("stack2");
	var stack3 = document.getElementById("stack3");
	var stack4 = document.getElementById("stack4");
	for (var i =0; i < stacks.length; i++) {
		var stack = getCoords(stacks[i]);
		coords.push(stack);
	}

	return coords;
}

var stackCoords = getStacksCoords();


function getCoords(elem) { 
  var box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    bottom: box.bottom + pageYOffset,
    left: box.left + pageXOffset,
    right: box.right + pageXOffset
  };

}
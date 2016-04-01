var keyMap = {};

var Card = function() {
	this.opened = false;
	this.draggable = false;
	this.droppable = false;
	this.color;
	this.suit;
	this.value;
	this.id;
	this.element;

	this.open = function() {
		this.opened = true;
		this.draggable = true;
		this.droppable = true;
		View.open(this.element, this.suit, this.value);
	};
	this.close = function() {
		this.opened = false;
		this.draggable = false;
		this.droppable = false;
		View.close(this.element);
	};
	this.take = function (card) {
		this.child = card;
		this.droppable = false;
		card.parent = this;
		card.parentSlot = this.parentSlot;
		View.placeTheCard(this.element, card.element);
		console.log(this.child);
		console.log(card.parent);
	};
	this.give = function () {
		var child = this.child;
		this.child = null;
		return child;
	}
};

var suits = ["hearts", "diamonds", "spades", "clubs"];
var deck = [];

function createDeck() {
	suits.forEach(function (suit) {
		for (var value = 1; value <= 13; value++) {
			var card = new Card();
			card.value = value;
			card.suit = suit;
			card.id = card.value + card.suit;
			card.element = View.createCardElement(card.id);

			keyMap[card.id] = card;

			if (suit == "hearts" || suit == "diamonds") {
				card.color = "red";
			} else {
				card.color = "black";
			}
			deck.push(card);
		}
	});
}

var Slot = function (cards) {
	this.cards = cards || [];

	this.element;
	this.type = "slot";
	this.parent;

	this.take = function (card) {
		console.log("take");
		this.cards.push(card);
		card.parentSlot = this;
		console.log(card.parentSlot);
		View.placeTheCard(this.element, card.element);
	};
	this.give = function () {
		if (this.cards.length > 1) {
			return this.cards.pop();
		} else {
			var card = this.cards[0];
			this.cards = [];
			return card;
		}
		
	};
};

function createSlots(htmlSlots, type) {
	var slots = [];
	for (var i = 0; i < htmlSlots.length; i++) {
		var slot = new Slot();
		slot.number = i + 1;
		slot.element = htmlSlots[i];
		keyMap[slot.element.getAttribute('id')] = slot;
		slot.type = type;
		slots.push(slot);

		if (slot.type == "stack") {
			slot.lastCardOpen = function () {
				if (this.cards.length > 0) {
					this.cards[this.cards.length - 1].open();
				}
			};
		}
	}
	
	return slots;
}

var stackObjects = createSlots(View.stacks, "stack");
var finalSlots = createSlots(View.finalSlots, "final");

createDeck();

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

shuffle(deck);

var deckSlot = new Slot(deck);
deckSlot.element = View.deckHolder;

deckSlot.placeTheDeck = function () {
	this.cards.forEach(function (card) {
		View.placeTheCard(deckSlot.element, card.element);
	});
}

deckSlot.placeTheDeck();

var nextCardSlot = new Slot();
nextCardSlot.element = View.nextCardSlot;

function dealTheDeck (deck, stacks) {
	stacks.forEach(function (stack, index) {
		for (var i = 0; i < index + 1; i++) {
			var card = deck.give();
			stack.take(card);
			card.parentSlot = stack;
			if (i == index) {
				card.open();
			}
		}
	});
}

dealTheDeck(deckSlot, stackObjects);

function checkCompatibility (obj1, obj2) {
console.log(obj1);
console.log(obj2);

	if (obj1.parentSlot && ((obj1.parentSlot.type == "stack" 
			&& (obj1.value - obj2.value) == 1 
			&& obj1.color != obj2.color) 
		|| (obj1.parentSlot.type == "final" 
			&& (obj2.value - obj1.value == 1) 
			&& obj1.suit == obj2.suit))) {

		return true;
	} else if (obj1.type && obj1.type == "stack" && obj2.value == 13) {

		return true;
	} else if (obj1.type && obj1.type == "final" && obj2.value == 1) {

		return true;
	} else return false;
}

function dealNextcard () {
	if (deckSlot.cards.length > 0) {
		var card = deckSlot.give();
		nextCardSlot.take(card);
		card.open();
	} else {
		while (nextCardSlot.cards.length > 0) {
			var card = nextCardSlot.give();
			deckSlot.take(card);
			card.close();
		}
	}	
}

dragManager.onDragStart = function(dragObject) {
	console.log('onDragStart');
	var card = keyMap[dragObject.elem.getAttribute('id')];
	if (!card.draggable) {
		return false;
	}
	if (card.parent) {
		dragObject.cardObj = card.parent.give();
	} else {
		dragObject.cardObj = card.parentSlot.give();
	}
	
	
	return true;
};

dragManager.onDragCancel = function (dragObject) {
	console.log('onDragCancel');
	console.log(dragObject.cardObj);
	//console.log(dragObject.cardObj);
	if (dragObject.cardObj.parent) {
		dragObject.cardObj.parent.take(dragObject.cardObj);
	} else {
		console.log(dragObject.cardObj.parentSlot);
		dragObject.cardObj.parentSlot.take(dragObject.cardObj);
	}
	
};

dragManager.onDragEnd = function (dragObject) {
	console.log('onDragEnd');
	console.log(dragObject.dropElem);
	var target = keyMap[dragObject.dropElem.getAttribute('id')];
	console.log(target);
	if (target && checkCompatibility(target, dragObject.cardObj)) {

		if (dragObject.cardObj.parentSlot) {
			var dragObjParent = dragObject.cardObj.parentSlot;
		} else {
			var dragObjParent = dragObject.cardObj.parent;
		}
		
		console.log(dragObjParent);
      	target.take(dragObject.cardObj);
      	if (dragObjParent.type == "stack" && dragObjParent != target) {
      		dragObjParent.lastCardOpen();
      	}
	} else return false;

	return true;
};
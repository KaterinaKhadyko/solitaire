"use strict";
var Solitaire = new function () {
	var suits = ["hearts", "diamonds", "spades", "clubs"];
	var deck = [];
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
		};
		this.give = function () {
			var child = this.child;
			this.child = null;
			return child;
		}
	};

	var Slot = function (cards) {
		this.cards = cards || [];

		this.element;
		this.type = "slot";
		this.parent;

		this.take = function (card) {
			this.cards.push(card);
			card.parentSlot = this;
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

	function checkCompatibility (obj1, obj2) {
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

	this.dealNextcard = function () {
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

	function checkEndGame () {
		var result = true;
		stackSlots.forEach(function (stackSlot) {
			if (stackSlot.cards.length > 0) {
				console.log(stackSlot.cards.length);
				result = false;
			}
		});
		if (deckSlot.cards.length > 0) {
			result = false;
		}
		if (nextCardSlot.cards.length > 0) {
			result = false;
		}
		console.log(stackSlots, deckSlot, nextCardSlot);
		return result;
	}

	function endGame () {
		DragManager.removeEvents();
		View.showMessage();
	}

	DragManager.onDragStart = function(dragObject) {
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

	DragManager.onDragCancel = function (dragObject) {
		if (dragObject.cardObj.parent) {
			dragObject.cardObj.parent.take(dragObject.cardObj);
		} else {
			dragObject.cardObj.parentSlot.take(dragObject.cardObj);
		}
		
	};

	DragManager.onDragEnd = function (dragObject) {
		var target = keyMap[dragObject.dropElem.getAttribute('id')];
		if (target && checkCompatibility(target, dragObject.cardObj)) {
			if (dragObject.cardObj.parentSlot) {
				var dragObjParent = dragObject.cardObj.parentSlot;
			} else {
				var dragObjParent = dragObject.cardObj.parent;
			}
			
	      	target.take(dragObject.cardObj);

	      	if (dragObjParent.type == "stack" && dragObjParent != target) {
	      		dragObjParent.lastCardOpen();
	      	}
		} else return false;
		if (checkEndGame()) {
			endGame();
		}
		return true;
	};

	var stackSlots = createSlots(View.stacks, "stack");
	var finalSlots = createSlots(View.finalSlots, "final");

	createDeck();
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
	dealTheDeck(deckSlot, stackSlots);
};
"use strict";
var View = new function () {
	this.deckHolder = document.getElementById("deck");
	this.stacks = document.getElementsByClassName("stack");
	this.nextCardSlot = document.getElementById("new-card");
	this.finalSlots = document.getElementsByClassName("final");

	var button = document.getElementById("button");
	var message = document.getElementById("message");

	this.createCardElement = function(id) {
		var cardElement = document.createElement("div");
		cardElement.setAttribute("id", id);
		cardElement.classList.add("card");

		return cardElement;
	}

	this.placeTheCard = function(parentElement, childElement) {
		parentElement.appendChild(childElement);
	};

	this.open = function(element, suit, value) {
		element.style.backgroundImage = "url(images/" + suit + "/" + value + ".png)";
	};

	this.close = function(element) {
		element.style.backgroundImage = "url(images/back3.jpg)";
	};

	this.showMessage = function () {
		message.style.display = "block";
	}

	this.deckHolder.onclick = function() {
		Solitaire.dealNextcard();
	};

	button.onclick = function () {
		window.location.reload();
	}
};
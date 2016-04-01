var View = new function () {
	this.deckHolder = document.getElementById("deck");
	this.stacks = document.getElementsByClassName("stack");
	this.nextCardSlot = document.getElementById("new-card");
	this.finalSlots = document.getElementsByClassName("final");

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
	}

	this.close = function(element) {
		element.style.backgroundImage = "url(images/back.jpg)";
	}

	this.deckHolder.onclick = function() {
		dealNextcard();
	};

};
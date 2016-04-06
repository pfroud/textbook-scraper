"use strict";

var url = "http://ucsc.verbacompare.com/comparison?id=";

function add() {

	var opts = document.getElementById("course").getElementsByTagName("option");
	var numBooks = 0;

	var currentOpt;
	for(var i=1; i<opts.length; i++){
		currentOpt = opts[i];
		url += currentOpt.value + "__01%2C";
		numBooks++;
	}
	
	var dept = document.getElementById("department").getElementsByClassName("chosen-single")[0].children[0].innerHTML;
	
	console.info("Added " + numBooks + " from " + dept + ".");
}

function loadUrl() {
	window.location.href = url;
	return url;
}
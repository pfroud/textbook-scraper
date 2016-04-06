"use strict";

// http://stackoverflow.com/a/24026594
function triggerMouseEvent(node, eventType) {
    var clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent);
}
function simulateClick(targetNode) {
    triggerMouseEvent(targetNode, "mouseover");
    triggerMouseEvent(targetNode, "mousedown");
    triggerMouseEvent(targetNode, "mouseup");
    triggerMouseEvent(targetNode, "click");
}

simulateClick($("div#term span")[0]); // click on "Choose a Term..." to load options
simulateClick($("div#term li")[1]); // click on "SPRING 2016"

// now the department menu loads

window.setTimeout(chooseDept, 500);

function chooseDept() {

    simulateClick($("div#department span")[0]); // click on "Choose a Department..." to load options
    simulateClick($("div#department li")[3]); //click on "ANTH"
}


////////////////////////////////////////////////////////

function $() {
}

var url = "http://ucsc.verbacompare.com/comparison?id=";

function add() {

    var opts = document.getElementById("course").getElementsByTagName("option");
    var numBooks = 0;

    var currentOpt;
    for (var i = 1; i < opts.length; i++) {
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


"use strict";

// http://stackoverflow.com/a/24026594
function triggerMouseEvent(node, eventType) {
    var clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent);
}
// http://stackoverflow.com/a/24026594
function simulateClick(targetNode) {
    triggerMouseEvent(targetNode, "mouseover");
    triggerMouseEvent(targetNode, "mousedown");
    triggerMouseEvent(targetNode, "mouseup");
    triggerMouseEvent(targetNode, "click");
}

// TODO use an array
var url = "http://ucsc.verbacompare.com/comparison?id=";

simulateClick($("div#term span")[0]); // click on "Choose a Term..." to load options
simulateClick($("div#term li")[1]); // click on "SPRING 2016"

window.setTimeout(chooseDept, 500); // wait for department menu to load


function chooseDept() {
    simulateClick($("div#department span")[0]); // click on "Choose a Department..." to load options

    var allDepts = $$("div#department li").slice(1); //takes off "Choose a Department..."

    recur(allDepts);

}

var mutObs = new MutationObserver(addCoursesToUrl(allDepts));
var mutObsConfig = {characterData: true, subtree: true};
var mutObsTarget = $("div#course a.chosen-single span")[0];

function recur(allDepts) {

    if (allDepts.length == 0) {
        printUrl(url);
        return;
    }

    var currentDept = allDepts.shift();
    simulateClick(currentDept);
    // window.setTimeout(addCoursesToUrl, 3000, allDepts, url); //this timeout delay is arbitrary and shitty
    mutObs.observe(mutObsTarget, mutObsConfig);
}

function addCoursesToUrl(allDepts) {
    mutObs.disconnect();

    var opts = $("div#course option");
    var numBooks = 0;


    var currentOpt;
    for (var i = 1; i < opts.length; i++) {
        currentOpt = opts[i];
        url += currentOpt.value + "__01%2C";
        numBooks++;
    }

    var dept = document.getElementById("department").getElementsByClassName("chosen-single")[0].children[0].innerHTML;

    if (numBooks == 0) {
        console.warn("Added " + numBooks + " from " + dept + ".");
    } else {
        console.log("Added " + numBooks + " from " + dept + ".");
    }


    recur(allDepts);
}

function printUrl() {

    var split = splitUrl(url);
    var currentUrl;
    for (var i = 0; i < split.length; i++) {
        currentUrl = split[i];
        document.write("<p><a href=\"" + currentUrl + "\">thing</a></p>");
    }
}

// TODO make this not suck
function splitUrl() {
    var arr = url.split("=")[1].split("%2C");

    if (arr[arr.length - 1] == "") {
        arr = arr.slice(0, -1);
    }

    var totalBookCount = arr.length;
    const urlBase = "http://ucsc.verbacompare.com/comparison?id=";
    const maxBooksPerUrl = 350;

    var urlArray = [];

    var overallIndex = 0;
    var currentNumBooks, currentUrl;

    while (overallIndex < totalBookCount) {
        currentNumBooks = 0;
        currentUrl = urlBase;

        while (currentNumBooks < maxBooksPerUrl) {
            if (overallIndex >= totalBookCount) break;
            currentUrl += arr[overallIndex] + "%2C";

            currentNumBooks++;
            overallIndex++;
        }
        urlArray.push(currentUrl);

        console.info("added", currentNumBooks, "books to index", urlArray.length + ". Overall index is", overallIndex);
    }
    console.info("Done. overallIndex is", overallIndex, "and totalBookCount is", totalBookCount, ". Array length is", urlArray.length);

    return urlArray;
}

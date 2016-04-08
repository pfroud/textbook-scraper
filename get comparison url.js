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

var mutObs;
var mutObsConfig = {characterData: true, subtree: true};
var mutObsTarget = $("div#course a.chosen-single span")[0];

var courseIDs = [];

simulateClick($("div#term span")[0]); // click on "Choose a Term..." to load options
simulateClick($("div#term li")[1]); // click on "SPRING 2016"

// TODO use MutationObserver instead of timeout
window.setTimeout(chooseDept, 500); // wait for department menu to load


function chooseDept() {
    simulateClick($("div#department span")[0]); // click on "Choose a Department..." to load options
    var allDepts = $$("div#department li").slice(1); //takes off "Choose a Department..."
    recur(allDepts);
}


function recur(allDepts) {
    if (allDepts.length == 0) {
        printUrls();
        return;
    }

    var currentDept = allDepts.shift();
    simulateClick(currentDept);

    mutObs = new MutationObserver(function () {
        addCoursesToUrl(allDepts)
    });
    mutObs.observe(mutObsTarget, mutObsConfig);
}

function addCoursesToUrl(allDepts) {
    mutObs.disconnect();

    var opts = $("div#course option");
    var numBooks = 0;

    var currentOpt;
    for (var i = 1; i < opts.length; i++) {
        currentOpt = opts[i];
        // url += currentOpt.value + "__01%2C";
        courseIDs.push(currentOpt.value);
        numBooks++;
    }

    var dept = document.getElementById("department").getElementsByClassName("chosen-single")[0].children[0].innerHTML;

    if (numBooks == 0) {
        console.warn("Added " + numBooks + " from " + dept + ".");
    } else {
        // console.log("Added " + numBooks + " from " + dept + ".");
    }


    recur(allDepts);
}


function printUrls() {
    const maxBooksPerUrl = 350;

    document.write("<body style=\"font-family:sans-serif\">");

    var numLinks = Math.ceil(courseIDs.length / maxBooksPerUrl);


    var sliced, currentUrl;
    for (var i = 0; i < numLinks; i++) {

        sliced = courseIDs.slice(i * maxBooksPerUrl, i * maxBooksPerUrl + maxBooksPerUrl);

        currentUrl = "http://ucsc.verbacompare.com/comparison?id=";
        currentUrl += sliced.join("__01%2C");
        document.write("<p><a href=\"" + currentUrl + "\">link " + (i + 1) + " of " + numLinks + "</a></p>");
    }

    document.write("<div id=\"count\"></div>");
    updateCount(0, numLinks);

    watchStorageUpdate(numLinks);
}

function updateCount(num, total) {
    $("div#count")[0].innerHTML = "Found " + num + " of " + total + ".";
}

function watchStorageUpdate(numLinks) {
    // http://stackoverflow.com/a/2010994

    var numLinks = 2;

    Storage.prototype.setObject = function (key, value) {
        this.setItem(key, JSON.stringify(value));
    };
    Storage.prototype.getObject = function (key) {
        return JSON.parse(this.getItem(key));
    };

    window.addEventListener('storage', function (e) {
        var arrayOfCSVs = JSON.parse(e.newValue);
        var len = arrayOfCSVs.length;
        if (len == numLinks) {
            document.write("got all " + numLinks + " things!");

            document.body.innerHTML = "";
            document.write("<pre>\n\"Section\",\"Title\",\"Author\",\"ISBN\",\"Status\"\n");

            for (var i = 0; i < len; i++) {
                document.write(arrayOfCSVs[i]);
            }

            document.write("</pre>");
            localStorage.clear();
        } else {
            updateCount(len, numLinks);
        }
    });

}
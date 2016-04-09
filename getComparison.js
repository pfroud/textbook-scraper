/**
 * Gets every book on http://ucsc.verbacompare.com, prints links to open pages to compare them, and watches for results
 * to come in from those pages.
 */
"use strict";

// Verbacompare uses a bunch of listeners, so .click() doesn't work. Functions from http://stackoverflow.com/a/24026594
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

// stuff for MutationObservers
var mutObs_dept;
var mutObs_course;
var mutObs_course_target = $("div#course a.chosen-single span")[0];
var mutObsConfig         = {characterData: true, subtree: true};

var courseIDs = []; // example course ID is "SP16__AMS__011A__01"

simulateClick($("div#term span")[0]); // click on "Choose a Term..." to load terms
simulateClick($("div#term li")[1]); // click on "SPRING 2016"

//set up MutationObserver to call startGettingDepts() when triggered
mutObs_dept = new MutationObserver(function () { startGettingDepts();});

// Wait for spinner to finish by watching for "Select an Option" to change into "Choose a Department..."
// noinspection JSCheckFunctionSignatures - WebStorm shows incorrect warning about the config object
mutObs_dept.observe($("div#department a.chosen-single span")[0], mutObsConfig);


/**
 * Starts going through departments.
 */
function startGettingDepts() {
    mutObs_dept.disconnect();
    simulateClick($("div#department span")[0]); // need to click on "Choose a Department..." to populate the <ul>
    var allDepts = $$("div#department li").slice(1); //slice takes off "Choose a Department..."
    getNextDept(allDepts);
}


/**
 * Gets courses from the next department in allDepts.
 *
 * @param allDepts array of DOM Nodes of <li>s
 */
function getNextDept(allDepts) {
    if (allDepts.length == 0) {
        printLinks();
        return;
    }

    simulateClick(allDepts.shift());

    //set up MutationObserver to call addCoursesFromDept() when triggered
    mutObs_course = new MutationObserver(function () { addCoursesFromDept(allDepts) });

    // Wait for spinner to finish by watching for "Select an Option" to change into "Choose a Course..."
    // noinspection JSCheckFunctionSignatures - WebStorm shows incorrect warning about the config object
    mutObs_course.observe(mutObs_course_target, mutObsConfig);
}

/**
 * Adds courses from a department into CourseIDs.
 *
 * @param allDepts array of DOM Nodes of <li>s
 */
function addCoursesFromDept(allDepts) {
    mutObs_course.disconnect();

    // var options = $("div#eset option"); // need to wait for sections to load
    var options  = $("div#course option");
    var numBooks = 0;
    var currentOpt;

    for (var i = 1; i < options.length; i++) { //index starts at 1 to skip "Choose a Section..."
        currentOpt = options[i];
        courseIDs.push(currentOpt.value);
        numBooks++;
    }

    if (numBooks == 0) console.warn("Department " + currentOpt.innerHTML + " didn't work.");

    getNextDept(allDepts);
}

var numLinksTotal; // global so storageCallback() can be removed

/**
 * Prints links to open pages to compare the books.
 */
function printLinks() {
    const maxBooksPerUrl = 350;
    numLinksTotal        = Math.ceil(courseIDs.length / maxBooksPerUrl);

    document.write("<body style=\"font-family:sans-serif\">"); //make font not terrible

    var sliced, currentUrl, linkText;
    for (var i = 0; i < numLinksTotal; i++) {

        // takes non-overlapping slices of maxBooksPerUrl elements. (i+1)*maxBooksPerUrl doesn't work when i==0
        sliced = courseIDs.slice(i * maxBooksPerUrl, i * maxBooksPerUrl + maxBooksPerUrl);

        currentUrl = "http://ucsc.verbacompare.com/comparison?id=" + sliced.join();
        linkText   = "Link " + (i + 1) + " of " + numLinksTotal;
        document.write("<p><a href=\"" + currentUrl + "\">" + linkText + "</a></p>");
    }
    document.write("<div id=\"count\"></div>"); //content added by updateCount()
    updateCount(0, numLinksTotal);
    // watchStorageUpdate(numLinksTotal);

    window.addEventListener("storage", storageCallback);

}

/**
 * Updates the <div id="count"> to display "Found x of y."
 *
 * @param numLinksCurrent how many results we currently have
 */
function updateCount(numLinksCurrent) {
    $("div#count")[0].innerHTML = "Found " + numLinksCurrent + " of " + numLinksTotal + ".";
}

/**
 * If we have all the results, display the CSV; otherwise, update the count.
 *
 * @param event StorageEvent from the event listener
 */
function storageCallback(event) {
    // Need JSON.parse() because written by setObject(). See writeToStorage() in readComparison.js
    var arrayOfCSVs = JSON.parse(event.newValue);
    var len         = arrayOfCSVs.length;

    if (len == numLinksTotal) {
        document.body.innerHTML = ""; // can't set this to "<pre>" because browser automatically closes the tag
        document.write("<pre>");

        // CSV header and rows
        document.writeln(
            "\"Dept\",\"Course num\",\"Section num\",\"Prof\",\"Title\",\"Author\",\"ISBN\",\"Status\"");
        for (var i = 0; i < len; i++) document.write(arrayOfCSVs[i]);

        document.write("</pre>");
        window.removeEventListener("storage", storageCallback);
        localStorage.clear();

    } else {
        updateCount(len, numLinksTotal);
    }
}
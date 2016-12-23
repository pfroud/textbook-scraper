"use strict";


/**
 * Makes an array with every department, then starts mutual recursion between loadCourses() and addCourses().
 *
 * @param mutObs_dept the MutationObserver for the menu of departments.
 */
function startGettingDepts(mutObs_dept) {
    mutObs_dept.disconnect();

    // Need to click on "Choose a Department..." to populate the <ul> with <li>s of departments
    simulateClick($("div#department span")[0]);

    // Make an array with the name of every department. The slice takes off "Choose a Department..."
    var allDepts = Array.from($$("div#department li")).slice(1);

    loadCourses(allDepts);
}


/**
 * Loads courses in the next department in allDepts, then calls addCourses() to add the courses to
 *
 * @param allDepts array of DOM Nodes of <li>s
 */
function loadCourses(allDepts) {
    if (allDepts.length == 0) {
        printLinks();
        return;
    }

    simulateClick(allDepts.shift());

    //set up MutationObserver to call addCourses() when triggered
    var mutObs_course = new MutationObserver(function () { addCourses(mutObs_course, allDepts) });

    var mutObs_course_target = $("div#course a.chosen-single span")[0];
    var mutations = {characterData: true, subtree: true};

    // Wait for spinner to finish by watching for "Select an Option" to change into "Choose a Course..."
    // noinspection JSCheckFunctionSignatures - WebStorm shows incorrect warning about the config object
    mutObs_course.observe(mutObs_course_target, mutations);
}

/**
 * Adds courses from a department into CourseIDs.
 *
 * @param allDepts array of DOM Nodes of <li>s
 * @param mutObs_course the MutationObserver for the menu of departments.
 */
function addCourses(mutObs_course, allDepts) {
    mutObs_course.disconnect();

    // var options = $("div#eset option"); // need to wait for sections to load
    var options = $("div#course option");
    var numBooks = 0;
    var currentOpt;

    for (var i = 1; i < options.length; i++) { //index starts at 1 to skip "Choose a Section..."
        currentOpt = options[i];
        courseIDs.push(currentOpt.value);
        numBooks++;
    }

    if (numBooks == 0) console.warn("Department " + currentOpt.innerHTML + " didn't work.");

    loadCourses(allDepts);
}

var numLinksTotal; // global so storageCallback() can be removed

/**
 * Prints links to open pages to compare the books.
 */
function printLinks() {
    const maxBooksPerUrl = 350;
    numLinksTotal = Math.ceil(courseIDs.length / maxBooksPerUrl);

    document.write("<body style=\"font-family:sans-serif\">"); //make font not terrible

    var sliced, currentUrl, linkText;
    for (var i = 0; i < numLinksTotal; i++) {

        // takes non-overlapping slices of maxBooksPerUrl elements. (i+1)*maxBooksPerUrl doesn't work when i==0
        sliced = courseIDs.slice(i * maxBooksPerUrl, i * maxBooksPerUrl + maxBooksPerUrl);

        currentUrl = "http://ucsc.verbacompare.com/comparison?id=" + sliced.join();
        linkText = "Link " + (i + 1) + " of " + numLinksTotal;
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
    var len = arrayOfCSVs.length;

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

/**
 * Gets every book on http://ucsc.verbacompare.com, prints links to open pages to compare them, and watches for results
 * to come in from those pages.
 */
function main() {

    // Verbacompare uses several mouse event listeners, so JavaScript's click() function doesn't do anything.
    // Instead, we have to send our own mouseover, mousedown, and mouseup events. http://stackoverflow.com/a/24026594
    function triggerMouseEvent(node, eventType) {
        var event = document.createEvent('MouseEvents');
        event.initEvent(eventType, true, true);
        node.dispatchEvent(event);
    }

    function simulateClick(node) {
        triggerMouseEvent(node, "mouseover");
        triggerMouseEvent(node, "mousedown");
        triggerMouseEvent(node, "mouseup");
        triggerMouseEvent(node, "click");
    }

    // stuff for MutationObservers



    // example course ID is "SP16__AMS__011A__01"
    var courseIDs = [];

    simulateClick($("div#term span")[0]); // click on "Choose a Term..." to load terms
    simulateClick($("div#term li")[1]); // click on the current term


    // We need to wait for the menu of departments to load before doing anything else. Four steps:

    // 1. Make a MutationObserver which will call startGettingDepts() when it's triggered.
    var mutObs_dept = new MutationObserver(function () { startGettingDepts(mutObs_dept);} );

    // 2. Specify what kinds of mutations to look for.
    //    See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationObserverInit for deets
    var mutations = {characterData: true, subtree: true};

    // 3. Get a DOM element to watch for mutations.
    //    The element chosen here is the <span>Select an Option</span> in the second menu.
    var observeTarget = $("div#department a.chosen-single span")[0];

    // 4. Start the MutationObserver.
    //    When the menu of departments is done loading, mutObs_dept calls startGettingDepts().
    // noinspection JSCheckFunctionSignatures (WebStorm shows a bogus warning about the config object)
    mutObs_dept.observe(observeTarget, mutations);


}

main();
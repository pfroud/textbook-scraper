"use strict";
localStorage.clear();

var numCoursesTable = []; // not sure I will keep this

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

/**
 * Makes an array with every department, then starts mutual recursion between loadCoursesInNextDept() and addCourses().
 *
 * @param {MutationObserver} mutObs_dept - The MutationObserver that called this function.
 */
function startGettingDepts(mutObs_dept) {
    mutObs_dept.disconnect();

    // Need to click on "Choose a Department..." to populate the <ul> with <li>s of departments
    simulateClick($("div#department span")[0]);

    // Make an array with the name of every department. The slice() takes off "Choose a Department..."
    var depts = Array.from(document.querySelectorAll("div#department li")).slice(1);
    depts = depts.slice(0, 10);
    // For some reason $$(), which is supposed to be a shortcut for document.querySelectorAll(), doesn't always work
    // even though it's documented right fucking here
    // https://developers.google.com/web/tools/chrome-devtools/console/command-line-reference#selector_1

    // This array will be filled with course IDs. Example course ID is "SP16__AMS__011A__01"
    var courseIDs = [];

    loadCoursesInNextDept(depts, courseIDs);
}


/**
 * 1. Simulates a click on the next department in depts, then
 * 2. waits for the list of courses in that department to populate, then
 * 3. calls addCourses() to add the courses to a currently nonexistent variable called courseIDs.
 *
 * @param {Array} depts - Departments that haven't been processed yet. Each element is an <li> DOM node.
 * @param {Array} courseIDs - Course IDs that we've found so far. Each element is a string.
 */
function loadCoursesInNextDept(depts, courseIDs) {
    if (depts.length == 0) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Console/table
        // noinspection JSUnresolvedFunction
        console.table(numCoursesTable);
        printLinks(courseIDs);
        return;
    }

    var currentDept = depts.shift();
    simulateClick(currentDept); // shift() modifies array in-place

    // Wait for the webpage's list of courses to load, then call addCourses().
    // See main() for description of MutationObserver setup.
    var mutObs_course = new MutationObserver(function () {
        addCourses(mutObs_course, currentDept.innerHTML, depts, courseIDs)
    });
    var mutations = {characterData: true, subtree: true};
    var observeTarget = $("div#course a.chosen-single span")[0];
    //noinspection JSCheckFunctionSignatures (Webstorm gives bogus warning)
    mutObs_course.observe(observeTarget, mutations);
}

/**
 * Adds course IDs in a department to the CourseIDs array,
 * then calls loadCoursesInNextDept() to advance to the next department.
 *
 * @param {MutationObserver} mutObs_course - The MutationObserver that called this function.
 * @param {String} currentDept - something
 * @param {Array} depts - The array of departments. Only needed here to pass to next call of loadCoursesInNextDept().
 * @param {Array} courseIDs - Array of course IDs to add more courses to.
 */
function addCourses(mutObs_course, currentDept, depts, courseIDs) {
    mutObs_course.disconnect();

    // Gets all the options in the menu of courses.
    var tagsToAdd = $("div#course option");
    // Each element is an <option> tag DOM node, eg <option value="WT17__AMS__005">005</option>

    var numTags = tagsToAdd.length;

    // index starts at 1 not 0 to skip "Choose a Section..."
    for (var i = 1; i < numTags; i++) {
        courseIDs.push(tagsToAdd[i].value);
    }

    numCoursesTable.push({"Department": currentDept, "Number of courses": numTags});


    loadCoursesInNextDept(depts, courseIDs);
}

var numLinks; // needs to be global so storageCallback can see it

/**
 * Divides courseIDs into smaller subsets, then writes links to compare each subset,
 * then adds an eventListener
 *
 * @param {Array} courseIDs - the ID of every course (hopefully)
 */
function printLinks(courseIDs) {
    // Verbacompare can only compare ~350 books at a time

    courseIDs = courseIDs.slice(0, 20);

    // const maxBooksPerUrl = 350;
    const maxBooksPerUrl = 10;
    numLinks = Math.ceil(courseIDs.length / maxBooksPerUrl);

    document.write("<body style=\"font-family:sans-serif\">"); // make font tolerable

    var booksForThisHref, href, linkText;
    for (var i = 0; i < numLinks; i++) {

        // take non-overlapping slices of maxBooksPerUrl elements
        booksForThisHref = courseIDs.slice(i * maxBooksPerUrl, (i + 1) * maxBooksPerUrl);

        href = "http://ucsc.verbacompare.com/comparison?id=" + booksForThisHref.join();
        linkText = "Link " + (i + 1) + " of " + numLinks;
        document.write("<p><a href=\"" + href + "\">" + linkText + "</a></p>");
        // y'all got any of that string formatting ._.
    }

    document.write("<div id=\"count\"></div>"); // contents of the <div> are added by updateCount()
    updateCount(0, numLinks);

    window.addEventListener("storage", storageCallback);
    // window.addEventListener("storage", (thing=> storageCallback(0)));
}

/**
 * Updates the <div id="count"> to display "Found x of y."
 *
 * @param {number} numLinksCurrent - The number of links that have sent data back so far
 * @param {number} numLinksTotal - The total number of links
 */
function updateCount(numLinksCurrent, numLinksTotal) {
    $("div#count")[0].innerHTML = "Found " + numLinksCurrent + " of " + numLinksTotal + ".";
}

// noinspection JSValidateJSDoc (WebStorm doesn't know about StorageEvent)
/**
 * If we have all the results, display the CSV; otherwise, update the count.
 *
 * @param {StorageEvent} event - StorageEvent from the event listener
 */
function storageCallback(event) {
    //noinspection JSUnresolvedVariable (WebStorm doesn't know about storageEvent.newValue)
    var arrayOfCSVs = JSON.parse(event.newValue); // what is an array of CSVs??
    var len = arrayOfCSVs.length;

    updateCount(len, numLinks);

    if (len == numLinks) {
        document.body.innerHTML = "";
        document.write("<pre>");

        // CSV header
        var header = ["Dept", "Course num", "Section num", "Prof", "Title", "Author", "ISBN", "Status"];
        header = header.map(function (str) {return "\"" + str + "\""}); // wrap string in quotes
        document.writeln(header.join());

        // CSV rows
        // for (var i = 0; i < len; i++) document.write(arrayOfCSVs[i]);
        arrayOfCSVs.forEach(function (x) {document.write(x)}); // see what the hell x actually is

        window.removeEventListener("storage", storageCallback);
        localStorage.clear();
    }
}

/**
 * Gets every book on http://ucsc.verbacompare.com, prints links to open pages to compare them, and watches for results
 * to come in from those pages.
 */
function main() {
    simulateClick($("div#term span")[0]); // click on "Choose a Term..." to load terms
    simulateClick($("div#term li")[1]); // click on the current term

    // We need to wait for the menu of departments to load before doing anything else. Four steps:

    // 1. Make a MutationObserver which will call startGettingDepts() when triggered.
    var mutObs_dept = new MutationObserver(function () { startGettingDepts(mutObs_dept);});

    // 2. Specify what kinds of mutations to look for.
    //    See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationObserverInit for deets
    var mutations = {characterData: true, subtree: true};

    // 3. Get a DOM element to watch for mutations.
    //    The element chosen here is the <span>Select an Option</span> in the second menu.
    var observeTarget = $("div#department a.chosen-single span")[0];

    // 4. Start the MutationObserver.
    //    When the menu of departments is done loading, mutObs_dept calls startGettingDepts().
    //noinspection JSCheckFunctionSignatures (Webstorm gives bogus warning)
    mutObs_dept.observe(observeTarget, mutations);


}

main();
/**
 * Reads a page of comparisons and writes a CSV of the info to Storage.
 */
"use strict";

var csv = "";

/**
 * Reads information about every book on the page, then adds the info as a CSV to Storage.
 */
function readInfo() {
    var items = $$("div.item_details");
    var currentItem, infoTable, infoCells;

    for (var i = 0; i < items.length; i++) {
        currentItem = items[i];

        // class info - department, course number, section number, professor
        addCsvClassInfo(currentItem.querySelector("div.in_section span").innerHTML);

        infoTable = currentItem.querySelector("td.book_info"); // this table has everything else
        addCsvString(infoTable.querySelector("td.title").innerHTML.trim()); //title

        infoCells = infoTable.querySelectorAll("td.info"); // now these cells have everything else
        addCsvString(infoCells[0].innerHTML); //author
        addCsvString(infoCells[1].innerHTML); //ISBN
        addCsvString(infoCells[2].innerHTML); //status

        csv += "\n";
    }

    // selects <div class="section no_books"> - http://stackoverflow.com/a/6885027
    var noBooks = $$("div.section.no_books");

    var lenWith    = items.length;
    var lenWithout = noBooks.length;
    console.info(
        lenWith + " books with info, " + lenWithout + " books without info, " + (lenWith + lenWithout) + " total.");

    for (i = 0; i < noBooks.length; i++) {
        addCsvClassInfo(noBooks[i].querySelector("h3").innerHTML);
        csv += "\"No info.\",\"-\",\"-\",\"-\"\n";
    }

    writeToStorage(csv)
}


/**
 * Parses a string with all the class info and adds the class department, course number, section number, and professor
 * to the CSV.
 *
 * Example input strings:
 * "ANTH 102A (01 - RETI)"
 * "ANTH 100 (01)"
 *
 * @param classInfoString
 */
function addCsvClassInfo(classInfoString) {
    var split_classInfo, split_dept_courseNum, split_secNum_prof;

    split_classInfo = classInfoString.split("(");
    /* e.g. ["ANTH 102A ", "01 - RETI)"]
     * or   ["ANTH 100 " , "01)"       ] */

    split_dept_courseNum = split_classInfo[0].split(" ");
    /* e.g. ["ANTH", "102A", ""]
     * or   ["ANTH", "100", "" ] */
    addCsvString(split_dept_courseNum[0]); //department
    addCsvString(split_dept_courseNum[1]); //course number

    split_secNum_prof = split_classInfo[1].split(" - ");
    /* e.g. ["01", "RETI)"]
     * or   ["01)"        ] */
    addCsvString(split_secNum_prof[0].replace(/\)$/, "")); //section number

    if (split_secNum_prof.length > 1) {
        addCsvString(split_secNum_prof[1].replace(/\)$/, "")); //professor
    } else {
        addCsvString("-"); //professor
    }
}


/**
 * Adds a string, surrounded by quotation marks, to the CSV.
 *
 * @param string the string to add to the CSV.
 */
function addCsvString(string) {
    csv += "\"" + string + "\",";
}

/**
 * Adds the CSV to the array in LocalStorage.
 *
 * @param csvToAdd a string of the CSV to store.
 */
function writeToStorage(csvToAdd) {

    // These functions fake adding any object to Storage. http://stackoverflow.com/a/2010994
    Storage.prototype.setObject = function (key, value) {
        this.setItem(key, JSON.stringify(value));
    };
    Storage.prototype.getObject = function (key) {
        return JSON.parse(this.getItem(key));
    };


    var existingCsv = localStorage.getObject("csv");
    if (existingCsv == null) {
        localStorage.setObject("csv", [csvToAdd]);
        return;
    }
    var newCsv = existingCsv;
    newCsv.push(csvToAdd);
    localStorage.setObject("csv", newCsv);
}

readInfo();
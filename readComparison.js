"use strict";

/**
 * Reads information about every book on the page, then adds the info as comma-separated values to Storage.
 */
function main() {
    var books = $$("div.item_details"); // for some reason, $() works here
    var currentBook, infoTable, infoCells;
    var csv = "";

    for (var i = 0; i < books.length; i++) {
        currentBook = books[i];

        // class info - department, course number, section number, professor
        addCsvClassInfo(csv, currentBook.querySelector("div.in_section span").innerHTML);

        // this table has everything else
        infoTable = currentBook.querySelector("td.book_info");
        addCsvString(csv, infoTable.querySelector("td.title").innerHTML.trim()); // title

        // now these cells have everything else
        infoCells = infoTable.querySelectorAll("td.info");
        addCsvString(csv, infoCells[0].innerHTML); //author
        addCsvString(csv, infoCells[1].innerHTML); //ISBN
        addCsvString(csv, infoCells[2].innerHTML, true); //status

        csv += "\n";
    }

    // These books are listed on Verbacompare, but Verbacompare doesn't have any info about them.
    // selects <div class="section no_books"> - http://stackoverflow.com/a/6885027
    var noBooks = $$("div.section.no_books");

    for (i = 0; i < noBooks.length; i++) {
        addCsvClassInfo(csv, noBooks[i].querySelector("h3").innerHTML);
        csv += "\"No info.\",\"-\",\"-\",\"-\"\n";
    }

    var lenWith = books.length;
    var lenWithout = noBooks.length;
    console.info(
        lenWith + " books with info, " + lenWithout + " books without info, " + (lenWith + lenWithout) + " total.");

    writeToStorage(csv)
}


/**
 * Parses a string with all the class info and adds the class
 * department, course number, section number, and professor to the CSV.
 *
 * Example input strings:
 * "ANTH 102A (01 - RETI)"
 * "ANTH 100 (01)"
 *
 * @param {String} csv - The string of comma-separated values to add info to.
 * @param {String} classInfoString - The string to parse and add to the CSV.
 */
function addCsvClassInfo(csv, classInfoString) {
    var split_classInfo, split_dept_courseNum, split_secNum_prof;

    split_classInfo = classInfoString.split("(");
    /* e.g. ["ANTH 102A ", "01 - RETI)"]
     * or   ["ANTH 100 " , "01)"       ] */

    split_dept_courseNum = split_classInfo[0].split(" ");
    /* e.g. ["ANTH", "102A", ""]
     * or   ["ANTH", "100",  "" ] */
    addCsvString(csv, split_dept_courseNum[0]); //department
    addCsvString(csv, split_dept_courseNum[1]); //course number

    split_secNum_prof = split_classInfo[1].split(" - ");
    /* e.g. ["01", "RETI)"]
     * or   ["01)"        ] */
    addCsvString(csv, split_secNum_prof[0].replace(/\)$/, "")); //section number

    if (split_secNum_prof.length > 1) {
        addCsvString(csv, split_secNum_prof[1].replace(/\)$/, "")); //professor
    } else {
        addCsvString(csv, "-"); //professor
    }
}


/**
 * Adds a string, surrounded by quotation marks, to the CSV.
 *
 * @param {String} csv - The string of comma-separated values to add info to.
 * @param {String} string  - The string to add to the CSV.
 * @param {Boolean} [last] - Whether or not this entry is the last one in the row. Optional.
 */
function addCsvString(csv, string, last) {
    csv += "\"" + string + "\"";
    if (!last) csv += ",";
}

/**
 * Adds the CSV to the array in LocalStorage.
 *
 * @param {String} csv - The string of comma-separated values to add info to.
 */
function writeToStorage(csv) {

    // These let you add any object to Storage. http://stackoverflow.com/a/2010994
    Storage.prototype.setObject = function (key, value) {
        this.setItem(key, JSON.stringify(value));
    };
    Storage.prototype.getObject = function (key) {
        return JSON.parse(this.getItem(key));
    };

    var existingCsv = localStorage.getObject("csv");
    if (existingCsv == null) {
        localStorage.setObject("csv", [csv]);
        return;
    }
    var newCsv = existingCsv;
    newCsv.push(csv);
    localStorage.setObject("csv", newCsv);
}

main();
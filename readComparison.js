"use strict";

var csv = ""; //fuck it, make it global

/**
 * Reads information about every book on the page, then adds the info as comma-separated values to Storage.
 */
function main() {
    var books = $$("div.item_details"); // for some reason, $$() works here
    var infoTable, infoCells;

    books.forEach(function (book) {
        // class info - department, course number, section number, professor
        addCsvClassInfo(book.querySelector("div.in_section span").innerHTML);

        // this table has everything else
        infoTable = book.querySelector("td.book_info");
        addCsvBookTitle(infoTable.querySelector("td.title").innerHTML.trim());

        // now these cells have everything else
        infoCells = infoTable.querySelectorAll("td.info");
        addCsvString(infoCells[0].innerHTML); //author
        addCsvString(infoCells[1].innerHTML); //ISBN
        addCsvString(infoCells[2].innerHTML, true); //status

        csv += "\n";
    });

    // These books are listed on Verbacompare, but Verbacompare doesn't have any info about them.
    // selects <div class="section no_books"> - http://stackoverflow.com/a/6885027
    var noBooks = $$("div.section.no_books");

    noBooks.forEach(function (book) {
        addCsvClassInfo(book.querySelector("h3").innerHTML);
        csv += "\"null\", \"null\", \"null\", \"null\", \"null\", \"null\"\n";
    });

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
 * @param {String} classInfoString - The string to parse and add to the CSV.
 */
function addCsvClassInfo(classInfoString) {
    var split_classInfo, split_dept_courseNum, split_secNum_prof;

    split_classInfo = classInfoString.split("(");
    /* e.g. ["ANTH 102A ", "01 - RETI)"]
     * or   ["ANTH 100 " , "01)"       ] */

    split_dept_courseNum = split_classInfo[0].split(" ");
    /* e.g. ["ANTH", "102A", ""]
     * or   ["ANTH", "100",  "" ] */
    addCsvString(split_dept_courseNum[0]); //department
    addCsvString(split_dept_courseNum[1]); //course number

    split_secNum_prof = split_classInfo[1].split(" - ");
    /* e.g. ["01", "RETI)"]
     * or   ["01)"        ] */
    addCsvString(split_secNum_prof[0].replace(/\)$/, "")); //section number

    if (split_secNum_prof.length > 1) {
        addCsvString(split_secNum_prof[1].replace(/\)$/, "")); //professor
    } else {
        addCsvString("null"); //professor
    }
}

/**
 *
 * @param {String} title
 */
function addCsvBookTitle(title){
    var split = title.split(/Ed:|Yr:/);
    addCsvString(split[0].trim()); // the actual book title
    addCsvString(split[1].toLowerCase().split(" ").join("")); // edition. No built-in way to replace all substrings.
    addCsvString(split[2]); // year

}

/**
 * Adds a string, surrounded by quotation marks, to the CSV.
 *
 * @param {String} string  - The string to add to the CSV.
 * @param {Boolean} [last] - Whether or not this entry is the last one in the row. Optional.
 */
function addCsvString(string, last) {
    csv += "\"" + string + "\"";
    if (!last) csv += ", ";
}

/**
 * Adds the CSV string to the array in LocalStorage.
 */
function writeToStorage() {

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
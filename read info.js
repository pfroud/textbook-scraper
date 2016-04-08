"use strict";

var csv = "";

function readInfo() {
    var items = $$("div.item_details");

    var basics, split_classInfo, split_dept_courseNum, split_secNum_prof;
    var currentItem, infoTable, infoCells;
    var numBooks = 0;

    for (var i = 0; i < items.length; i++) {
        currentItem = items[i];
        numBooks++;

        // CLASS INFO - DEPARTMENT, COURSE NUMBER, SECTION NUMBER, PROFESSOR
        basics = currentItem.querySelector("div.in_section span").innerHTML;
        /* e.g. "ANTH 102A (01 - RETI)"
         * or   "ANTH 100 (01)"      */

        split_classInfo = basics.split("(");
        /* e.g. ["ANTH 102A ", "01 - RETI)"]
         * or   ["ANTH 100 " , "01)"       ] */

        split_dept_courseNum = split_classInfo[0].split(" ");
        /* e.g. ["ANTH", "102A", ""]
         * or   ["ANTH", "100", "" ] */
        addCsv(split_dept_courseNum[0]); //department
        addCsv(split_dept_courseNum[1]); //course number

        split_secNum_prof = split_classInfo[1].split(" - ");
        /* e.g. ["01", "RETI)"]
         * or   ["01)"        ] */
        addCsv(split_secNum_prof[0].replace(/\)$/, "")); //section number
        addCsv(split_secNum_prof[1].replace(/\)$/, "")); //professor


        infoTable = currentItem.querySelector("td.book_info");

        //TITLE
        addCsv(infoTable.querySelector("td.title").innerHTML.trim());

        infoCells = infoTable.querySelectorAll("td.info");

        //AUTHOR
        addCsv(infoCells[0].innerHTML);

        //ISBN
        addCsv(infoCells[1].innerHTML);

        //STATUS
        addCsv(infoCells[2].innerHTML);
        csv += "\n";
    }

    // the class is "section no_books" - http://stackoverflow.com/a/6885027
    var noBooks = document.querySelectorAll("div.section.no_books");

    var lenWith = items.length;
    var lenWithout = noBooks.length;
    console.info(lenWith + " books with info, " + lenWithout + " books without info, " + (lenWith + lenWithout) + " total.");

    for (i = 0; i < noBooks.length; i++) {
        currentItem = noBooks[i];
        csv += "\"" + currentItem.querySelector("h3").innerHTML + "\",\"No info.\",\"-\",\"-\",\"-\"\n";
    }

    writeToStorage(csv)
}

function addCsv(string) {
    csv += "\"" + string + "\",";
}

function writeToStorage(csvToAdd) {

    // http://stackoverflow.com/a/2010994
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
"use strict";

function readInfo() {
    var items = $$("div.item_details");

    var currentItem, infoTable, infoCells;
    var numBooks = 0;
    // var csv = "Section,Title,Author,ISBN,Status\n";
    var csv = "";

    for (var i = 0; i < items.length; i++) {
        currentItem = items[i];
        numBooks++;

        //SECTION
        csv += "\"" + currentItem.querySelector("div.in_section span").innerHTML + "\",";


        infoTable = currentItem.querySelector("td.book_info");

        //TITLE
        csv += "\"" + infoTable.querySelector("td.title").innerHTML.trim() + "\",";

        infoCells = infoTable.querySelectorAll("td.info");

        //AUTHOR
        csv += "\"" + infoCells[0].innerHTML + "\",";

        //ISBN
        csv += "\"" + infoCells[1].innerHTML + "\",";

        //STATUS
        csv += "\"" + infoCells[2].innerHTML + "\"\n";
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

function writeToStorage(csvToAdd){

    // http://stackoverflow.com/a/2010994
    Storage.prototype.setObject = function (key, value) {
        this.setItem(key, JSON.stringify(value));
    };
    Storage.prototype.getObject = function (key) {
        return JSON.parse(this.getItem(key));
    };


    var existingCsv = localStorage.getObject("csv");
    if (existingCsv == null){
        localStorage.setObject("csv", [csvToAdd]);
        return;
    }
    var newCsv = existingCsv;
    newCsv.push(csvToAdd);
    localStorage.setObject("csv", newCsv);

}

readInfo();
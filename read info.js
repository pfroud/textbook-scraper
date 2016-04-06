"use strict";

function readInfo() {
	var items = document.getElementsByClassName("item_details");
	
	

	var currentItem, infoTable, infoCells;
	var numBooks = 0;
	var csv = "Section,Title,Author,ISBN,Status\n";
	var infoTable;

	for(var i=0; i<items.length; i++){
		currentItem = items[i];
		numBooks++;
		
		//SECTION
		csv += "\"" + currentItem.getElementsByClassName("in_section")[0].getElementsByTagName("span")[0].innerHTML + "\",";
		
		
		infoTable = currentItem.getElementsByClassName("book_info")[0];
		
		
		//TITLE
		csv += "\"" + infoTable.getElementsByClassName("title")[0].innerHTML.trim() + "\",";
		
		infoCells = infoTable.getElementsByClassName("info");
		
		//AUTHOR
		csv += "\"" + infoCells[0].innerHTML + "\",";
		
		//ISBN
		csv += "\"" + infoCells[1].innerHTML + "\",";
		
		//STATUS
		csv += "\"" + infoCells[2].innerHTML + "\"\n";
	}
	
	
	

	var noBooks = document.getElementsByClassName("section no_books");
	
	var lenWith = items.length;
	var lenWithout = noBooks.length;
	console.info(lenWith + " books with info, " + lenWithout +  + " books without info, " + (lenWith+lenWithout) + " total.");
	

	for(var i=0; i<noBooks.length; i++){
		currentItem = noBooks[i];
		
		csv += "\"" + currentItem.getElementsByTagName("h3")[0].innerHTML + "\",\"No info.\",\"-\",\"-\",\"-\"\n";
		
		
	}
	
	
	return csv;
}
# UCSC bookstore textbook scraper

Makes a CSV file of every book for every UCSC class, using the [Bay Tree Bookstore's](http://slugstore.ucsc.edu) online
textbook lookup at http://ucsc.verbacompare.com.

There are 967 books in the [sample output](sample-output.csv), 759 of which have information listed. Two columns to
the right aren't shown in the default view on the GitHub viewer, but you can scroll horizontally.

## How to use

1. Navigate to http://ucsc.verbacompare.com.
1. Open your browser's javascript console. (F12 or ctrl-shift-C)
1. Paste the entire [`getComparison.js`](https://raw.githubusercontent.com/pfroud/textbook-scraper/master/getComparison.js) file into the console and run it.
1. When it's finished, leave the page open. Open all of links it lists. Each will take a while to load.
1. In each new page, paste the entire [`readComparison.js`](https://raw.githubusercontent.com/pfroud/textbook-scraper/master/readComparison.js) file into the console and run it.
1. After each time, you can check the results page to see if it has seen the new result.
1. Once you've run `readComparison` on each page, return to the results page. It should now have a CSV file.
1. Save / paste into a spreadsheet program.

## Known bugs & future work
* Potentially a bug - only looks for section 01, which is the only option for almost every class.
* Add feature - split book title into name, edition and year
* Refactor - send GET requests to deal with the dropdown menus, instead of simulating a click on the menu.
    * example of department: [/compare/courses/?id=WT17__AMS&term_id=21818](http://ucsc.verbacompare.com/compare/courses/?id=WT17__AMS&term_id=21818)
    * example of course: [/compare/sections/?id=WT17__AMS__005&term_id=21818](http://ucsc.verbacompare.com/compare/sections/?id=WT17__AMS__005&term_id=21818)

# UCSC bookstore textbook scraper

Makes a CSV file of every book for every UCSC class, using the [Bay Tree Bookstore's](http://slugstore.ucsc.edu) online
textbook lookup at http://ucsc.verbacompare.com.

There are 967 books in the [sample output](sample-output.csv), 759 of which have information listed. Two columns to
the right aren't shown in the default view on the GitHub viewer, but you can scroll horizontally.

## How to use

1. Navigate to http://ucsc.verbacompare.com.
1. Paste the entire [`getComparison.js`](https://raw.githubusercontent.com/pfroud/textbook-scraper/master/getComparison.js) file into the console and run it.
1. When it's finished, leave the page open. Open all of links it lists, each of which will take a while to load.
1. In each new page, paste the entire [`readComparison.js`](https://raw.githubusercontent.com/pfroud/textbook-scraper/master/readComparison.js) file into the console and run it.
1. After each time, you can check the results page to see if it has seen the new result.
1. Once you've run `readComparison` on each page, return to the results page. It should now have a CSV file.
1. Save / paste into a spreadsheet program.

## Known bugs & future work
* Only looks for section 01, which is the only option for almost every class.

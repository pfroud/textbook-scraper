# textbook-scraper
Scrapes every book from http://ucsc.verbacompare.com to a CSV file.

## How to use

1. Navigate to http://ucsc.verbacompare.com.
1. Paste the entire [`getComparison.js`](https://raw.githubusercontent.com/pfroud/textbook-scraper/master/getComparison.js) file into the console and run it.
1. When it's finished, leave the page open. Open all of links it lists, each of which will take a while to load.
1. In each new page, paste the entire [`readComparison.js`](https://raw.githubusercontent.com/pfroud/textbook-scraper/master/readComparison.js) file into the console and run it.
1. After each time, you can check the results page to see if it has seen the new result.
1. Once you've run `readComparison` on each page, return to the results page. It should now have a CSV file.
1. Save / paste into a spreadsheet program.

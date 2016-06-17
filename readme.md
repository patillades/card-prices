# Card prices

Get a user's card list on magic card market and compare its prices against the market's trends.

To do so, replace "{USER_ID}" for the desired user's id on lib/openProductsPage.js, 
and launch the script with the following command:

`phantomjs --load-images=false app.js`

When all cards have been read, the data will be stored on a json file on the "data" folder. 
To reanalyse the latest results, launch the script adding the `--analyse=true` argument.

Use phantomjs >= 2.1.1.

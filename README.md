Models - How the data will be structured before passing into database
Utils - Utilities for each function 

Function Flow Example (Top to bottom)
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
index.html calls function from inline html example: onclick("function()")

public/js file runs the logic (api call, logic for functionality (check case, error handling, etc.))

util files utilises the models example jonathanUtils uses user.js model to format the way the data will be passed to the database. Basically the main bridge between database and backend js.
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>




call uglifyjs app\insite.april.js -m -o dist\insite.april.min.js --source-map dist\insite.april.min.js.map
call uglifyjs app\insite.monday.js -m -o dist\insite.monday.min.js --source-map dist\insite.monday.min.js.map

copy app\*.html dist\*.html
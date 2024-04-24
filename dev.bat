@echo off

start cmd /k http-server -c-1 -p5345

start cmd /k code .

start http://localhost:5345

exit
@echo off
set OLDPATH="%CD%"
pushd .
cd /d %~dp0
set hidemacrodir=TestResult
node hs-test.js %*
cd /d %OLDPATH%

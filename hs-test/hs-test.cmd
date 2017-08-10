pushd .
cd /d %~dp0
set hidemacrodir=TestResult
node hs-test.js %*
popd

@echo off
title NERAMAC Agarwood Supply Chain Traceability System (ASCTS)
echo =================================================================
echo  Starting NERAMAC ASCTS Executive Traceability Portal...
echo =================================================================
echo.
echo Application will be available at: http://localhost:5000
echo Press Ctrl+C at any time to stop the server.
echo.
node server/index.js
pause

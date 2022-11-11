:: Do not run this script directly. Use `npm run create-docs-windows`
IF exist docs ( rmdir /S /Q docs )
jsdoc . -r -d docs --configure jsdoc.json && dwindle-js --dir docs --ignored-js-contains line && echo minrand.truewinter.dev > docs\\CNAME
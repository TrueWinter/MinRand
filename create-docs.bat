:: Do not run this script directly. Use `npm run create-docs-windows`
IF exist docs ( rmdir /S /Q docs )
npx jsdoc . -r -d docs --configure jsdoc.json
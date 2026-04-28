const xlsx = require('xlsx');
const workbook = xlsx.readFile('KANDANG 2.xlsx');
console.log("Sheet names:", workbook.SheetNames);
if (workbook.SheetNames.length > 1) {
    const sheet2 = workbook.Sheets[workbook.SheetNames[1]];
    const data2 = xlsx.utils.sheet_to_json(sheet2);
    console.log("Sheet 2 data snippet:");
    console.log(JSON.stringify(data2.slice(0, 10), null, 2));
}

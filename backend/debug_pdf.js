const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pdfPath = path.join(__dirname, '../university result.pdf');

if (!fs.existsSync(pdfPath)) {
    console.error('File not found:', pdfPath);
    process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function (data) {
    console.log('--- PDF TEXT START ---');
    console.log(data.text);
    console.log('--- PDF TEXT END ---');
}).catch(err => {
    console.error(err);
});

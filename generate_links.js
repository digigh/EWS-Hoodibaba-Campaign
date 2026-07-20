const fs = require('fs');

const data = fs.readFileSync('./public/data/hoodibaba_ews_tsm.csv', 'utf8');
const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

const baseUrl = 'https://ews-hoodibaba-campaign.vercel.app/';

let output = 'TSM,Link\n';
for (let i = 1; i < lines.length; i++) {
  const tsm = lines[i];
  // Replicating ?tsm=Anal-Das style as hinted in code
  const param = tsm.replace(/\s+/g, '-');
  output += `${tsm},${baseUrl}?tsm=${encodeURIComponent(param)}\n`;
}

fs.writeFileSync('./tm_links.csv', output);
console.log('tm_links.csv has been generated!');

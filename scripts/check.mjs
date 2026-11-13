import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'out');
const errors=[];
const walk=folder=>fs.readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(folder,e.name)):[path.join(folder,e.name)]);
for(const file of walk(out)){
 if(/\.js$/.test(file)){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status)errors.push(r.stderr);}
 if(file.endsWith('.html')){const html=fs.readFileSync(file,'utf8');if(!html.includes('lang="en"'))errors.push(`${file}: missing English language`);if(/<title>[^<]*(?:HOYO|Hoyo|Jerez|Weeknd|Weekend)/.test(html))errors.push(`${file}: original title remains`);if(/maximum-scale=1|user-scalable=no/.test(html))errors.push(`${file}: zoom is disabled`);}
}
for(const file of ['eventos.json','galeria.json']){const data=JSON.parse(fs.readFileSync(path.join(out,'api',file),'utf8'));if(JSON.stringify(data).includes('hoyojerez')||JSON.stringify(data).includes('fourvenues.com'))errors.push(`${file}: original data remains`);}
if(errors.length)throw Error(errors.join('\n'));
console.log('JavaScript syntax, English route metadata, zoom accessibility, and local content checks passed.');

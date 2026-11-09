import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const source=path.join(root,'source'),target=path.join(root,'out');
fs.mkdirSync(target,{recursive:true});
const visited=new Set(),missing=new Set(),files=[];
function copy(relative,destination=relative){
 relative=relative.replaceAll('\\','/').split('?')[0].split('#')[0].replace(/^\//,'');
 if(!relative||relative==='api/cartel'||visited.has(relative))return;visited.add(relative);
 const sourceFile=path.resolve(source,relative);
 if(!sourceFile.startsWith(source+path.sep)||!fs.existsSync(sourceFile)||!fs.statSync(sourceFile).isFile()){missing.add(relative);return;}
 const dest=path.join(target,destination);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(sourceFile,dest);files.push({path:destination,bytes:fs.statSync(sourceFile).size});
 if(!/\.(?:html|js|mjs|css|json|webmanifest)$/.test(relative)&&path.extname(relative))return;
 const text=fs.readFileSync(sourceFile,'utf8');
 for(const match of text.matchAll(/["'`](\/(?:_astro|assets|api|draco)\/[^"'`?#\s<>)]+)/g))copy(match[1]);
 for(const match of text.matchAll(/(?:from\s*|import\s*\(?)(["'`])(\.[^"'`]+)\1/g))copy(path.posix.normalize(path.posix.join(path.posix.dirname(relative),match[2])));
 for(const match of text.matchAll(/url\(["']?([^"')]+)["']?\)/g)){const ref=match[1];if(ref.startsWith('data:')||ref.startsWith('http'))continue;copy(ref.startsWith('/')?ref:path.posix.join(path.posix.dirname(relative),ref));}
}
copy('index.html');
for(const route of ['galeria','eventos','contacto','aviso-legal','cookies','privacidad'])copy(route,`${route}/index.html`);
const routeSource=path.join(root,'source-routes');
if(fs.existsSync(routeSource)){
 const walk=folder=>fs.readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(folder,e.name)):[path.join(folder,e.name)]);
 for(const file of walk(routeSource)){
  const relative=path.relative(routeSource,file);const dest=path.join(target,relative);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest);files.push({path:relative.replaceAll('\\','/'),bytes:fs.statSync(file).size});
  const text=fs.readFileSync(file,'utf8');for(const m of text.matchAll(/["'`](\/(?:_astro|assets|api|draco)\/[^"'`?#\s<>)]+)/g))copy(m[1]);
 }
}
for(const file of ['favicon.svg','favicon.ico','apple-touch-icon.png','site.webmanifest','og.jpg','robots.txt','sitemap.xml','discover.html','experience-accessibility.js','experience-accessibility.css'])if(fs.existsSync(path.join(source,file)))copy(file);
for(const file of fs.readdirSync(path.join(source,'draco')))copy('draco/'+file);
if(missing.size)throw Error('Missing local assets:\n'+[...missing].join('\n'));
fs.writeFileSync(path.join(root,'.openai/build-report.json'),JSON.stringify({files:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0),assets:files},null,2));
console.log(`Built ${files.length} files (${(files.reduce((n,f)=>n+f.bytes,0)/1048576).toFixed(2)} MiB). All internal routes have HTML entry points.`);
await import('./prepare-hosting.mjs');

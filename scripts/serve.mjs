import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../out');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.wasm':'application/wasm','.otf':'font/otf','.ttf':'font/ttf','.woff2':'font/woff2','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.ico':'image/x-icon','.mp4':'video/mp4','.mp3':'audio/mpeg','.m4a':'audio/mp4','.webmanifest':'application/manifest+json'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404).end('Not found');return;}
 const stat=fs.statSync(file),headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
 const range=/bytes=(\d+)-(\d*)/.exec(req.headers.range||'');
 if(range){const start=+range[1],end=range[2]?Math.min(+range[2],stat.size-1):stat.size-1;if(start>=stat.size){res.writeHead(416).end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);return;}
 res.writeHead(200,{...headers,'Content-Length':stat.size});if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file).pipe(res);
}).listen(4175,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4175'));

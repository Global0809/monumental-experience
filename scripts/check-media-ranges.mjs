import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import worker from '../dist/server/index.js';

const client = path.resolve(import.meta.dirname, '../dist/client');
const mediaPath = '/assets/media/crt-0.mobile.mp4';
const actual = fs.readFileSync(path.join(client, '__range_assets', mediaPath));
const env = {ASSETS: {async fetch(request) {
  const pathname = new URL(request.url).pathname;
  const file = path.join(client, pathname);
  if (!file.startsWith(client + path.sep) || !fs.existsSync(file)) return new Response('Missing', {status:404});
  const bytes = fs.readFileSync(file);
  return new Response(request.method === 'HEAD' ? null : bytes, {headers: {
    'Content-Type': file.endsWith('.mp4') ? 'video/mp4' : 'text/html',
    ...(request.method === 'HEAD' ? {} : {'Content-Length': String(bytes.length)}), 'ETag':'"native-asset"',
    'Last-Modified':'Thu, 01 Jan 2026 00:00:00 GMT',
  }});
}}};
const get = (range, extra={}, method='GET', pathname=mediaPath) => worker.fetch(new Request('https://example.com'+pathname,{method,headers:{...(range?{Range:range}:{}),...extra}}),env);
for(const [range,start,end] of [['bytes=0-31',0,31],['bytes=24-',24,actual.length-1],['bytes=-20',actual.length-20,actual.length-1],['bytes=0-99999999',0,actual.length-1]]){
  const r=await get(range); assert.equal(r.status,206); assert.equal(r.headers.get('Content-Range'),`bytes ${start}-${end}/${actual.length}`); assert.equal(r.headers.get('Content-Length'),String(end-start+1)); assert.deepEqual(Buffer.from(await r.arrayBuffer()),actual.subarray(start,end+1));
}
for(const range of ['bytes=','bytes=-0','bytes=20-1',`bytes=${actual.length}-`]){
  const r=await get(range);assert.equal(r.status,416);assert.equal(r.headers.get('Content-Range'),`bytes */${actual.length}`);assert.equal((await r.arrayBuffer()).byteLength,0);
}
for(const range of [undefined,'items=0-1','bytes=0-1,8-9'])assert.equal((await get(range)).status,200);
const first=await get('bytes=0-1');const strong=first.headers.get('ETag');assert.match(strong,/^"sha256-/);
assert.equal((await get('bytes=0-1',{'If-Range':strong})).status,206);
assert.equal((await get('bytes=0-1',{'If-Range':'"old-content"'})).status,200);
assert.equal((await get('bytes=0-1',{'If-Range':'W/'+strong})).status,200);
assert.equal((await get('bytes=0-1',{'If-Range':'Fri, 02 Jan 2026 00:00:00 GMT'})).status,206);
const head=await get('bytes=0-1',{},'HEAD');assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);assert.equal(head.headers.get('Content-Length'),String(actual.length));
assert.equal((await get(undefined,{},'GET','/index.html')).status,200);
assert.equal((await get(undefined,{},'GET','/assets/media/missing.mp4')).status,404);
console.log('Media byte ranges, validators, HEAD, missing files, and ordinary assets passed.');

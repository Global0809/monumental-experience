import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const artifact = path.join(root, 'dist');
const marker = path.join(artifact, '.weeknd-generated');
if (artifact !== path.resolve(root, 'dist') || !artifact.startsWith(root + path.sep)) throw Error('Unsafe output path');
if (fs.existsSync(artifact)) {
  if (!fs.existsSync(marker)) throw Error('Refusing to overwrite a non-generated dist directory');
  fs.rmSync(artifact, {recursive: true, force: true});
}
const client = path.join(artifact, 'client');
fs.cpSync(path.join(root, 'out'), client, {recursive: true});
fs.writeFileSync(marker, 'Generated hosting artifact. Edit source/ and worker/.\n');
const media = {};
for (const directory of ['assets/media', 'assets/audio']) {
  const folder = path.join(client, directory);
  if (!fs.existsSync(folder)) continue;
  for (const name of fs.readdirSync(folder)) {
    if (!/\.(mp4|mp3|m4a|wav|ogg)$/i.test(name)) continue;
    const original = path.join(folder, name);
    const destination = path.join(client, '__range_assets', directory, name);
    if (!original.startsWith(client + path.sep) || !destination.startsWith(client + path.sep)) throw Error('Unsafe media output path');
    const bytes = fs.readFileSync(original);
    media['/' + directory + '/' + name] = {size: bytes.length, etag: '"sha256-' + crypto.createHash('sha256').update(bytes).digest('hex') + '"'};
    fs.mkdirSync(path.dirname(destination), {recursive: true});
    fs.renameSync(original, destination);
  }
}
fs.mkdirSync(path.join(artifact, 'server'), {recursive: true});
fs.mkdirSync(path.join(artifact, '.openai'), {recursive: true});
const worker = fs.readFileSync(path.join(root, 'worker/index.js'), 'utf8');
fs.writeFileSync(path.join(artifact, 'server/index.js'), worker.replace('/* media-metadata */ {}', JSON.stringify(media)));
fs.copyFileSync(path.join(root, '.openai/hosting.json'), path.join(artifact, '.openai/hosting.json'));
console.log(`Prepared range-aware hosting for ${Object.keys(media).length} media files.`);

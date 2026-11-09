// Generated hosting output injects strong content hashes for the local media.
const MEDIA = /* media-metadata */ {};

function fullResponse(response, request, metadata) {
  const headers = new Headers(response.headers);
  headers.set('Accept-Ranges', 'bytes');
  if (metadata) headers.set('ETag', metadata.etag);
  return new Response(request.method === 'HEAD' ? null : response.body, {
    status: response.status, statusText: response.statusText, headers,
  });
}

function validatorMatches(value, headers, metadata) {
  if (!value) return true;
  const etag = metadata?.etag ?? headers.get('ETag');
  if (value.startsWith('"') || value.startsWith('W/')) {
    return !value.startsWith('W/') && value === etag;
  }
  const requestedDate = Date.parse(value);
  const modifiedDate = Date.parse(headers.get('Last-Modified') ?? '');
  return Number.isFinite(requestedDate) && Number.isFinite(modifiedDate) && modifiedDate <= requestedDate;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isMedia = /^\/assets\/(?:media|audio)\/.+\.(?:mp4|mp3|m4a|wav|ogg)$/i.test(url.pathname);
    if (!isMedia || !['GET', 'HEAD'].includes(request.method)) return env.ASSETS.fetch(request);

    // The deployed binaries live at an internal asset path. Their original URLs
    // therefore reach this Worker while all ordinary assets keep the fast path.
    const assetUrl = new URL(url);
    assetUrl.pathname = '/__range_assets' + url.pathname;
    const headers = new Headers(request.headers);
    headers.delete('Range');
    headers.delete('If-Range');
    headers.delete('If-None-Match');
    headers.delete('If-Modified-Since');
    headers.set('Accept-Encoding', 'identity');
    const asset = await env.ASSETS.fetch(new Request(assetUrl, {method: request.method, headers}));
    if (asset.status !== 200) return asset;
    const metadata = MEDIA[url.pathname];
    const range = request.headers.get('Range');
    if (request.method === 'HEAD' || !range || !range.startsWith('bytes=') || range.includes(',') ||
        !validatorMatches(request.headers.get('If-Range'), asset.headers, metadata)) {
      return fullResponse(asset, request, metadata);
    }

    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const data = await asset.arrayBuffer();
    const size = data.byteLength;
    let start, end;
    if (match && (match[1] || match[2])) {
      if (!match[1]) {
        const suffix = Number(match[2]);
        if (Number.isSafeInteger(suffix) && suffix > 0) {
          start = Math.max(0, size - suffix);
          end = size - 1;
        }
      } else {
        start = Number(match[1]);
        end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
      }
    }
    const responseHeaders = new Headers(asset.headers);
    responseHeaders.set('Accept-Ranges', 'bytes');
    if (metadata) responseHeaders.set('ETag', metadata.etag);
    responseHeaders.delete('Content-Encoding');
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) {
      responseHeaders.set('Content-Range', `bytes */${size}`);
      responseHeaders.set('Content-Length', '0');
      return new Response(null, {status: 416, headers: responseHeaders});
    }
    responseHeaders.set('Content-Range', `bytes ${start}-${end}/${size}`);
    responseHeaders.set('Content-Length', String(end - start + 1));
    return new Response(data.slice(start, end + 1), {status: 206, headers: responseHeaders});
  },
};

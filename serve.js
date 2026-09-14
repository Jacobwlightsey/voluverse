// Minimal static file server for the Volu splat viewer.
import http from 'http'
import { readFile } from 'fs/promises'
import { extname, join, normalize } from 'path'

const ROOT = decodeURIComponent(new URL('.', import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1')
const PORT = 5192
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.glb': 'model/gltf-binary',
  '.ply': 'application/octet-stream', '.ksplat': 'application/octet-stream',
  '.splat': 'application/octet-stream', '.spz': 'application/octet-stream', '.mp4': 'video/mp4',
}

http.createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(req.url.split('?')[0])
    if (path === '/') path = '/index.html'
    const file = normalize(join(ROOT, path))
    if (!file.startsWith(normalize(ROOT))) { res.writeHead(403); return res.end('forbidden') }
    const data = await readFile(file)
    res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404); res.end('not found')
  }
}).listen(PORT, () => console.log('[volu] splat viewer on http://localhost:' + PORT))

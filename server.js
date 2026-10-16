const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA, 'db.json');
const UPLOADS = path.join(ROOT, 'uploads');
const PORT = Number(process.env.PORT || 3000);
for (const folder of [DATA, UPLOADS]) fs.mkdirSync(folder, { recursive: true });

const seed = {
  users: [{ id: 'u-demo', username: 'creator', name: 'Aarav', password: 'demo123', role: 'Editor', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80' }],
  posts: [
    { id: 'p-cathedral', authorId: 'u-demo', kind: 'post', title: 'Golden hour colour study', description: 'As the soft golden light of the late afternoon sun began to filter through the tall whispering pine trees, painting long dancing shadows across the quiet mossy forest floor, a small red fox quietly emerged from the thick brush, paused to listen to the distant rush of the river, and then darted swiftly into the ferns.\n\nHow to Build a Long Sentence\n\nA good long sentence is just short, clear thoughts joined together with care.\n• Set the scene: Tell the reader when and where things happen.\n• Add action: Show what the main subject is doing right now.\n• Layer details: Use descriptive words to bring the scene to life.', media: ['https://images.unsplash.com/photo-1548625361-58a9b86aa83b?auto=format&fit=crop&w=1400&q=85'], createdAt: '2026-10-16T08:00:00.000Z', views: 104000, likes: [] },
    { id: 'p-city', authorId: 'u-demo', kind: 'post', title: 'A rainy-night edit', description: 'Creativity has no limit if you keep looking for the light.', media: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'], createdAt: '2026-10-15T08:00:00.000Z', views: 12700, likes: [] }
  ], comments: [], follows: [], sessions: {}
};
function db() { if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2)); return JSON.parse(fs.readFileSync(DB_FILE)); }
function save(value) { fs.writeFileSync(DB_FILE, JSON.stringify(value, null, 2)); }
function id(prefix) { return prefix + '-' + crypto.randomUUID(); }
function send(res, status, data, headers = {}) { res.writeHead(status, { 'content-type': 'application/json', ...headers }); res.end(JSON.stringify(data)); }
function getUser(req, database) { const token = (req.headers.authorization || '').replace('Bearer ', ''); const uid = database.sessions[token]; return database.users.find(u => u.id === uid); }
function publicUser(user) { return { id: user.id, username: user.username, name: user.name, role: user.role, avatar: user.avatar }; }
function hydrate(post, database, viewer) { const author = database.users.find(u => u.id === post.authorId); const comments = database.comments.filter(c => c.postId === post.id).map(c => ({ ...c, author: publicUser(database.users.find(u => u.id === c.authorId)) })); return { ...post, author: publicUser(author), likeCount: post.likes.length, liked: !!viewer && post.likes.includes(viewer.id), comments }; }
function readBody(req) { return new Promise((resolve, reject) => { let raw = ''; req.on('data', c => { raw += c; if (raw.length > 12_000_000) reject(new Error('Payload too large')); }); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON')); } }); }); }
function serveFile(res, file) { const ext = path.extname(file); const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.mp4':'video/mp4' }; if (!fs.existsSync(file)) return send(res, 404, { error: 'Not found' }); res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res); }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost'); const database = db(); const viewer = getUser(req, database);
  try {
    if (url.pathname.startsWith('/uploads/')) return serveFile(res, path.join(UPLOADS, path.basename(url.pathname)));
    if (url.pathname === '/api/auth/register' && req.method === 'POST') { const b = await readBody(req); if (!b.username || !b.password || b.password.length < 6) return send(res, 400, { error: 'Username and a 6-character password are required.' }); if (database.users.some(u => u.username.toLowerCase() === b.username.toLowerCase())) return send(res, 409, { error: 'That username is already taken.' }); const user = { id:id('u'), username:b.username.replace(/[^\w.]/g,''), name:b.name || b.username, password:b.password, role:'Creator', avatar:`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(b.username)}` }; database.users.push(user); const token = crypto.randomUUID(); database.sessions[token] = user.id; save(database); return send(res, 201, { token, user:publicUser(user) }); }
    if (url.pathname === '/api/auth/login' && req.method === 'POST') { const b = await readBody(req); const user = database.users.find(u => u.username.toLowerCase() === String(b.username).toLowerCase() && u.password === b.password); if (!user) return send(res, 401, { error:'Invalid username or password.' }); const token = crypto.randomUUID(); database.sessions[token] = user.id; save(database); return send(res, 200, { token, user:publicUser(user) }); }
    if (url.pathname === '/api/auth/logout' && req.method === 'POST') { if (viewer) delete database.sessions[(req.headers.authorization || '').replace('Bearer ', '')]; save(database); return send(res, 200, { ok:true }); }
    if (url.pathname === '/api/me') { if (!viewer) return send(res, 401, { error:'Sign in required.' }); return send(res, 200, { user:publicUser(viewer) }); }
    if (url.pathname === '/api/posts' && req.method === 'GET') { const page = Math.max(1, Number(url.searchParams.get('page') || 1)); const q = (url.searchParams.get('q') || '').toLowerCase(); const all = database.posts.filter(p => !q || (p.title + p.description).toLowerCase().includes(q)).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); const items = all.slice((page-1)*10, page*10).map(p => hydrate(p, database, viewer)); return send(res, 200, { items, hasMore: page * 10 < all.length }); }
    if (url.pathname === '/api/posts' && req.method === 'POST') { if (!viewer) return send(res, 401, { error:'Sign in required to publish.' }); const b = await readBody(req); if (!b.title?.trim() || b.title.length > 100) return send(res, 400, { error:'A title up to 100 characters is required.' }); if (b.description?.length > 2000) return send(res, 400, { error:'Description must be 2,000 characters or fewer.' }); if (!['post','reel','blog'].includes(b.kind)) return send(res,400,{error:'Invalid content type.'}); if (b.kind === 'reel' && !b.media?.[0]) return send(res,400,{error:'A reel requires video media.'}); const post = { id:id('p'), authorId:viewer.id, kind:b.kind, title:b.title.trim(), description:(b.description || '').trim(), media:b.media || [], createdAt:new Date().toISOString(), views:0, likes:[] }; database.posts.push(post); save(database); return send(res, 201, { post:hydrate(post, database, viewer) }); }
    const postMatch = url.pathname.match(/^\/api\/posts\/([^/]+)$/);
    if (postMatch && req.method === 'GET') { const post = database.posts.find(p => p.id === postMatch[1]); if (!post) return send(res,404,{error:'Post not found.'}); post.views++; save(database); return send(res,200,{post:hydrate(post,database,viewer)}); }
    if (postMatch && req.method === 'DELETE') { if (!viewer) return send(res,401,{error:'Sign in required.'}); const i=database.posts.findIndex(p=>p.id===postMatch[1]); if(i<0)return send(res,404,{error:'Post not found.'}); if(database.posts[i].authorId!==viewer.id)return send(res,403,{error:'You can only delete your own posts.'}); database.posts.splice(i,1); database.comments=database.comments.filter(c=>c.postId!==postMatch[1]); save(database); return send(res,200,{ok:true}); }
    const likeMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/like$/);
    if (likeMatch && req.method === 'POST') { if(!viewer)return send(res,401,{error:'Sign in required.'}); const post=database.posts.find(p=>p.id===likeMatch[1]); if(!post)return send(res,404,{error:'Post not found.'}); const i=post.likes.indexOf(viewer.id); if(i>=0)post.likes.splice(i,1);else post.likes.push(viewer.id); save(database);return send(res,200,{liked:i<0,count:post.likes.length}); }
    const commentMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
    if (commentMatch && req.method === 'POST') { if(!viewer)return send(res,401,{error:'Sign in required.'}); const b=await readBody(req); if(!b.body?.trim())return send(res,400,{error:'Comment cannot be empty.'}); const comment={id:id('c'),postId:commentMatch[1],authorId:viewer.id,body:b.body.trim().slice(0,500),createdAt:new Date().toISOString()};database.comments.push(comment);save(database);return send(res,201,{comment:{...comment,author:publicUser(viewer)}}); }
    if (url.pathname === '/api/upload' && req.method === 'POST') { if(!viewer)return send(res,401,{error:'Sign in required.'}); const b=await readBody(req); const m=String(b.data || '').match(/^data:(image\/(?:png|jpeg|webp|gif)|video\/(?:mp4|webm));base64,(.+)$/); if(!m)return send(res,400,{error:'Upload a supported image or video.'}); const bytes=Buffer.from(m[2],'base64');if(bytes.length>8*1024*1024)return send(res,400,{error:'File must be under 8 MB.'});const ext=m[1].split('/')[1].replace('jpeg','jpg');const file=id('media')+'.'+ext;fs.writeFileSync(path.join(UPLOADS,file),bytes);return send(res,201,{url:'/uploads/'+file,type:m[1]}); }
    if (url.pathname === '/api/search' && req.method === 'GET') { const q=(url.searchParams.get('q')||'').toLowerCase(); return send(res,200,{users:database.users.filter(u=>(u.username+u.name).toLowerCase().includes(q)).map(publicUser)}); }
    if (url.pathname.startsWith('/api/')) return send(res,404,{error:'Unknown API route.'});
    return serveFile(res, path.join(ROOT, 'public', url.pathname === '/' ? 'index.html' : url.pathname));
  } catch (error) { return send(res, 400, { error:error.message || 'Unexpected error.' }); }
});
if (require.main === module) server.listen(PORT, () => console.log(`Amerigam running at http://localhost:${PORT}`));
module.exports = { server };

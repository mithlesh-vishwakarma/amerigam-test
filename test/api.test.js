const test = require('node:test');
const assert = require('node:assert/strict');
const { server } = require('../server');

let base;
test.before(async () => await new Promise(resolve => server.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; resolve(); })));
test.after(() => server.close());
test('feed is available and seeded', async () => {
  const response = await fetch(base + '/api/posts');
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.ok(body.items.length >= 2);
  assert.ok(body.items[0].author.username);
});
test('authentication and a persisted post work', async () => {
  const login = await fetch(base + '/api/auth/login', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({username:'creator',password:'demo123'}) });
  const session = await login.json(); assert.equal(login.status, 200);
  const created = await fetch(base + '/api/posts', { method:'POST', headers:{'content-type':'application/json',authorization:'Bearer '+session.token}, body:JSON.stringify({kind:'blog',title:'API verification post',description:'A post created by the integration test.',media:[]}) });
  const post = await created.json(); assert.equal(created.status, 201);
  const like = await fetch(base + '/api/posts/'+post.post.id+'/like', {method:'POST',headers:{authorization:'Bearer '+session.token}}); assert.equal(like.status, 200);
  const remove = await fetch(base + '/api/posts/'+post.post.id, {method:'DELETE',headers:{authorization:'Bearer '+session.token}}); assert.equal(remove.status, 200);
});

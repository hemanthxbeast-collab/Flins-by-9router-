import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../src/database.js';
import { createApp } from '../src/app.js';
let server, base;
test.before(async()=>{process.env.JWT_SECRET='test-secret-with-32-characters-minimum';const app=createApp(createDatabase(':memory:'));server=app.listen(0);await new Promise(r=>server.once('listening',r));base=`http://127.0.0.1:${server.address().port}`;});
test.after(()=>server.close());
async function api(path, options={}){const r=await fetch(base+path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});return [r,await r.json()];}
test('health check reports service status',async()=>{const [r,b]=await api('/api/health');assert.equal(r.status,200);assert.equal(b.status,'ok');});
test('register, execute task, and retrieve only authenticated history',async()=>{const [registered,auth]=await api('/api/auth/register',{method:'POST',body:JSON.stringify({email:'ada@example.com',password:'a-safe-test-password'})});assert.equal(registered.status,201);assert.ok(auth.token);const headers={Authorization:`Bearer ${auth.token}`};const [created,body]=await api('/api/tasks',{method:'POST',headers,body:JSON.stringify({command:'Play a focus playlist'})});assert.equal(created.status,201);assert.equal(body.task.intent,'spotify.playback');assert.match(body.task.response,/Queued/);const [list,history]=await api('/api/tasks',{headers});assert.equal(list.status,200);assert.equal(history.tasks.length,1);assert.equal(history.tasks[0].command,'Play a focus playlist');});
test('rejects unauthenticated and malformed requests',async()=>{let [r,b]=await api('/api/tasks',{method:'POST',body:JSON.stringify({command:'Play music'})});assert.equal(r.status,401);assert.equal(b.error.code,'AUTH_REQUIRED');[r,b]=await api('/api/auth/register',{method:'POST',body:JSON.stringify({email:'x',password:'short'})});assert.equal(r.status,400);assert.equal(b.error.code,'INVALID_INPUT');});

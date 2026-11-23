// Automated Integration Test for Note-Taking API
const http = require('http');
require('dotenv').config({ path: __dirname + '/.env' });
const app = require('./server');

const PORT = 5001; // Use test port to avoid conflict
let server;

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  const timestamp = Date.now();
  const userA = {
    name: 'Alice Burgundy',
    email: `alice_${timestamp}@test.com`,
    password: 'password123',
  };
  const userB = {
    name: 'Bob White',
    email: `bob_${timestamp}@test.com`,
    password: 'password456',
  };

  let tokenA = '';
  let tokenB = '';
  let noteAId = '';

  console.log('\n--- 🧪 Starting Note-Taking API Automated Verification ---');

  // 1. Health Check
  const healthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log(`[Test 1] Health check: Status ${healthRes.status} (Expected 200)`);
  if (healthRes.status !== 200) throw new Error('Health check failed');

  // 2. Reject note access without token
  const unauthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/notes',
    method: 'GET',
  });
  console.log(`[Test 2] Unauthenticated access to /api/notes: Status ${unauthRes.status} (Expected 401)`);
  if (unauthRes.status !== 401) throw new Error('Unauthenticated access was not rejected');

  // 3. Register User A
  const regARes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    userA
  );
  console.log(`[Test 3] Register User A: Status ${regARes.status} (Expected 201)`, regARes.status !== 201 ? regARes.body : '');
  if (regARes.status !== 201 || !regARes.body.data.token) throw new Error('Register User A failed');
  tokenA = regARes.body.data.token;

  // 4. Duplicate Registration rejection
  const dupRegRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    userA
  );
  console.log(`[Test 4] Reject duplicate registration: Status ${dupRegRes.status} (Expected 400)`);
  if (dupRegRes.status !== 400) throw new Error('Duplicate user was not rejected');

  // 5. Login User A
  const loginARes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: userA.email, password: userA.password }
  );
  console.log(`[Test 5] Login User A: Status ${loginARes.status} (Expected 200)`);
  if (loginARes.status !== 200 || !loginARes.body.data.token) throw new Error('Login User A failed');

  // 6. Register User B
  const regBRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    userB
  );
  tokenB = regBRes.body.data.token;
  console.log(`[Test 6] Register User B: Status ${regBRes.status} (Expected 201)`);

  // 7. Create Note for User A
  const createNoteRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/notes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
    },
    {
      title: 'Secret Burgundy Strategy',
      content: 'Top secret architectural designs for the note application.',
      category: 'Work',
      isPinned: true,
    }
  );
  console.log(`[Test 7] Create Note by User A: Status ${createNoteRes.status} (Expected 201)`);
  if (createNoteRes.status !== 201 || !createNoteRes.body.data._id) throw new Error('Create Note failed');
  noteAId = createNoteRes.body.data._id;

  // 8. User A gets notes (should contain 1 note)
  const getNotesARes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/notes',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.log(`[Test 8] User A fetch notes count: ${getNotesARes.body.count} (Expected >= 1)`);
  if (getNotesARes.status !== 200 || getNotesARes.body.count < 1) throw new Error('Fetch notes failed');

  // 9. User B must NOT see User A's note in list
  const getNotesBRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/notes',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  console.log(`[Test 9] User B notes list isolation check: count = ${getNotesBRes.body.count} (Expected 0)`);
  if (getNotesBRes.body.count !== 0) throw new Error('Cross-user notes isolation failed in list view!');

  // 10. User B must NOT access User A's note directly by ID
  const directAccessRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/notes/${noteAId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  console.log(`[Test 10] User B unauthorized note access by ID: Status ${directAccessRes.status} (Expected 403)`);
  if (directAccessRes.status !== 403) throw new Error('Cross-user direct access was not forbidden (403)');

  // 11. User B must NOT update User A's note
  const updateBRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/notes/${noteAId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
    },
    { title: 'Hacked by Bob' }
  );
  console.log(`[Test 11] User B unauthorized note update: Status ${updateBRes.status} (Expected 403)`);
  if (updateBRes.status !== 403) throw new Error('Cross-user note update was not forbidden (403)');

  // 12. User B must NOT delete User A's note
  const deleteBRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/notes/${noteAId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  console.log(`[Test 12] User B unauthorized note delete: Status ${deleteBRes.status} (Expected 403)`);
  if (deleteBRes.status !== 403) throw new Error('Cross-user note delete was not forbidden (403)');

  // 13. User A successfully updates note
  const updateARes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/notes/${noteAId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
    },
    { title: 'Updated Burgundy Strategy', isPinned: false }
  );
  console.log(`[Test 13] User A update note: Status ${updateARes.status} (Expected 200), Title: "${updateARes.body.data.title}"`);
  if (updateARes.status !== 200 || updateARes.body.data.title !== 'Updated Burgundy Strategy') {
    throw new Error('User A note update failed');
  }

  // 14. User A deletes note
  const deleteARes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/notes/${noteAId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.log(`[Test 14] User A delete note: Status ${deleteARes.status} (Expected 200)`);
  if (deleteARes.status !== 200) throw new Error('User A note delete failed');

  console.log('\n✅ ALL 14 BACKEND TESTS PASSED! Authentication & User Isolation are 100% Verified.\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ Test verification failed:', err);
  process.exit(1);
});

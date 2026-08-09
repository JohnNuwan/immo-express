const request = require('supertest');
const app = require('../server');

describe('ImmoExpress API Tests', () => {

  let userToken;
  let userId;
  let otherToken;
  let bienId;

  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    nom: 'Dupont',
    prenom: 'Jean'
  };

  const otherUser = {
    email: `other_${Date.now()}@example.com`,
    password: 'password123',
    nom: 'Martin',
    prenom: 'Claire'
  };

  test('GET /api/health returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });

  test('POST /api/auth/register registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    userToken = res.body.token;
    userId = res.body.user.id;
  });

  test('POST /api/auth/register registers second user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(otherUser);
    
    expect(res.statusCode).toEqual(201);
    otherToken = res.body.token;
  });

  test('POST /api/auth/login authenticates registered user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/biens creates a property listing', async () => {
    const res = await request(app)
      .post('/api/biens')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        titre: 'Bel appartement haussmannien',
        prix: 450000,
        surface: 65,
        type: 'appartement',
        ville: 'Paris'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    bienId = res.body.id;
  });

  test('PUT /api/biens/:id denies unauthorized update by non-owner', async () => {
    const res = await request(app)
      .put(`/api/biens/${bienId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ titre: 'Hacked Title' });
    
    expect(res.statusCode).toEqual(403);
    expect(res.body.error).toContain('non autorisé');
  });

  test('DELETE /api/biens/:id denies unauthorized delete by non-owner', async () => {
    const res = await request(app)
      .delete(`/api/biens/${bienId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    
    expect(res.statusCode).toEqual(403);
  });

  test('POST /api/favorites/:bienId adds property to user favorites', async () => {
    const res = await request(app)
      .post(`/api/favorites/${bienId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toEqual(201);
  });

  test('GET /api/favorites lists user favorites', async () => {
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.some(b => b.id === bienId)).toBeTruthy();
  });

  test('DELETE /api/favorites/:bienId removes property from favorites', async () => {
    const res = await request(app)
      .delete(`/api/favorites/${bienId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toEqual(200);
  });

  test('POST /api/biens/upload uploads base64 photo', async () => {
    const fakeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const res = await request(app)
      .post('/api/biens/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ image: fakeBase64 });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('url');
    expect(res.body.url).toMatch(/^\/uploads\//);
  });

  test('DELETE /api/biens/:id allows owner to delete property', async () => {
    const res = await request(app)
      .delete(`/api/biens/${bienId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toEqual(200);
  });

});

const express = require('express');
const adminRoute = require('./admin/admin.route');

const app = express();
app.use(express.json());
app.use('/admin', adminRoute);

const server = app.listen(9192, () => {
  console.log('Test server on 9192');
  const http = require('http');
  const data = JSON.stringify({ username: 'admin', password: 'admin123' });
  const req = http.request({
    hostname: 'localhost', port: 9192, path: '/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', body);
      server.close();
    });
  });
  req.write(data);
  req.end();
});

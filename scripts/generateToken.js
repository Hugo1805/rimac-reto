const { generateToken } = require('./src/handlers/auth');

// Generar token para pruebas
const token = generateToken('user-123', 'test@rimac.com');
console.log('JWT Token para pruebas:');
console.log(token);

console.log('\nUso en curl:');
console.log(`curl -H "Authorization: Bearer ${token}" <tu-endpoint>`);

console.log('\nUso en Postman:');
console.log('Headers: Authorization = Bearer ' + token);

const fetch = require('node-fetch');

async function testLoginDirector() {
  try {
    console.log('🔍 Probando login del director...');
    
    const response = await fetch('https://mibacken-escuela.onrender.com/api/auth/login/usuario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'director@escuela.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login exitoso!');
      console.log(`👤 Usuario: ${data.data.user.nombre} ${data.data.user.apellido}`);
      console.log(`🎭 Rol: ${data.data.user.rol}`);
      console.log(`📧 Email: ${data.data.user.email}`);
      console.log(`🔑 Token: ${data.data.token.substring(0, 50)}...`);
    } else {
      console.log('❌ Login falló:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error en login:', error.message);
  }
}

testLoginDirector();

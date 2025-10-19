// Script para probar el login y medir tiempos
import https from 'https';

const BASE_URL = 'https://mibacken-escuela.onrender.com';

// Función para hacer peticiones HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        resolve({
          statusCode: res.statusCode,
          data: data,
          duration: duration
        });
      });
    });
    
    req.on('error', (error) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      reject({
        error: error,
        duration: duration
      });
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Función para probar Health Check
async function testHealthCheck() {
  console.log('🔍 Probando Health Check...');
  console.log('URL:', `${BASE_URL}/api/health`);
  
  try {
    const result = await makeRequest(`${BASE_URL}/api/health`);
    console.log('✅ Health Check exitoso');
    console.log('⏱️ Tiempo:', result.duration + 'ms');
    console.log('📊 Status:', result.statusCode);
    console.log('📄 Respuesta:', result.data);
    return true;
  } catch (error) {
    console.log('❌ Health Check falló');
    console.log('⏱️ Tiempo:', error.duration + 'ms');
    console.log('🚨 Error:', error.error.message);
    return false;
  }
}

// Función para probar Login
async function testLogin() {
  console.log('\n🔍 Probando Login...');
  console.log('URL:', `${BASE_URL}/api/auth/login/usuario`);
  
  const loginData = JSON.stringify({
    email: 'briyan@escuela.edu.pe',
    password: '159briyan159'
  });
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    },
    body: loginData
  };
  
  try {
    const result = await makeRequest(`${BASE_URL}/api/auth/login/usuario`, options);
    console.log('✅ Login exitoso');
    console.log('⏱️ Tiempo:', result.duration + 'ms');
    console.log('📊 Status:', result.statusCode);
    console.log('📄 Respuesta:', result.data);
    return true;
  } catch (error) {
    console.log('❌ Login falló');
    console.log('⏱️ Tiempo:', error.duration + 'ms');
    console.log('🚨 Error:', error.error.message);
    return false;
  }
}

// Función principal
async function runTests() {
  console.log('🚀 Iniciando pruebas del backend...');
  console.log('🌐 URL Base:', BASE_URL);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('='.repeat(50));
  
  // Test 1: Health Check
  const healthOk = await testHealthCheck();
  
  // Test 2: Login
  const loginOk = await testLogin();
  
  // Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE PRUEBAS:');
  console.log('Health Check:', healthOk ? '✅ OK' : '❌ FALLO');
  console.log('Login:', loginOk ? '✅ OK' : '❌ FALLO');
  
  if (healthOk && loginOk) {
    console.log('🎉 ¡TODAS LAS PRUEBAS EXITOSAS!');
  } else {
    console.log('🚨 ALGUNAS PRUEBAS FALLARON');
  }
}

// Ejecutar pruebas
runTests().catch(console.error);

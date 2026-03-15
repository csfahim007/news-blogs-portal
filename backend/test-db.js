const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔌 Testing MySQL connection...');
    
    const connection = await mysql.createConnection({
      host: '103.116.165.233',
      user: 'pinesaas_pinesaas_blogs',
      password: 'Pinesaas_blogsafK@25',
      database: 'pinesaas_blogsdb',
      port: 3306
    });

    console.log('✅ Connected successfully!');
    
    const [rows] = await connection.query('SHOW TABLES;');
    console.log('📋 Current tables:', rows);
    
    await connection.end();
    console.log('✅ Connection test completed!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Check if your local IP is added in Webuzo Remote MySQL Access');
    console.error('2. Verify the database credentials are correct');
    console.error('3. Check if port 3306 is open in firewall');
  }
}

testConnection();

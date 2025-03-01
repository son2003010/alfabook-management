import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();
// Cấu hình kết nối SQL Server
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,
    trustedConnection: false,
    enableArithAbort: true,
    instancename: 'SQLEXPRESS',
  },
  port: 1433,
};

// Kết nối đến SQL Server
const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log('Connected to SQL Server successfully');
  } catch (err) {
    console.error('Lỗi không kết nối được đến SQL:', err.message);
  }
};

export { connectDB, sql };

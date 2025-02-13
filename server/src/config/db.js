import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();
// Cấu hình kết nối SQL Server
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,  // Lưu ý sự xuất hiện của hai dấu '\\' giữa tên máy và instance
    database: process.env.DB_DATABASE,
    options: {
      trustServerCertificate: true,  // Thêm dòng này nếu bạn gặp vấn đề với SSL
      trustedConnection:false,
      enableArithAbort: true,
      instancename: "SQLEXPRESS"
    },
    port:1433
};

// Kết nối đến SQL Server
const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log('Connected to SQL Server successfully');
      } catch (err) {
        console.error('Database connection failed:', err.message);
        console.error('Stack:', err.stack);
    }
};

export { connectDB, sql };

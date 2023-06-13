import { createPool } from 'mysql2/promise';
const pool = createPool({
host: 'mysql',
user: 'root',
password: 'omegaup',
database: 'omegaup',
connectionLimit: 10 // maximum number of connections in the pool
});
export default pool;
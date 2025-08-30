import { pool } from '../config/db.js';

/* copy your full createTables() from original code */
export async function createTables(){
  const client = await pool.connect();
  try{
    /* — full SQL for study, work_profiles, invest, chatbot_users,
         indexes, triggers — */
  }catch(err){
    console.error('❌  Table creation error:',err.message);
  }finally{ client.release(); }
}

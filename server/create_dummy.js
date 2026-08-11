const pool = require('./db');
const bcrypt = require('bcrypt');

async function createDummyUser() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Dummy', 'User', 'dummyuser@gmail.com', hash]
    );
    const userId = result.rows[0].id;
    
    // Also create an empty profile for them so they don't crash the frontend
    await pool.query(
      'INSERT INTO user_profiles (user_id, gender) VALUES ($1, $2)',
      [userId, 'male']
    );

    console.log('Successfully created dummyuser@gmail.com with password: password123');
  } catch (err) {
    console.error('Failed to create user:', err);
  } finally {
    pool.end();
  }
}

createDummyUser();

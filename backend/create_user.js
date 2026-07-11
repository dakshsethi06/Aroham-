const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log('Creating user...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'priyanshubansal720@gmail.com',
    password: 'Jatin@1234',
    email_confirm: true
  });
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log('User already exists! You can log in right now.');
    } else {
      console.error('Error:', error.message);
    }
  } else {
    console.log('Success! Test user created and auto-confirmed.');
  }
}

createTestUser();

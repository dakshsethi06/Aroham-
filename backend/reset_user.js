const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function forceResetUser() {
  console.log('Fetching users...');
  
  // Find the user by email
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) return console.error('List error:', listError);
  
  const user = usersData.users.find(u => u.email === 'priyanshubansal720@gmail.com');
  
  if (user) {
    console.log('User found. Force updating password and confirming email...');
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: 'Jatin@1234',
      email_confirm: true
    });
    
    if (error) console.error('Update error:', error);
    else console.log('Successfully reset password and confirmed email!');
  } else {
    console.log('User not found. Try running the create script again.');
  }
}

forceResetUser();

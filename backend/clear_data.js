const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clearAll() {
  // order_items, payments, cart_items use integer IDs
  for (const table of ['order_items', 'payments', 'cart_items']) {
    const { error } = await supabase.from(table).delete().gt('id', 0);
    if (error) console.error(`${table}:`, error.message);
    else console.log(`✅ Cleared ${table}`);
  }
  // orders uses UUID
  const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) console.error('orders:', error.message);
  else console.log('✅ Cleared orders');

  console.log('\nAll test data wiped!');
}

clearAll();

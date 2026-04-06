const { supabaseAdmin } = require('./src/config/supabase');

async function countRecords() {
  const { count: pCount, error: pError } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });
    
  const { count: cCount, error: cError } = await supabaseAdmin
    .from('classes')
    .select('*', { count: 'exact', head: true });

  if (pError) console.error('Profiles error:', pError);
  else console.log('Profiles count:', pCount);

  if (cError) console.error('Classes error:', cError);
  else console.log('Classes count:', cCount);
}

countRecords();

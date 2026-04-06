const { supabaseAdmin } = require('./src/config/supabase');

async function reproduce() {
  const id = '4c1313da-9bcc-49bc-b9f8-17a2b916f74f';
  const status = 'approved';

  try {
    console.log('Searching for ID before update:', id);
    const { data: before } = await supabaseAdmin.from('classes').select('*').eq('id', id);
    console.log('Before update:', before);

    console.log('Attempting update for ID:', id);
    const { data: updateResult, error: classError } = await supabaseAdmin
      .from('classes')
      .update({
        status,
        updated_at: new Date()
      })
      .eq('id', id)
      .select();

    if (classError) {
      console.error('Database update error:', JSON.stringify(classError, null, 2));
    } else {
      console.log('Update result:', updateResult);
    }

  } catch (error) {
    console.error('Caught error:', error);
  }
}

reproduce();

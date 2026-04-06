const { supabaseAdmin } = require('./src/config/supabase');

async function reproduce() {
  const id = '4c1313da-9bcc-49bc-b9f8-17a2b916f74f';
  const status = 'approved';
  const rejection_reason = null;

  try {
    console.log('Attempting update for ID:', id);
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .update({
        status,
        rejection_reason: status === 'rejected' ? rejection_reason : null
        // removed updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (classError) {
      console.error('Database update error:', JSON.stringify(classError, null, 2));
      return;
    }

    console.log('Update successful, classData:', JSON.stringify(classData, null, 2));

  } catch (error) {
    console.error('Caught error:', error);
  }
}

reproduce();

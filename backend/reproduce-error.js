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
        rejection_reason: status === 'rejected' ? rejection_reason : null,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (classError) {
      console.error('Database update error:', classError);
      return;
    }

    console.log('Update successful, classData:', JSON.stringify(classData, null, 2));

    // Try notification
    console.log('Attempting notification for teacher:', classData.teacher_id);
    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: classData.teacher_id,
        title: 'Class Approved!',
        message: `Your class "${classData.title}" has been approved and is now live.`,
        type: 'success'
      });

    if (notifError) {
      console.error('Notification error:', notifError);
    } else {
      console.log('Notification created successfully');
    }

  } catch (error) {
    console.error('Caught error:', error);
  }
}

reproduce();

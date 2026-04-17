const { Client } = require('pg');
const connectionString = 'postgresql://postgres.ibjdmtosotlfmwzncuqk:7227876Wa%40%40@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function seedFlows() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Wipe all existing nodes except the 3 roots we created initially (if we want to be safe)
    // Actually, let's just wipe all other nodes to prevent duplicates while seeding
    await client.query(`DELETE FROM public.chatbot_structure WHERE parent_id IS NOT NULL`);

    // Insert flow under 'Payments' (11111111-1111-1111-1111-111111111111)
    const sql = `
      INSERT INTO public.chatbot_structure (id, parent_id, button_text, response_text, sort_order)
      VALUES 
        -- Payments Children (Branch Nodes)
       ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Making a Payment', NULL, 1),
       ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Refund Policy', 'Refunds are only considered within 7 days of purchase. Please contact the front desk at EWAY directly to process your refund request.', 2),
       
       -- 'Making a Payment' Children (Leaf Nodes)
       ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'Where is the Bank Account Number?', 'Bank: Bank of Ceylon\\nBranch: Nugegoda\\nAccount Name: EWAY Institute\\nAccount No: 1234567890', 1),
       ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'How to safely upload the bank slip?', 'To upload your bank slip:\\n1. Go to your Dashboard\\n2. Click ''My Classes''\\n3. Click ''Upload Bank Slip'' next to your pending class\\n4. Make sure the date and amount are clearly visible in the image.', 2),

       -- Classes Children (Branch and Leaf Nodes)
       ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 'Join a Live Class', 'To join a live class, go to your Student Dashboard, select ''My Classes'', and click the pulsating ''LIVE NOW'' button when your class is scheduled to begin.', 1),
       ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 'Class Recordings', 'If you missed a class, the recording will be automatically uploaded to the ''Free Tutorials'' or ''Materials'' section within 24 hours of the live session ending.', 2),

       -- Attendance Children (Leaf Nodes)
       ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'How do I mark my attendance?', 'If you attend physically, show your Student ID Card QR code to the staff at the entrance. If you attend online, your attendance is marked automatically when you join the live lecture system.', 1)
    `;

    await client.query(sql);
    console.log('✅ Flow seed completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await client.end();
  }
}

seedFlows();

-- 1. Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('OL', 'AL')),
    stream TEXT, 
    ol_category INTEGER,
    is_anchor BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Seed Subjects (Abbreviated for setup, User should run full seed if needed)
-- (Omitted for brevity in this setup file, refer to full seed in previous versions)

-- 3. Update Classes Table
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS schedules JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS force_request BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS conflict_details JSONB;

-- 4. Universal Notification Engine (V2)
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_role TEXT, -- 'Student', 'Teacher', 'Staff', 'Admin', 'All'
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'Info', -- 'Enrollment', 'Payment', 'Assignment', 'Announcement', 'System'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Assignments & Submissions
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    attachment_url TEXT,
    attachment_name TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT,
    status TEXT DEFAULT 'Submitted', -- 'Submitted', 'Late'
    grade TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Realtime
-- Execute this in the Supabase SQL Editor to enable Realtime for notifications
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 7. RLS Policies (Basic)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enrolled students can view assignments" ON public.assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM enrollments WHERE student_id = auth.uid() AND class_id = assignments.class_id)
    OR teacher_id = auth.uid()
);

-- STORAGE BUCKETS
-- Please create the following public buckets in Supabase Storage:
-- 1. 'assignments' (for teacher uploads)
-- 2. 'submissions' (for student homework)

Update the "User Management" page in the EWAY LMS Admin Dashboard.

IMPORTANT:
- Keep the same dark glassmorphism style
- Do not redesign the sidebar or main page structure
- Fix the filter dropdown layout issue
- Simplify the action buttons to only View, Edit, and Delete

==================================================
ISSUE 1 — FIX FILTER DROPDOWN OVERFLOW
==================================================

Current problem:
The filter dropdown menu is overflowing and appearing incorrectly under the filter bar.

Fix the dropdown behavior and layout.

Requirements:

- All filter dropdowns must open cleanly below their input field
- Dropdown panel must stay inside the page container
- No clipping, overlapping, or breaking into nearby sections
- Use a custom dark dropdown instead of browser default
- Dropdown width should match the field width
- Add proper z-index so dropdown appears above cards
- Add spacing between filter bar and content below

Dropdown style:
- Dark navy background
- Rounded corners
- Soft shadow
- Thin glass border
- White/light text
- Blue hover highlight
- Blue selected state

Apply this to:
- Role filter
- Status filter
- Sort dropdown

==================================================
ISSUE 2 — FIX SEARCH INPUT WIDTH / TEXT OVERFLOW
==================================================

Make sure the search input has enough width and the placeholder text does not get clipped.

Placeholder:
"Search by name or email"

Use proper padding for icon and text.

==================================================
ISSUE 3 — SIMPLIFY ACTION BUTTONS
==================================================

In the user table Actions column, remove extra buttons.

Keep ONLY these three actions:

1. View
2. Edit
3. Delete

Remove:
- Reset password
- Activate / deactivate
- Lock
- Power icon

==================================================
NEW ACTION BUTTON STYLE
==================================================

Use 3 small rounded square action buttons:

View:
- Blue accent
- Eye icon

Edit:
- Purple accent
- Edit/Pencil icon

Delete:
- Red accent
- Trash icon

Spacing:
- Equal spacing between buttons
- Align horizontally inside action column
- Center vertically

Add hover glow effects.

Optional tooltip labels:
- View User
- Edit User
- Delete User

==================================================
VIEW USER
==================================================

When clicking View:
Open a user detail modal or side panel showing:

- Profile image
- Full name
- Role
- Email
- Phone
- Status
- Registered date

==================================================
EDIT USER
==================================================

When clicking Edit:
Open edit user modal with fields:

- First Name
- Last Name
- Email
- Phone Number
- Role dropdown
- Status dropdown

Buttons:
- Cancel
- Save Changes

==================================================
DELETE USER
==================================================

When clicking Delete:
Open confirmation modal:

Title:
"Delete User?"

Message:
"This action cannot be undone."

Buttons:
- Cancel
- Delete User

==================================================
LAYOUT CLEANUP
==================================================

Make the filter bar cleaner and more balanced:

Row layout:
- Search input
- Role filter
- Status filter
- Sort filter

All aligned evenly in one row on desktop.

Desktop:
single row

Tablet:
2 rows if needed

Mobile:
stack vertically

==================================================
GOAL
==================================================

Fix the broken dropdown layout and simplify the admin user management actions so the page looks clean, functional, and professional in the EWAY LMS Admin Dashboard.
Update the "Reports" page in the EWAY LMS Staff Portal.

IMPORTANT:
- Keep the exact same dark glassmorphism design system
- Do not redesign sidebar, header, or existing report cards
- Only add functional interaction UI for the action buttons in the Recent Reports table

==================================================
ACTIONS TO IMPLEMENT
==================================================

In the "Recent Reports" table, each report row has 3 action buttons:

1. View Report (eye icon)
2. Download PDF (red download icon)
3. Download Excel (green file icon)

Create proper UI behavior for each action.

==================================================
1. VIEW REPORT
==================================================

When the user clicks the eye icon:

Open a centered modal or side preview panel titled:
"Report Preview"

Inside show a professional report preview layout matching EWAY LMS style.

Preview content should depend on report type:
- Payment Report
- Attendance Report
- Student Card Report

Use a clean report preview card with:

Top section:
- Report Title
- Report Type
- Generated Date
- Class Name
- Date Range

Middle section:
- Summary stats row
  Example:
  Total Payments / Attendance Rate / Cards Issued / Pending Payments

Bottom section:
- Small preview table with sample rows
  Example columns:
  Student Name | Class | Amount / Attendance / Card Status | Date | Status

Bottom right buttons:
- Close
- Download PDF
- Download Excel

Modal style:
- Dark glass card
- Rounded corners
- Blur background overlay
- Same blue glow accents as current dashboard

==================================================
2. DOWNLOAD PDF
==================================================

When user clicks the red download icon:

Open a small confirmation modal titled:
"Download PDF Report"

Content:
- Report name
- File format: PDF
- Short message:
  "Your report is ready to download."

Buttons:
- Cancel
- Download PDF

Optional success state after clicking Download PDF:
Show small toast notification at top-right:
"PDF report downloaded successfully"

Style:
- Match EWAY LMS modal style
- Red accent icon for PDF action

==================================================
3. DOWNLOAD EXCEL
==================================================

When user clicks the green Excel icon:

Open a small confirmation modal titled:
"Export Excel Report"

Content:
- Report name
- File format: Excel
- Short message:
  "Export this report as an Excel spreadsheet."

Buttons:
- Cancel
- Export Excel

Optional success state after clicking Export Excel:
Show small toast notification:
"Excel report exported successfully"

Style:
- Match EWAY LMS modal style
- Green accent icon for Excel action

==================================================
INTERACTION RULES
==================================================

- Clicking eye icon opens preview modal
- Clicking PDF icon opens PDF download modal
- Clicking Excel icon opens Excel export modal
- All modals should have smooth fade/scale animation
- Add hover glow effects to all 3 action buttons
- Use consistent spacing, shadows, and rounded corners

==================================================
UI STYLE
==================================================

- Dark navy / black gradient background
- Glassmorphism cards
- Soft borders and glow
- Rounded corners (16px)
- Blue accents for general actions
- Red accent for PDF
- Green accent for Excel

==================================================
GOAL
==================================================

Create a realistic report action flow for the EWAY LMS Staff Portal so staff can preview reports, download PDF files, and export Excel files in a professional admin-dashboard style.
import React, { useEffect, useState } from 'react';
import { Navbar } from './components/navbar';
import { HeroSection } from './components/hero-section';
import { AboutSection } from './components/about-section';
import { FeaturesSection } from './components/features-section';
import { WorkProcessSection } from './components/work-process-section';
import { GallerySection } from './components/gallery-section';
import { CTASection } from './components/cta-section';
import { ContactSection } from './components/contact-section';
import { Footer } from './components/footer';
import { LoginPage } from './components/login-page';
import { RegistrationPage } from './components/registration-page';
import { ForgotPasswordFlow } from './components/forgot-password-flow';
import { ResetPasswordPage } from './components/reset-password-page';
import { StudentDashboardHome } from './components/dashboard/student-dashboard-home';
import { StudentProfile } from './components/dashboard/student-profile';
import { StudentIdCard } from './components/dashboard/student-id-card';
import { NotificationsPage } from './components/dashboard/notifications-page';
import { MyClassesPage } from './components/dashboard/my-classes-page';
import { PurchaseClassesPage } from './components/dashboard/purchase-classes-page';
import { CheckoutPage } from './components/dashboard/checkout-page';
import { FreeTutorialsPage } from './components/dashboard/free-tutorials-page';
import { StudyPacksPage } from './components/dashboard/study-packs-page';
import { StudyPackPreviewPage } from './components/dashboard/study-pack-preview-page';
import { CheckoutPaymentPage } from './components/dashboard/checkout-payment-page';
import { AllTeachersPage } from './components/dashboard/all-teachers-page';
import { TeacherProfilePage } from './components/dashboard/teacher-profile-page';
import { ChatWithTeacherPage } from './components/dashboard/chat-with-teacher-page';
import { MyPerformancePage } from './components/dashboard/my-performance-page';
import { SupportPage } from './components/dashboard/support-page';
import { ComingSoonDashboard } from './components/dashboard/coming-soon-dashboard';
import { TeacherDashboardHome } from './components/dashboard/teacher-dashboard-home';
import { TeacherProfile } from './components/dashboard/teacher-profile';
import { TeacherClassesPage } from './components/dashboard/teacher-classes-page';
import { TeacherAssignmentsPage } from './components/dashboard/teacher-assignments-page';
import { TeacherAttendancePage } from './components/dashboard/teacher-attendance-page';
import { TeacherClassViewPage } from './components/dashboard/teacher-class-view-page';
import { TeacherChatPage } from './components/dashboard/teacher-chat-page';
import { StaffDashboardHome } from './components/dashboard/staff-dashboard-home';
import { StaffProfile } from './components/dashboard/staff-profile';
import { VerifyPaymentsPage } from './components/dashboard/verify-payments-page';
import { AttendanceManagementPage } from './components/dashboard/attendance-management-page';
import { StudentCardsPage } from './components/dashboard/student-cards-page';
import { ReportsPage } from './components/dashboard/reports-page';
import { AdminDashboardHome } from './components/dashboard/admin-dashboard-home';
import { AdminUserManagement } from './components/dashboard/admin-user-management';
import { AdminChatbotManagement } from './components/dashboard/admin-chatbot-management';
import { AdminPaymentVerification } from './components/dashboard/admin-payment-verification';
import { AdminReportGeneration } from './components/dashboard/admin-report-generation';
import { AdminViewReport } from './components/dashboard/admin-view-report';
import { AdminActivityLog } from './components/dashboard/admin-activity-log';
import { AdminMyProfile } from './components/dashboard/admin-my-profile';
import { StudentClassViewPage } from './components/dashboard/student-class-view-page';
import { TeacherStudyPacksPage } from './components/dashboard/teacher-study-packs-page';
import { TeacherStudyPackDetailsPage } from './components/dashboard/teacher-study-pack-details-page';
import { TeacherTutorialsPage } from './components/dashboard/teacher-tutorials-page';
import { TeacherTutorialDetailsPage } from './components/dashboard/teacher-tutorial-details-page';
import { StudentTutorialPlayerPage } from './components/dashboard/student-tutorial-player-page';
import { AdminContentHubPage } from './components/dashboard/admin-content-hub-page';
import { MyAttendancePage } from './components/dashboard/my-attendance-page';
import { TeacherReportsPage } from './components/dashboard/teacher-reports-page';
import { Toaster } from './components/ui/sonner';

type PageType =
  | 'home'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'dashboard-student'
  | 'student-profile'
  | 'student-id-card'
  | 'student-notifications'
  | 'student-classes'
  | 'student-purchase'
  | 'student-checkout'
  | 'student-tutorials'
  | 'student-study-packs'
  | 'student-pack-preview'
  | 'student-pack-checkout'
  | 'student-teachers'
  | 'student-teacher-profile'
  | 'student-chat'
  | 'student-performance'
  | 'support'
  | 'dashboard-teacher'
  | 'teacher-profile'
  | 'teacher-classes'
  | 'teacher-assignments'
  | 'teacher-attendance'
  | 'teacher-notifications'
  | 'teacher-chat'
  | 'teacher-class-view'
  | 'dashboard-staff'
  | 'staff-profile'
  | 'verify-payments'
  | 'attendance-management'
  | 'student-cards'
  | 'reports'
  | 'staff-notifications'
  | 'dashboard-admin'
  | 'admin-users'
  | 'admin-chatbot'
  | 'admin-payment-verification'
  | 'admin-notifications'
  | 'admin-report-generation'
  | 'admin-view-report'
  | 'admin-activity-log'
  | 'admin-my-profile'
  | 'student-class-view'
  | 'student-tutorial-player'
  | 'teacher-study-packs'
  | 'teacher-study-pack-details'
  | 'teacher-tutorials'
  | 'teacher-tutorial-details'
  | 'teacher-reports'
  | 'admin-content-hub'
  | 'student-attendance';

/**
 * Main Application Component
 * Handles global state, client-side routing (state-based), and user session persistence.
 */
function App() {
  // Navigation & Page State
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  
  // Transient Data States (passed between pages during navigation)
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [previewPackData, setPreviewPackData] = useState<any>(null);
  const [packCheckoutData, setPackCheckoutData] = useState<any>(null);
  const [teacherProfileData, setTeacherProfileData] = useState<any>(null);
  const [chatTeacherData, setChatTeacherData] = useState<any>(null);
  const [classViewData, setClassViewData] = useState<any>(null);
  const [studentClassViewData, setStudentClassViewData] = useState<any>(null);

  /**
   * Effect: Initialize App State
   * Restores session from localStorage and handles direct URL deep-linking (e.g. for password resets).
   */
  useEffect(() => {
    // Smooth scrolling for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';

    // 1. Restore session and transient data from localStorage
    const savedPage = localStorage.getItem('eway_current_page');
    const token = localStorage.getItem('eway_token');
    const savedClassViewData = localStorage.getItem('eway_class_view_data');
    const savedStudentData = localStorage.getItem('eway_student_view_data');
    
    // Restore transient data if available
    if (savedClassViewData) {
      try { setClassViewData(JSON.parse(savedClassViewData)); } catch (e) { console.error("Parse error savedClassViewData"); }
    }
    if (savedStudentData) {
      try { setStudentClassViewData(JSON.parse(savedStudentData)); } catch (e) { console.error("Parse error savedStudentData"); }
    }
    
    // Only restore if we have a token and a saved page that isn't login/register
    if (token && savedPage && !['login', 'register', 'home', 'reset-password'].includes(savedPage)) {
      setCurrentPage(savedPage as PageType);
      
      // If we're authenticated and the URL is still /reset-password, clear it
      if (window.location.pathname === '/reset-password') {
        window.history.replaceState({}, '', '/');
      }
      return;
    }

    // 2. Handle initial route based on URL for reset password (if not authenticated)
    if (window.location.pathname === '/reset-password') {
      setCurrentPage('reset-password');
      return;
    }
  }, []);

  // Save current page and transient data to localStorage
  useEffect(() => {
    // Don't save transient pages like login/register as "last visited" for refresh
    if (!['login', 'register', 'home', 'reset-password'].includes(currentPage)) {
      localStorage.setItem('eway_current_page', currentPage);
    }
    
    // Persist relevant transient data based on current context
    if (classViewData) {
      localStorage.setItem('eway_class_view_data', JSON.stringify(classViewData));
    } else {
      localStorage.removeItem('eway_class_view_data');
    }

    if (studentClassViewData) {
      localStorage.setItem('eway_student_view_data', JSON.stringify(studentClassViewData));
    } else {
      localStorage.removeItem('eway_student_view_data');
    }
  }, [currentPage, classViewData, studentClassViewData]);

  const handleLoginSuccess = (role: 'student' | 'teacher' | 'staff' | 'admin') => {
    switch (role) {
      case 'student':
        setCurrentPage('dashboard-student');
        break;
      case 'teacher':
        setCurrentPage('dashboard-teacher');
        break;
      case 'staff':
        setCurrentPage('dashboard-staff');
        break;
      case 'admin':
        setCurrentPage('dashboard-admin');
        break;
    }
  };

  /**
   * Universal Logout Handler
   * Clears all session data and redirects to login.
   */
  const handleLogout = () => {
    localStorage.removeItem('eway_token');
    localStorage.removeItem('eway_user');
    localStorage.removeItem('eway_current_page');
    setCurrentPage('login');
  };

  /**
   * Navigation Handlers for Landing Page
   */

  const handleLoginClick = () => {
    setCurrentPage('login');
    if (window.location.pathname === '/reset-password') {
      window.history.replaceState({}, '', '/');
    }
  };

  const handleRegisterClick = () => {
    setCurrentPage('register');
    if (window.location.pathname === '/reset-password') {
      window.history.replaceState({}, '', '/');
    }
  };

  /**
   * Specialized Navigation Handlers
   * These manage state-based routing for each user role.
   */

  const handleStudentNavigation = (page: string, data?: any) => {
    if (page === 'dashboard') {
      setCurrentPage('dashboard-student');
    } else if (page === 'profile') {
      setCurrentPage('student-profile');
    } else if (page === 'student-id' || page === 'id-card') {
      setCurrentPage('student-id-card');
    } else if (page === 'notifications') {
      setCurrentPage('student-notifications');
    } else if (page === 'classes') {
      setCurrentPage('student-classes');
    } else if (page === 'purchase' || page === 'browse') {
      setCurrentPage('student-purchase');
    } else if (page === 'checkout') {
      setCheckoutData(data);
      setCurrentPage('student-checkout');
    } else if (page === 'tutorials') {
      setCurrentPage('student-tutorials');
    } else if (page === 'study-packs') {
      setCurrentPage('student-study-packs');
    } else if (page === 'pack-preview') {
      setPreviewPackData(data);
      setCurrentPage('student-pack-preview');
    } else if (page === 'pack-checkout') {
      setPackCheckoutData(data);
      setCurrentPage('student-pack-checkout');
    } else if (page === 'teachers') {
      setCurrentPage('student-teachers');
    } else if (page === 'teacher-profile') {
      setTeacherProfileData(data);
      setCurrentPage('student-teacher-profile');
    } else if (page === 'chat') {
      setChatTeacherData(data);
      setCurrentPage('student-chat');
    } else if (page === 'performance') {
      setCurrentPage('student-performance');
    } else if (page === 'student-class-view') {
      setStudentClassViewData(data);
      setCurrentPage('student-class-view');
    } else if (page === 'student-tutorial-player') {
      setStudentClassViewData(data); // Reusing state for tutorialId
      setCurrentPage('student-tutorial-player');
    } else if (page === 'support') {
      setCurrentPage('support');
    } else if (page === 'my-attendance' || page === 'attendance') {
      setCurrentPage('student-attendance');
    } else {
      // Clear transient data when navigating to top-level lists
      setStudentClassViewData(null);
    }
  };

  const handleTeacherNavigation = (page: string, data?: any) => {
    if (page === 'dashboard') {
      setCurrentPage('dashboard-teacher');
    } else if (page === 'profile' || page === 'teacher-profile') {
      setCurrentPage('teacher-profile');
    } else if (page === 'teacher-classes') {
      setCurrentPage('teacher-classes');
    } else if (page === 'teacher-assignments') {
      setCurrentPage('teacher-assignments');
    } else if (page === 'teacher-attendance') {
      setCurrentPage('teacher-attendance');
    } else if (page === 'notifications' || page === 'teacher-notifications') {
      setCurrentPage('teacher-notifications');
    } else if (page === 'teacher-chat') {
      setCurrentPage('teacher-chat');
    } else if (page === 'teacher-study-packs') {
      setCurrentPage('teacher-study-packs');
    } else if (page === 'teacher-study-pack-details') {
      setClassViewData(data); // Reusing classViewData state for packId or create a new one
      setCurrentPage('teacher-study-pack-details');
    } else if (page === 'teacher-class-view') {
      setClassViewData(data);
      setCurrentPage('teacher-class-view');
    } else if (page === 'teacher-tutorials') {
      setCurrentPage('teacher-tutorials');
    } else if (page === 'teacher-tutorial-details') {
      setClassViewData(data);
      setCurrentPage('teacher-tutorial-details');
    } else if (page === 'teacher-reports') {
      setCurrentPage('teacher-reports');
    } else {
      // Clear transient data when navigating to top-level lists
      setClassViewData(null);
    }
  };

  const handleStaffNavigation = (page: string) => {
    if (page === 'dashboard') {
      setCurrentPage('dashboard-staff');
    } else if (page === 'profile') {
      setCurrentPage('staff-profile');
    } else if (page === 'verify-payments') {
      setCurrentPage('verify-payments');
    } else if (page === 'attendance-management') {
      setCurrentPage('attendance-management');
    } else if (page === 'student-cards') {
      setCurrentPage('student-cards');
    } else if (page === 'reports') {
      setCurrentPage('reports');
    } else if (page === 'notifications') {
      setCurrentPage('staff-notifications');
    }
  };

  const handleAdminNavigation = (page: string) => {
    if (page === 'dashboard' || page === 'dashboard-admin') {
      setCurrentPage('dashboard-admin');
    } else if (page === 'user-management') {
      setCurrentPage('admin-users');
    } else if (page === 'chatbot-management') {
      setCurrentPage('admin-chatbot');
    } else if (page === 'content-management' || page === 'admin-content-hub') {
      setCurrentPage('admin-content-hub');
    } else if (page === 'payment-verification' || page === 'verify-payments') {
      setCurrentPage('admin-payment-verification');
    } else if (page === 'notifications') {
      setCurrentPage('admin-notifications');
    } else if (page === 'report-generation' || page === 'reports') {
      setCurrentPage('admin-report-generation');
    } else if (page === 'view-report') {
      setCurrentPage('admin-view-report');
    } else if (page === 'attendance-management' || page === 'attendance') {
      setCurrentPage('admin-activity-log');
    } else if (page === 'my-profile' || page === 'profile') {
      setCurrentPage('admin-my-profile');
    } else {
      // Fallback to dashboard for unknown admin pages
      setCurrentPage('dashboard-admin');
    }
  };

  return (
    <div>
      {/* Only show Navbar on the landing page */}
      {currentPage === 'home' && <Navbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />}
      
      {currentPage === 'home' && (
        <div>
          <HeroSection />
          <AboutSection />
          <FeaturesSection />
          <WorkProcessSection />
          <GallerySection />
          <CTASection />
          <ContactSection />
          <Footer />
        </div>
      )}
      {currentPage === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} onRegisterClick={handleRegisterClick} onForgotPasswordClick={() => setCurrentPage('forgot-password')} />}
      {currentPage === 'register' && <RegistrationPage onLoginClick={handleLoginClick} />}
      {currentPage === 'forgot-password' && <ForgotPasswordFlow onBackToLogin={handleLoginClick} />}
      {currentPage === 'reset-password' && <ResetPasswordPage onBackToLogin={handleLoginClick} />}
      {currentPage === 'dashboard-student' && (
        <StudentDashboardHome onLogout={handleLogout} onNavigate={handleStudentNavigation} />
      )}
      {currentPage === 'student-profile' && (
        <StudentProfile onLogout={handleLogout} onNavigate={handleStudentNavigation} />
      )}
      {currentPage === 'student-id-card' && (
        <StudentIdCard onLogout={handleLogout} onNavigate={handleStudentNavigation} />
      )}
      {currentPage === 'student-notifications' && (
        <NotificationsPage userRole="student" userName="Student" onLogout={handleLogout} onNavigate={handleStudentNavigation} />
      )}
      {currentPage === 'student-classes' && (
        <MyClassesPage onLogout={handleLogout} onNavigate={handleStudentNavigation} />
      )}
      {currentPage === 'student-purchase' && (
        <PurchaseClassesPage onLogout={handleLogout} onNavigate={handleStudentNavigation} />
      )}
      {currentPage === 'student-checkout' && (
        <CheckoutPage onLogout={handleLogout} onNavigate={handleStudentNavigation} courseData={checkoutData} />
      )}
      {currentPage === 'student-tutorials' && (
        <FreeTutorialsPage onLogout={handleLogout} onNavigate={handleStudentNavigation} />
      )}
      {currentPage === 'student-study-packs' && (
        <StudyPacksPage onLogout={handleLogout} onNavigate={handleStudentNavigation} />
      )}
      {currentPage === 'student-pack-preview' && (
        <StudyPackPreviewPage
          onLogout={handleLogout}
          onNavigate={handleStudentNavigation}
          packData={previewPackData}
        />
      )}
      {currentPage === 'student-pack-checkout' && (
        <CheckoutPaymentPage
          onLogout={handleLogout}
          onNavigate={handleStudentNavigation}
          packData={packCheckoutData}
        />
      )}
      {currentPage === 'student-teachers' && (
        <AllTeachersPage onLogout={handleLogout} onNavigate={handleStudentNavigation} />
      )}
      {currentPage === 'student-teacher-profile' && (
        <TeacherProfilePage
          onLogout={handleLogout}
          onNavigate={handleStudentNavigation}
          teacherData={teacherProfileData}
        />
      )}
      {currentPage === 'student-chat' && (
        <ChatWithTeacherPage
          onLogout={handleLogout}
          onNavigate={handleStudentNavigation}
          teacherData={chatTeacherData}
        />
      )}
      {currentPage === 'student-performance' && (
        <MyPerformancePage onLogout={handleLogout} onNavigate={handleStudentNavigation} />
      )}
      {currentPage === 'support' && <SupportPage onLogout={handleLogout} onNavigate={handleStudentNavigation} />}
      {currentPage === 'student-class-view' && (
        <StudentClassViewPage
          classId={studentClassViewData?.classId}
          onLogout={handleLogout}
          onNavigate={handleStudentNavigation}
        />
      )}
      {currentPage === 'dashboard-teacher' && (
        <TeacherDashboardHome onLogout={handleLogout} onNavigate={handleTeacherNavigation} />
      )}
      {currentPage === 'teacher-profile' && (
        <TeacherProfile onLogout={handleLogout} onNavigate={handleTeacherNavigation} />
      )}
      {currentPage === 'teacher-classes' && (
        <TeacherClassesPage onLogout={handleLogout} onNavigate={handleTeacherNavigation} />
      )}
      {currentPage === 'teacher-assignments' && (
        <TeacherAssignmentsPage onLogout={handleLogout} onNavigate={handleTeacherNavigation} />
      )}
      {currentPage === 'teacher-attendance' && (
        <TeacherAttendancePage onLogout={handleLogout} onNavigate={handleTeacherNavigation} />
      )}
      {currentPage === 'teacher-notifications' && (
        <NotificationsPage userRole="teacher" userName="Teacher" onLogout={handleLogout} onNavigate={handleTeacherNavigation} />
      )}
      {currentPage === 'teacher-chat' && (
        <TeacherChatPage onLogout={handleLogout} onNavigate={handleTeacherNavigation} />
      )}
      {currentPage === 'teacher-class-view' && (
        <TeacherClassViewPage 
          classId={classViewData?.id} 
          onLogout={handleLogout} 
          onNavigate={handleTeacherNavigation} 
        />
      )}
      {currentPage === 'dashboard-staff' && (
        <StaffDashboardHome onLogout={handleLogout} onNavigate={handleStaffNavigation} />
      )}
      {currentPage === 'dashboard-admin' && (
        <AdminDashboardHome onLogout={handleLogout} onNavigate={handleAdminNavigation} />
      )}
      {currentPage === 'staff-profile' && (
        <StaffProfile onLogout={handleLogout} onNavigate={handleStaffNavigation} />
      )}
      {currentPage === 'verify-payments' && (
        <VerifyPaymentsPage onLogout={handleLogout} onNavigate={handleStaffNavigation} />
      )}
      {currentPage === 'attendance-management' && (
        <AttendanceManagementPage onLogout={handleLogout} onNavigate={handleStaffNavigation} />
      )}
      {currentPage === 'student-cards' && (
        <StudentCardsPage onLogout={handleLogout} onNavigate={handleStaffNavigation} />
      )}
      {currentPage === 'reports' && (
        <ReportsPage onLogout={handleLogout} onNavigate={handleStaffNavigation} />
      )}
      {currentPage === 'staff-notifications' && (
        <NotificationsPage userRole="staff" userName="Staff" onLogout={handleLogout} onNavigate={handleStaffNavigation} />
      )}
      {currentPage === 'admin-users' && (
        <AdminUserManagement onLogout={handleLogout} onNavigate={handleAdminNavigation} />
      )}
      {currentPage === 'admin-chatbot' && (
        <AdminChatbotManagement onLogout={handleLogout} onNavigate={handleAdminNavigation} />
      )}
      {currentPage === 'admin-content-hub' && (
        <AdminContentHubPage onLogout={handleLogout} onNavigate={handleAdminNavigation} />
      )}
      {currentPage === 'admin-payment-verification' && (
        <AdminPaymentVerification onLogout={handleLogout} onNavigate={handleAdminNavigation} />
      )}
      {currentPage === 'admin-notifications' && (
        <NotificationsPage userRole="admin" userName="Admin" onLogout={handleLogout} onNavigate={handleAdminNavigation} />
      )}
      {currentPage === 'admin-report-generation' && (
        <AdminReportGeneration onLogout={handleLogout} onNavigate={handleAdminNavigation} />
      )}
      {currentPage === 'admin-view-report' && (
        <AdminViewReport onLogout={handleLogout} onNavigate={handleAdminNavigation} />
      )}
      {currentPage === 'admin-activity-log' && (
        <AdminActivityLog onLogout={handleLogout} onNavigate={handleAdminNavigation} />
      )}
      {currentPage === 'admin-my-profile' && (
        <AdminMyProfile onLogout={handleLogout} onNavigate={handleAdminNavigation} />
      )}
      {currentPage === 'teacher-study-packs' && (
        <TeacherStudyPacksPage onLogout={handleLogout} onNavigate={handleTeacherNavigation} />
      )}
      {currentPage === 'teacher-study-pack-details' && (
        <TeacherStudyPackDetailsPage 
          packId={classViewData?.id} 
          onLogout={handleLogout} 
          onNavigate={handleTeacherNavigation} 
        />
      )}
      {currentPage === 'teacher-tutorials' && (
        <TeacherTutorialsPage onLogout={handleLogout} onNavigate={handleTeacherNavigation} />
      )}
      {currentPage === 'teacher-tutorial-details' && (
        <TeacherTutorialDetailsPage 
          tutorialId={classViewData?.id} 
          onLogout={handleLogout} 
          onNavigate={handleTeacherNavigation} 
        />
      )}
      {currentPage === 'student-tutorial-player' && (
        <StudentTutorialPlayerPage 
          tutorialId={studentClassViewData?.id} 
          onLogout={handleLogout} 
          onNavigate={handleStudentNavigation} 
        />
      )}
      {currentPage === 'student-attendance' && (
        <MyAttendancePage onLogout={handleLogout} onNavigate={handleStudentNavigation} />
      )}
      {currentPage === 'teacher-reports' && (
        <TeacherReportsPage onLogout={handleLogout} onNavigate={handleTeacherNavigation} />
      )}
      <Toaster />
    </div>
  );
}

export default App;
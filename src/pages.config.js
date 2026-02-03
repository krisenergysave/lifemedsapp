/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AddAppointment from './pages/AddAppointment';
import AddHealthEntry from './pages/AddHealthEntry';
import AddMedication from './pages/AddMedication';
import AdminDashboard from './pages/AdminDashboard';
import Appointments from './pages/Appointments';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Download from './pages/Download';
import EditMedication from './pages/EditMedication';
import FAQs from './pages/FAQs';
import FamilyMemberDetail from './pages/FamilyMemberDetail';
import FamilyMembers from './pages/FamilyMembers';
import Features from './pages/Features';
import HealthTrackers from './pages/HealthTrackers';
import Home from './pages/Home';
import HowTo from './pages/HowTo';
import MasterMedications from './pages/MasterMedications';
import MedicationsList from './pages/MedicationsList';
import Onboarding from './pages/Onboarding';
import Privacy from './pages/Privacy';
import ProfileSettings from './pages/ProfileSettings';
import Progress from './pages/Progress';
import Reminders from './pages/Reminders';
import Subscription from './pages/Subscription';
import Terms from './pages/Terms';
import Updates from './pages/Updates';
import Verify2FA from './pages/Verify2FA';


export const PAGES = {
    "AddAppointment": AddAppointment,
    "AddHealthEntry": AddHealthEntry,
    "AddMedication": AddMedication,
    "AdminDashboard": AdminDashboard,
    "Appointments": Appointments,
    "Contact": Contact,
    "Dashboard": Dashboard,
    "Download": Download,
    "EditMedication": EditMedication,
    "FAQs": FAQs,
    "FamilyMemberDetail": FamilyMemberDetail,
    "FamilyMembers": FamilyMembers,
    "Features": Features,
    "HealthTrackers": HealthTrackers,
    "Home": Home,
    "HowTo": HowTo,
    "MasterMedications": MasterMedications,
    "MedicationsList": MedicationsList,
    "Onboarding": Onboarding,
    "Privacy": Privacy,
    "ProfileSettings": ProfileSettings,
    "Progress": Progress,
    "Reminders": Reminders,
    "Subscription": Subscription,
    "Terms": Terms,
    "Updates": Updates,
    "Verify2FA": Verify2FA,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};
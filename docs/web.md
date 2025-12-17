# **CRM Web Application \- Detailed UX Specification**

## **Traditional CRM Interface Powered by Natural Language Workflow API**

### **Project Overview**

Building a professional CRM web application that looks and feels like traditional CRM software (Salesforce, HubSpot) but is entirely powered by Scout's natural language workflow API instead of REST endpoints.  
\---

## **User Experience Flow**

### **1\. Authentication & Session Management**

\#\#\#\# Login Screen  
\`\`\`  
┌─────────────────────────────────────────┐  
│ Scout CRM │  
├─────────────────────────────────────────┤  
│ │  
│ Username: \[\] │  
│ API Key: \[\] │  
│ │  
│ \[Login\] \[Enter\] │  
│ │  
└─────────────────────────────────────────┘  
\`\`\`  
**Implementation:**

* Store credentials in \`localStorage\` after successful login

* Validate credentials by calling workflow with test message

* Auto-login on subsequent visits if credentials exist

### **2\. Main CRM Dashboard Layout**

\#\#\#\# Two-Pane Layout

* **Left Sidebar**: Contact list with search functionality

* **Right Main Area**: Dashboard overview or contact details

* **Contact List Features**: Search, status indicators, activity icons

* **Dashboard Features**: Pipeline stats, recent activities, quick actions

### **3\. Contact Detail View**

\#\#\#\# Contact Selected State

* **Contact Information**: Name, email, phone, company, status

* **Contact Actions**: Call, Email, Meeting, Edit, Update Status

* **Recent Activities**: Last 24 hours of interactions

* **Activity Management**: View all activities, log new activities

\---

## **Workflow API Integration Patterns**

### **1\. Application Initialization**

\#\#\#\# Load Dashboard Data  
\`\`\`javascript  
// On app load \- get dashboard overview  
const dashboardData \= await callWorkflow({  
"message": "GET DASHBOARD OVERVIEW WITH CONTACT COUNTS BY STATUS AND RECENT ACTIVITIES LIMIT 5 OUTPUT JSON"  
});  
\`\`\`  
\#\#\#\# Load Contact List  
\`\`\`javascript  
// Load all contacts for left sidebar  
const contactsData \= await callWorkflow({  
"message": "LIST ALL CONTACTS OUTPUT JSON WITH ID NAME EMAIL COMPANY STATUS PHONE RECENT*ACTIVITY*COUNT"  
});  
\`\`\`

### **2\. Contact Detail Loading**

\#\#\#\# Get Contact Details  
\`\`\`javascript  
// When contact clicked in sidebar  
const contactDetails \= await callWorkflow({  
"message": \`GET CONTACT DETAILS FOR ${contactId} WITH ALL FIELDS AND ACTIVITIES FROM LAST 24 HOURS OUTPUT JSON\`  
});  
\`\`\`

### **3\. Natural Language Command Patterns**

\#\#\#\# Dashboard Commands

* "GET DASHBOARD OVERVIEW WITH CONTACT COUNTS BY STATUS AND RECENT ACTIVITIES LIMIT 5 OUTPUT JSON"

* "LIST ALL CONTACTS OUTPUT JSON WITH ID NAME EMAIL COMPANY STATUS PHONE"

* "SEARCH CONTACTS FOR 'acme' OUTPUT JSON WITH ID NAME EMAIL COMPANY STATUS"

\#\#\#\# Contact Detail Commands

* "GET CONTACT DETAILS FOR doc*abc123 WITH ALL FIELDS AND ACTIVITIES FROM LAST 24 HOURS OUTPUT JSON"*

* *"GET ALL ACTIVITIES FOR CONTACT doc*abc123 OUTPUT JSON WITH ID TYPE DESCRIPTION DATE OUTCOME"

* "UPDATE CONTACT doc*abc123 SET STATUS TO prospect"*

*\#\#\#\# Activity Commands*

* *"LOG CALL ACTIVITY FOR CONTACT doc*abc123 DESCRIPTION 'Discussed pricing options' OUTCOME 'Scheduling demo next week'"

* "CREATE NEW CONTACT NAME 'Jane Smith' EMAIL 'jane@newcorp.com' COMPANY 'NewCorp' STATUS 'lead'"

\---

## **Frontend Implementation Architecture**

### **1\. Application State Management**

* Central CRMApp class managing all state  
* Authentication handling with localStorage  
* Parallel data loading for performance  
* Error handling and loading states

### **2\. UI Components**

* **ContactList Component**: Sidebar contact management  
* **MainContent Component**: Dashboard and contact details  
* **Event handling**: Click events, search, form submissions  
* **Dynamic rendering**: Real-time UI updates based on API responses

### **3\. CSS Styling Framework**

* **Grid-based layout**: Two-pane responsive design  
* **Component styling**: Contact cards, status badges, activity items  
* **Professional appearance**: Clean, modern CRM interface  
* **Mobile considerations**: Responsive breakpoints

\---

## **Key Features**

### **Authentication System**

* Username/API key login  
* Credential persistence in localStorage  
* Automatic authentication validation  
* Session management

### **Contact Management**

* Complete contact list in sidebar  
* Real-time search functionality  
* Contact detail view with full information  
* Status management (Lead → Prospect → Customer)  
* Activity history integration

### **Activity Tracking**

* Recent activities display (24-hour window)  
* Activity logging with outcomes  
* Activity type categorization (Call, Email, Meeting, Note)  
* Timeline-based activity view

### **Dashboard Analytics**

* Pipeline overview with status counts  
* Recent activity feed  
* Quick action buttons  
* Performance metrics

### **Natural Language Integration**

* All operations powered by workflow API calls  
* Structured JSON responses  
* Error handling and validation  
* Context-aware command processing

\---

## **Implementation Roadmap**

### **Phase 1: Core Interface**

1. Authentication system with localStorage  
1. Two-pane layout (contacts sidebar \+ main content)  
1. Basic contact list display  
1. Contact selection and detail view  
1. Dashboard with basic stats

### **Phase 2: Interactive Features**

1. Contact search and filtering  
1. Quick action buttons (call, email, meeting)  
1. Activity logging from contact detail view  
1. Real-time data updates  
1. Loading states and error handling

### **Phase 3: Advanced Features**

1. Contact creation and editing forms  
1. Advanced reporting dashboard  
1. Bulk operations  
1. Data export capabilities  
1. Mobile responsiveness

This specification provides a complete blueprint for building a professional CRM application that leverages Scout's natural language workflow API while maintaining familiar CRM UX patterns that users expect.
# **CRM API Integration \- Complete Guide**

## **Scout Workflow API Integration with Natural Language CRM**

### **Project Context & API Configuration**

* **Collection ID**: \`col*cmj9493vs00ko0es6yktgwafg\`*  
* ***Contacts Table ID**: \`tbl*cmj949bkt00kz0es6ysikkxf8\`  
* **Activities Table ID**: \`tbl*cmj949hw500bt0fs660nstrca\`*  
* ***CRM Agent ID**: \`cmj94ed16005r0fs6cgkg1xff\`*  
* ***Workflow ID**: \`wf*cmj94h2ij00010hs6hqatcw6x\` ✅

\---

## **Scout Workflow API Endpoint Configuration**

### **Base API Configuration**

**Workflow Execution Endpoint:**  
\`\`\`  
POST https://api-prod.scoutos.com/v2/workflows/wf*cmj94h2ij00010hs6hqatcw6x/execute*  
*\`\`\`*  
***Required Headers:***  
*\`\`\`javascript*  
*{*  
*"Content-Type": "application/json",*  
*"Authorization": "Bearer {API*KEY}"  
}  
\`\`\`  
**Request Body Structure:**  
\`\`\`javascript  
{  
"message": "Natural language command here",  
"stream": false, // IMPORTANT: Set to false for non-streaming responses  
"context": {  
"user*id": "optional*user*identifier",*  
*"session*id": "optional*session*identifier"  
}  
}  
\`\`\`

### **JavaScript Integration Function**

\`\`\`javascript  
class CRMWorkflowAPI {  
constructor(apiKey) {  
this.workflowId \= 'wf*cmj94h2ij00010hs6hqatcw6x'; // Your workflow ID*  
*this.apiKey \= apiKey;*  
*this.baseURL \= \`https://api-prod.scoutos.com/v2/workflows/${this.workflowId}/execute\`;*  
*}*  
*async executeCommand(message, context \= {}) {*  
*try {*  
*const response \= await fetch(this.baseURL, {*  
*method: 'POST',*  
*headers: {*  
*'Content-Type': 'application/json',*  
*'Authorization': \`Bearer ${this.apiKey}\`*  
*},*  
*body: JSON.stringify({*  
*message: message,*  
*stream: false, // Non-streaming response*  
*context: context*  
*})*  
*});*  
*if (\!response.ok) {*  
*throw new Error(\`HTTP ${response.status}: ${response.statusText}\`);*  
*}*  
*const result \= await response.json();*  
*return this.parseResponse(result);*  
*} catch (error) {*  
*console.error('Workflow API Error:', error);*  
*throw new Error(\`Failed to execute workflow: ${error.message}\`);*  
*}*  
*}*  
*parseResponse(response) {*  
*try {*  
*const content \= response.content || response.message || '';*  
*const jsonMatch \= content.match(/\\\\{\[\\\\s\\\\S\]\\\\}/);*  
*if (jsonMatch) {*  
*return JSON.parse(jsonMatch\[0\]);*  
*}*  
*return { success: true, message: content, data: null };*  
*} catch (parseError) {*  
*return { success: false, error: 'Failed to parse response', rawresponse: response };*  
*}*  
*}*  
*}*  
*// Usage Example \- Now only needs API key\!*  
*const crmAPI \= new CRMWorkflowAPI('YOURAPIKEY');*  
*const result \= await crmAPI.executeCommand(*  
*'LIST ALL CONTACTS OUTPUT JSON WITH ID NAME EMAIL COMPANY STATUS'*  
*);*  
*\`\`\`*  
*\---*

## ***Complete CRUD Operations with Workflow ID***

### ***Contact Management***

*\`\`\`javascript // Create Contact await crmAPI.executeCommand("CREATE NEW CONTACT NAME 'John Smith' EMAIL 'john@acme.com' COMPANY 'Acme Corp' STATUS 'lead' OUTPUT JSON");*  
*// List Contacts*  
*await crmAPI.executeCommand("LIST ALL CONTACTS OUTPUT JSON WITH ID NAME EMAIL COMPANY STATUS PHONE");*  
*// Update Contact*  
*await crmAPI.executeCommand("UPDATE CONTACT docabc123 SET STATUS TO 'customer' OUTPUT JSON");*  
*// Search Contacts*  
*await crmAPI.executeCommand("SEARCH CONTACTS FOR 'acme' OUTPUT JSON WITH ID NAME EMAIL COMPANY STATUS");*  
*// Delete Contact*  
*await crmAPI.executeCommand("DELETE CONTACT docabc123 OUTPUT JSON");*  
*\`\`\`*

### ***Activity Management***

*\`\`\`javascript // Log Activity await crmAPI.executeCommand("LOG CALL ACTIVITY FOR CONTACT docabc123 DESCRIPTION 'Discussed pricing' OUTCOME 'Scheduling demo' OUTPUT JSON");*  
*// Get Activities for Contact*  
*await crmAPI.executeCommand("GET ALL ACTIVITIES FOR CONTACT docabc123 FROM LAST 24 HOURS OUTPUT JSON");*  
*// Update Activity*  
*await crmAPI.executeCommand("UPDATE ACTIVITY docyyy SET OUTCOME TO 'Deal closed' OUTPUT JSON");*  
*// Delete Activity*  
*await crmAPI.executeCommand("DELETE ACTIVITY docyyy OUTPUT JSON");*  
*\`\`\`*

### ***Dashboard & Analytics***

*\`\`\`javascript // Dashboard Overview await crmAPI.executeCommand("GET DASHBOARD OVERVIEW WITH CONTACT COUNTS BY STATUS AND RECENT ACTIVITIES LIMIT 5 OUTPUT JSON");*  
*// Activity Reports*  
*await crmAPI.executeCommand("GENERATE ACTIVITY REPORT FOR THIS WEEK BY TYPE OUTPUT JSON");*  
*// Contact Reports*  
*await crmAPI.executeCommand("SHOW ME CONTACT COUNTS BY STATUS OUTPUT JSON");*  
*\`\`\`*  
*\---*

## ***Testing Commands with cURL***

*\`\`\`bash*

# ***Test Contact List***

*curl \-X POST "https://api-prod.scoutos.com/v2/workflows/wfcmj94h2ij00010hs6hqatcw6x/execute" \\*  
*\-H "Content-Type: application/json" \\*  
*\-H "Authorization: Bearer YOURAPIKEY" \\*  
*\-d '{*  
*"message": "LIST ALL CONTACTS OUTPUT JSON WITH ID NAME EMAIL COMPANY STATUS",*  
*"stream": false*  
*}'*

# ***Test Dashboard***

*curl \-X POST "https://api-prod.scoutos.com/v2/workflows/wfcmj94h2ij00010hs6hqatcw6x/execute" \\ \-H "Content-Type: application/json" \\ \-H "Authorization: Bearer YOURAPIKEY" \\ \-d '{ "message": "GET DASHBOARD OVERVIEW WITH CONTACT COUNTS BY STATUS AND RECENT ACTIVITIES LIMIT 5 OUTPUT JSON", "stream": false }'*

# ***Test Contact Creation***

*curl \-X POST "https://api-prod.scoutos.com/v2/workflows/wfcmj94h2ij00010hs6hqatcw6x/execute" \\ \-H "Content-Type: application/json" \\ \-H "Authorization: Bearer YOURAPIKEY" \\ \-d '{ "message": "CREATE NEW CONTACT NAME \\"Test User\\" EMAIL \\"test@example.com\\" COMPANY \\"Test Corp\\" STATUS \\"lead\\" OUTPUT JSON", "stream": false }' \`\`\`*  
*\---*

## ***Complete HTML Template Ready for ZenBin***

*This template has the workflow ID embedded and is ready to deploy:*  
*\`\`\`html*

# ***Scout CRM***

*Username:*

*API Key:*

*Login*

### ***CONTACTS (0)***

*\`\`\`*  
*\---*

## ***Ready to Deploy\! ✅***

***Workflow ID**: \`wfcmj94h2ij00010hs6hqatcw6x\`*  
***API Endpoint**: \`https://api-prod.scoutos.com/v2/workflows/wf\_cmj94h2ij00010hs6hqatcw6x/execute\`*  
***Stream Setting**: \`"stream": false\` for JSON responses*

1. *Copy the HTML template above*  
1. *Save as a single .html file*  
1. *Deploy to ZenBin*  
1. *Enter your Scout API key to test*

*The workflow ID is now embedded throughout all the code examples\!*
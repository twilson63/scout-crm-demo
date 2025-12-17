/**
 * Natural Language Command Builders for Scout CRM API
 * 
 * These functions construct properly formatted NL commands
 * for the Scout Workflow API.
 */

import type { ActivityType, CreateContactData, LogActivityData } from '../types';

/**
 * List all contacts with standard fields
 * Returns JSON array of contacts
 */
export function listContactsCommand(): string {
  return 'List all contacts from the Contacts table. Return ONLY a JSON code block with format: ```json\n{"contacts": [{"id": "...", "name": "...", "email": "...", "company": "...", "status": "...", "phone": "..."}]}\n``` No other text.';
}

/**
 * Get dashboard overview with stats and recent activities
 * Returns JSON with contact counts and recent activities
 */
export function getDashboardCommand(activityLimit: number = 5): string {
  return `Get a dashboard summary. Count contacts by status (lead, prospect, customer, lost) and get the ${activityLimit} most recent activities. Return ONLY a JSON code block with format: \`\`\`json\n{"contactCounts": {"lead": 0, "prospect": 0, "customer": 0, "lost": 0, "total": 0}, "activityCount": 0, "recentActivities": []}\n\`\`\` No other text.`;
}

/**
 * Get contact details with activities from last 24 hours
 * Returns JSON with contact and activities array
 */
export function getContactDetailsCommand(contactId: string): string {
  return `Get contact details for document ID "${contactId}" including all activities. Return ONLY a JSON code block with format: \`\`\`json\n{"id": "...", "name": "...", "email": "...", "company": "...", "status": "...", "phone": "...", "activities": []}\n\`\`\` No other text.`;
}

/**
 * Get all activities for a contact
 */
export function getContactActivitiesCommand(contactId: string): string {
  return `Get all activities for contact with ID "${contactId}". Return ONLY a JSON code block with format: \`\`\`json\n{"activities": [{"id": "...", "type": "...", "description": "...", "timestamp": "...", "outcome": "..."}]}\n\`\`\` No other text.`;
}

/**
 * Create a new contact
 */
export function createContactCommand(data: CreateContactData): string {
  const contactData = {
    name: data.name,
    email: data.email,
    company: data.company || '',
    phone: data.phone || '',
    status: data.status || 'lead'
  };
  
  return `Create a new contact in the Contacts table with: name="${escapeString(data.name)}", email="${escapeString(data.email)}"${data.company ? `, company="${escapeString(data.company)}"` : ''}${data.phone ? `, phone="${escapeString(data.phone)}"` : ''}, status="${data.status || 'lead'}". Return ONLY a JSON code block with the created contact: \`\`\`json\n{"id": "...", "name": "...", "email": "...", "status": "..."}\n\`\`\` No other text.`;
}

/**
 * Log an activity for a contact
 */
export function logActivityCommand(data: LogActivityData): string {
  return `Log a ${data.type} activity for contact ID "${data.contactId}" with description: "${escapeString(data.description)}"${data.outcome ? ` and outcome: "${escapeString(data.outcome)}"` : ''}. Return ONLY a JSON code block with the created activity: \`\`\`json\n{"id": "...", "contactId": "...", "type": "...", "description": "...", "timestamp": "..."}\n\`\`\` No other text.`;
}

/**
 * Update contact status
 */
export function updateContactStatusCommand(contactId: string, status: string): string {
  return `Update the status of contact "${contactId}" to "${status}". Return ONLY a JSON code block: \`\`\`json\n{"success": true, "id": "...", "status": "..."}\n\`\`\` No other text.`;
}

/**
 * Search contacts by query string
 */
export function searchContactsCommand(query: string): string {
  return `Search contacts matching "${escapeString(query)}". Return ONLY a JSON code block: \`\`\`json\n{"contacts": [{"id": "...", "name": "...", "email": "...", "status": "..."}]}\n\`\`\` No other text.`;
}

/**
 * Escape single quotes in strings for NL commands
 */
function escapeString(value: string): string {
  return value.replace(/'/g, "\\'");
}

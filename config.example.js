/**
 * n8n contact form setup
 * 1. Import n8n/portfolio-contact.workflow.json into n8n
 * 2. Connect Gmail (or SMTP) credentials on the Send Email node
 * 3. Activate the workflow and copy the Production Webhook URL
 * 4. Paste it below (copy this file to config.js if needed)
 *
 * Webhook node → Allowed Origins: your site URL or * (required for browser POST)
 */
window.PORTFOLIO_CONFIG = {
  n8nWebhookUrl: 'https://YOUR-N8N-HOST/webhook/portfolio-contact',
  n8nWebhookSecret: ''
};

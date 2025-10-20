# Webhook System Documentation

## Overview

The chatbot uses a **3-tier webhook priority system** that allows admins to configure webhooks globally or per-user, with automatic fallback to environment variables.

## Webhook Priority (Highest to Lowest)

### 1. 🟣 User-Specific Webhooks (Highest Priority)
- **Where:** Configured in Admin Panel → Webhooks → "Add User Webhook"
- **Storage:** Firestore `webhookConfigs` collection
- **Applies to:** Only the specific user
- **Override:** Completely overrides global and env webhooks for that user
- **Active Toggle:** Can be enabled/disabled without deleting

**Use Case:** Give specific users custom webhook endpoints (e.g., testing, different AI models, regional endpoints)

### 2. 🔵 Global Webhook Settings
- **Where:** Configured in Admin Panel → Webhooks → "Global Webhook Settings"
- **Storage:** Firestore `settings/webhooks` document
- **Applies to:** All users without custom webhooks
- **Override:** Overrides env webhooks, but not user-specific ones

**Use Case:** Change webhooks for all users without redeploying or editing .env

### 3. ⚙️ Environment Variables (Fallback)
- **Where:** `.env` file in project root
- **Variables:**
  - `NEXT_PUBLIC_SEND_MESSAGE_WEBHOOK_URL`
  - `NEXT_PUBLIC_CHAT_HISTORY_WEBHOOK_URL`
- **Applies to:** Users with no custom or global webhooks
- **Override:** Lowest priority, used as fallback

**Use Case:** Default webhooks for new deployments, local development

## How It Works

### When a User Sends a Message:

```
1. Check: Does this user have a custom webhook? (webhookConfigs/{userId})
   ├─ YES & Active → Use custom webhook ✓
   └─ NO ↓

2. Check: Are global webhooks configured? (settings/webhooks)
   ├─ YES → Use global webhooks ✓
   └─ NO ↓

3. Use environment variable webhooks ✓
```

### Visual Indicator

Users see a badge in the chat header showing which webhook source is active:

- **🟣 Custom Webhook** - User has personal webhook configuration
- **🔵 Global Webhook** - Using admin-configured global settings  
- **⚙️ Default Webhook** - Using environment variables

## Admin Panel Features

### 1. Add User Webhook
```
/admin/webhooks → "Add User Webhook" button
```
- Select user from dropdown
- Enter chat webhook URL
- Enter history webhook URL
- Test both webhooks before saving
- Toggle "Active" on/off

### 2. Global Webhook Settings
```
/admin/webhooks → "Global Webhook Settings" card
```
- Set default chat webhook for all users
- Set default history webhook for all users
- Test and save

### 3. Debug Panel
```
/admin/webhooks → Yellow "Debug" card at top
```
Shows current configuration:
- Env webhook URLs
- Global webhook URLs
- Number of active user webhooks

## API Functions

### Get Webhook Config
```typescript
// Get user-specific webhook
const config = await getUserWebhookConfig(userId);

// Get global webhooks
const global = await getGlobalWebhookSettings();
```

### Set Webhook Config
```typescript
// Set user-specific webhook
await upsertWebhookConfig(userId, chatUrl, historyUrl, isActive);

// Set global webhooks
await updateGlobalWebhookSettings(chatUrl, historyUrl);
```

### Delete Webhook Config
```typescript
await deleteWebhookConfig(userId);
```

### Test Webhook
```typescript
const result = await testWebhookUrl(url);
// Returns: { success: boolean, message: string }
```

## Webhook URL Format

### Chat Webhook (must end with `/chat`)
```
https://ai.scopien.com/webhook/{webhook-id}/chat
```
Example:
```
https://ai.scopien.com/webhook/7742abaa-046a-4362-ab28-b89393574ae6/chat
```

### History Webhook (no `/chat` at end)
```
https://ai.scopien.com/webhook/{webhook-id}
```
Example:
```
https://ai.scopien.com/webhook/9b5c21d6-370f-4a03-bed3-3e2b3da92c8b
```

## Example Scenarios

### Scenario 1: New User Login
```
1. User logs in for the first time
2. No custom webhook configured
3. No global webhooks configured
4. System uses .env webhooks ✓
5. Badge shows: "Default Webhook" (gray)
```

### Scenario 2: Admin Sets Global Webhooks
```
1. Admin goes to /admin/webhooks
2. Sets global chat and history URLs
3. Clicks "Save Configuration"
4. All users (without custom webhooks) now use global URLs ✓
5. Badge shows: "Global Webhook" (blue)
```

### Scenario 3: Admin Assigns Custom Webhook to User
```
1. Admin goes to /admin/webhooks
2. Clicks "Add User Webhook"
3. Selects user, enters URLs, sets Active=ON
4. Clicks "Create Webhook"
5. That user now uses custom webhook ✓
6. Other users still use global/env webhooks
7. Badge for custom user shows: "Custom Webhook" (purple)
```

### Scenario 4: Temporarily Disable Custom Webhook
```
1. Admin goes to /admin/webhooks
2. Finds user's webhook, clicks Edit
3. Toggles "Active" to OFF
4. Clicks "Update Webhook"
5. User falls back to global/env webhooks ✓
6. Badge changes to "Global Webhook" or "Default Webhook"
7. Can re-enable later without re-entering URLs
```

## Console Logging

When webhooks are loaded, check browser console for:

```
Using user-specific webhooks
Using global webhook settings
Using environment variable webhooks
```

When sending a message:
```
Sending message to webhook: [URL]
Webhook response status: 200
```

## Troubleshooting

### Custom Webhook Not Working

1. **Check if Active**
   - Go to `/admin/webhooks`
   - Verify webhook shows "Active" badge (green)
   
2. **Test the Webhook**
   - Click "Edit" on the webhook
   - Click "Test" buttons
   - Fix URLs if test fails

3. **Check Browser Console**
   - Open DevTools (F12) → Console
   - Look for "Sending message to webhook: [URL]"
   - Verify it's using the correct URL

4. **Verify URL Format**
   - Chat URL must end with `/chat`
   - History URL must NOT end with `/chat`
   - Use "Use Default" buttons to copy working URLs

### All Users Using Wrong Webhook

1. **Check Global Settings**
   - Go to `/admin/webhooks`
   - Look at "Global Webhook Settings"
   - Update and save if needed

2. **Check Environment Variables**
   - Open `.env` file
   - Verify URLs are correct
   - Restart server after changes

## Best Practices

1. **Start Simple**
   - Use .env webhooks initially
   - Add global webhooks when stable
   - Only add custom webhooks when needed

2. **Test Before Activating**
   - Always click "Test" before saving
   - Verify both chat and history webhooks work

3. **Use "Use Default" Buttons**
   - Prevents typos
   - Copies exact working URLs

4. **Document Custom Webhooks**
   - Note why user has custom webhook
   - Keep track of webhook IDs

5. **Monitor the Badge**
   - Users can see which webhook they're using
   - Helps with debugging

## Security Notes

- Webhook URLs are stored in Firestore
- Only admins can view/edit webhooks
- Webhook test results are shown in UI
- All webhook operations are logged in console


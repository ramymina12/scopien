# Webhook Troubleshooting Guide

## Error: "API Error: 500 Internal Server Error. Body: {"message":"Error in workflow"}"

This error occurs when the webhook URL is correct but the webhook endpoint is having issues processing the request.

### Possible Causes:

1. **Wrong Webhook URL Format**
   - Chat webhook should end with `/chat`
   - History webhook should NOT end with `/chat`
   
   ✅ Correct:
   - Chat: `https://ai.scopien.com/webhook/7742abaa-046a-4362-ab28-b89393574ae6/chat`
   - History: `https://ai.scopien.com/webhook/9b5c21d6-370f-4a03-bed3-3e2b3da92c8b`

2. **Invalid Webhook ID**
   - The webhook ID in the URL might be incorrect or expired
   - Check with your webhook provider for the correct IDs

3. **Webhook Endpoint Issue**
   - The webhook endpoint itself might be down or having issues
   - Try testing the webhook using the "Test" button in admin panel

### How to Debug:

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for messages like:
     - "Sending message to webhook: [URL]"
     - "Using user-specific webhooks" / "Using global webhook settings" / "Using environment variable webhooks"
   
2. **Verify Webhook Priority**
   The system uses webhooks in this order:
   1. User-specific webhook (if active in admin panel)
   2. Global webhook settings (from admin panel)
   3. Environment variables (from .env file)

3. **Test Webhooks**
   - Go to `/admin/webhooks`
   - Click the "Test" button next to each webhook URL
   - Check if it returns success or error

4. **Check Admin Debug Panel**
   - Go to `/admin/webhooks`
   - Look at the yellow "Debug" card at the top
   - Verify which webhooks are configured

### Solutions:

#### Solution 1: Use Environment Variables (Simplest)
1. Make sure `.env` file exists in project root
2. Verify these lines exist:
   ```env
   NEXT_PUBLIC_CHAT_HISTORY_WEBHOOK_URL=https://ai.scopien.com/webhook/9b5c21d6-370f-4a03-bed3-3e2b3da92c8b
   NEXT_PUBLIC_SEND_MESSAGE_WEBHOOK_URL=https://ai.scopien.com/webhook/7742abaa-046a-4362-ab28-b89393574ae6/chat
   ```
3. Restart the dev server: `npm run dev`
4. Don't set any custom webhooks in admin panel

#### Solution 2: Set Global Webhooks
1. Go to `/admin/webhooks`
2. Fill in the "Global Webhook Settings"
3. Click "Test" for each webhook
4. If tests pass, click "Save Configuration"
5. Refresh the chat page

#### Solution 3: Disable User-Specific Webhooks
If you set a custom webhook for a user and it's not working:
1. Go to `/admin/webhooks`
2. Find the user's webhook in the table
3. Click the menu (⋮) → "Edit Webhook"
4. Toggle "Active" to OFF
5. Click "Update Webhook"
6. User will fall back to global/env webhooks

### Verify It's Working:

1. Open browser console (F12)
2. Send a message in chat
3. Check console for:
   ```
   Sending message to webhook: [URL]
   Using [webhook type]
   Webhook response status: 200
   ```
4. If status is 200, webhooks are working!

### Common Mistakes:

❌ **Wrong URL format:**
- Using `/chat` on history webhook
- Missing `/chat` on chat webhook

❌ **Old/expired webhook IDs:**
- Check with webhook provider for current IDs

❌ **Active custom webhook with wrong URL:**
- Disable or fix the user-specific webhook

❌ **Environment variables not loading:**
- Restart dev server after editing `.env`
- Make sure `.env` is in project root

### Need Help?

1. Check browser console for detailed error messages
2. Test webhooks in admin panel before using them
3. Start with environment variables, then add custom webhooks later
4. Contact webhook provider if endpoints return 500 errors


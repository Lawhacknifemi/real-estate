# Email Setup for Purchase Requests

The purchase request feature sends emails to property owners when someone submits a purchase request.

## Setup

1. **Get Brevo API Key** (formerly Sendinblue):
   - Sign up at https://www.brevo.com/
   - Go to Settings → API Keys
   - Create a new API key
   - Copy the API key

2. **Set Environment Variable**:
   Add to your `.env` file in the `real-estate-listing/server/` directory:
   ```env
   MAIL_KEY=your_brevo_api_key_here
   ```

3. **Restart Flask Server**:
   After adding the environment variable, restart your Flask server for changes to take effect.

## How It Works

When a buyer submits a purchase request:
1. The purchase is saved to the database
2. An email is automatically sent to the property owner (realtor)
3. The email includes:
   - Property details (title, location, price)
   - Buyer information (name, email, phone)
   - Buyer's message (if provided)

## Email Template

The email includes:
- Professional HTML formatting
- Property information
- Buyer contact details
- Reply-to set to buyer's email (so realtor can reply directly)

## Troubleshooting

- If emails aren't sending, check:
  - `MAIL_KEY` is set in `.env`
  - Flask server was restarted after adding the key
  - Check Flask server logs for email errors
  - Verify Brevo API key is valid

Note: If `MAIL_KEY` is not configured, purchase requests will still be saved to the database, but emails won't be sent.


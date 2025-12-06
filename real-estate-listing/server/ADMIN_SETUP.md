# Admin Setup Guide

This guide explains how to set up super admin accounts for managing vendors and properties.

## Configuration

Admin access is controlled by the `ADMIN_EMAILS` environment variable in the Flask backend.

### Setting Up Admin Emails

1. **Add to `.env` file** (in `real-estate-listing/server/`):

```bash
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

2. **Or export as environment variable**:

```bash
export ADMIN_EMAILS="admin@example.com,another-admin@example.com"
```

3. **Multiple admins**: Separate emails with commas (no spaces around commas):
   ```
   ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
   ```

## Admin Capabilities

Once configured, admin users can:

### Vendor Management
- **View all vendors** (including inactive ones)
- **Delete vendors** permanently
- **Deactivate vendors** (delist them)
- **Activate vendors** (relist them)

### Property Management
- **View all properties** (including inactive ones)
- **Delete properties** permanently
- **Deactivate properties** (delist them)
- **Activate properties** (relist them)

## Accessing Admin Dashboard

1. Log in with an email that's in the `ADMIN_EMAILS` list
2. Click on your profile menu in the header
3. Click "Admin Dashboard" (only visible to admins)
4. Or navigate directly to `/admin`

## API Endpoints

All admin endpoints require authentication and admin privileges:

### Vendor Management
- `GET /vendors/admin/all` - Get all vendors (with optional `include_inactive` parameter)
- `DELETE /vendors/admin/delete/<vendor_id>` - Delete a vendor
- `PATCH /vendors/admin/deactivate/<vendor_id>` - Deactivate a vendor
- `PATCH /vendors/admin/activate/<vendor_id>` - Activate a vendor

### Property Management
- `GET /property/admin/all` - Get all properties (with optional `include_inactive` parameter)
- `DELETE /property/admin/delete/<property_id>` - Delete a property
- `PATCH /property/admin/deactivate/<property_id>` - Deactivate a property
- `PATCH /property/admin/activate/<property_id>` - Activate a property

### Admin Check
- `GET /admin/check` - Check if current user is an admin

## Security Notes

- Admin access is determined by email address matching
- Email comparison is case-insensitive
- Only users with emails in `ADMIN_EMAILS` can access admin features
- All admin endpoints require valid Firebase authentication token
- Admin status is checked on every request (not cached)

## Troubleshooting

**Admin dashboard not showing:**
1. Verify your email is in `ADMIN_EMAILS` environment variable
2. Restart the Flask server after setting `ADMIN_EMAILS`
3. Log out and log back in to refresh admin status
4. Check browser console for any errors

**"Access Denied" error:**
- Your email is not in the `ADMIN_EMAILS` list
- The environment variable is not set correctly
- The Flask server needs to be restarted


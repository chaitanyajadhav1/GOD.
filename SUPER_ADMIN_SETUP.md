# Super Admin Setup Guide

## How to Create a Super Admin Account

### Method 1: Using the Script (Recommended)

1. Run the create super admin script:
```bash
npm run create-super-admin <email> <password> <mobile_number>
```

**Example:**
```bash
npm run create-super-admin admin@example.com SecurePass123! +919876543210
```

**Or using npx tsx directly:**
```bash
npx tsx scripts/create-super-admin.ts admin@example.com SecurePass123! +919876543210
```

### Method 2: Manual Database Creation

If you prefer to create the super admin manually, you can use Prisma Studio:

```bash
npm run db:studio
```

Then create a user with:
- `email`: Your email address
- `mobile_number`: Your mobile number (format: +919876543210)
- `password_hash`: Hash of your password (use bcrypt with 12 rounds)
- `user_type`: `SUPER_ADMIN`
- `status`: `ACTIVE`

## How to Login as Super Admin

1. **Go to the login page** (usually `http://localhost:3000`)

2. **Select "Super Admin"** from the role selection buttons

3. **Enter your credentials:**
   - **Email**: The email you used when creating the super admin
   - **Password**: The password you set

4. **Click "Login"**

5. You will be redirected to the Super Admin Dashboard where you can:
   - Create hospitals
   - Send invitations to hospital admins
   - Manage all hospitals and users
   - View audit logs

## Password Requirements

The password must meet these requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

## Mobile Number Format

The mobile number should be in one of these formats:
- `9876543210` (10 digits)
- `919876543210` (12 digits with country code)
- `+919876543210` (with + prefix)

The script will automatically normalize it to `+919876543210` format.

## Troubleshooting

### "User already exists" error
- Check if a user with that email or mobile number already exists
- Use a different email or mobile number
- Or update the existing user's type to `SUPER_ADMIN`

### "Invalid credentials" on login
- Make sure you're using the correct email and password
- Check that the user status is `ACTIVE`
- Verify the password hash was created correctly

### Can't see Super Admin option on login page
- Make sure you've pulled the latest code changes
- Clear your browser cache
- Restart the development server

## Security Notes

⚠️ **Important Security Considerations:**

1. **First Super Admin**: The first super admin should be created by the system administrator during initial setup
2. **Strong Password**: Use a strong, unique password for the super admin account
3. **Limited Access**: Only create super admin accounts for trusted personnel
4. **Regular Audits**: Review audit logs regularly to monitor super admin activities
5. **Two-Factor Authentication**: Consider implementing 2FA for super admin accounts in production

## Next Steps After Creating Super Admin

Once you've created and logged in as super admin:

1. **Create your first hospital:**
   - Go to "Hospitals" in the dashboard
   - Click "Create Hospital"
   - Fill in hospital details
   - Enter an admin email (invitation will be sent automatically)

2. **The hospital admin will:**
   - Receive an invitation email
   - Accept the invitation
   - Create their profile
   - Start managing the hospital

3. **Hospital admin can then:**
   - Invite doctors to the hospital
   - Manage hospital users
   - View hospital statistics


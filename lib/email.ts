import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface InvitationEmailParams {
  email: string;
  role: string;
  hospitalName?: string;
  token: string;
  invitedBy: string;
}

export interface DoctorInvitationEmailParams {
  email: string;
  hospitalName: string;
  token: string;
  invitedBy: string;
}

export async function sendInvitationEmail(params: InvitationEmailParams) {
  const { email, role, hospitalName, token, invitedBy } = params;
  
  const invitationLink = `${process.env.NEXTAUTH_URL}/accept-invitation?token=${token}`;

  const mailOptions = {
    from: `"Hospital Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Invitation to join ${hospitalName || 'Hospital Management System'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
            .footer { padding: 20px; text-align: center; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Hospital Management System</h1>
            </div>
            <div class="content">
              <h2>You're Invited!</h2>
              <p>You have been invited by <strong>${invitedBy}</strong> to join 
                 <strong>${hospitalName || 'our hospital management system'}</strong> as a <strong>${role}</strong>.</p>
              
              <p>To accept this invitation and set up your account, please click the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationLink}" class="button">Accept Invitation</a>
              </div>
              
              <p><strong>This invitation will expire in 7 days.</strong></p>
              
              <p>If the button doesn't work, you can copy and paste this link in your browser:</p>
              <p>${invitationLink}</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Invitation email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send invitation email:', error);
    return false;
  }
}

export async function sendDoctorInvitationEmail(params: DoctorInvitationEmailParams) {
  const { email, hospitalName, token, invitedBy } = params;
  
  const invitationLink = `${process.env.NEXTAUTH_URL}/accept-invitation?token=${token}`;

  const mailOptions = {
    from: `"Hospital Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Doctor Invitation - ${hospitalName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 5px; }
            .footer { padding: 20px; text-align: center; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Doctor Invitation</h1>
            </div>
            <div class="content">
              <h2>Join Our Medical Team!</h2>
              <p>You have been invited by <strong>${invitedBy}</strong> to join the medical team at 
                 <strong>${hospitalName}</strong> as a <strong>Doctor</strong>.</p>
              
              <p>As a doctor in our system, you'll be able to:</p>
              <ul>
                <li>Manage patient appointments</li>
                <li>Create and manage prescriptions</li>
                <li>Access patient medical records</li>
                <li>Collaborate with other healthcare professionals</li>
              </ul>
              
              <p>To accept this invitation and set up your doctor profile, please click the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationLink}" class="button">Accept Doctor Invitation</a>
              </div>
              
              <p><strong>This invitation will expire in 7 days.</strong></p>
              
              <p>If the button doesn't work, copy and paste this link:</p>
              <p>${invitationLink}</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Doctor invitation email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send doctor invitation email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string, role: string) {
  const mailOptions = {
    from: `"Hospital Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Hospital Management System',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { padding: 20px; text-align: center; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome Aboard!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Welcome to the Hospital Management System! Your account has been successfully created as a <strong>${role}</strong>.</p>
              
              <p>You can now log in to the system and start managing healthcare operations.</p>
              
              <p>If you have any questions or need assistance, please contact the system administrator.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>Hospital Management System Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return false;
  }
}
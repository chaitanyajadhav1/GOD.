import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOTP(mobileNumber: string, otp: string): Promise<void> {
  try {
    await client.messages.create({
      body: `Your OTP for verification is: ${otp}. It will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber,
    });
  } catch (error) {
    console.error('Twilio error:', error);
    throw new Error('Failed to send OTP');
  }
}

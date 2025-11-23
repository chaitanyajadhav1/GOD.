import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export const redisClient = redis;

export async function setOTP(mobileNumber: string, otp: string): Promise<void> {
  await redisClient.setex(
    `otp:${mobileNumber}`,
    10 * 60, // 10 minutes
    otp
  );
}

export async function getOTP(mobileNumber: string): Promise<string | null> {
  return redisClient.get(`otp:${mobileNumber}`);
}

export async function deleteOTP(mobileNumber: string): Promise<void> {
  await redisClient.del(`otp:${mobileNumber}`);
}
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_SECRET;

const razorpayInstance = keyId && keySecret
  ? new Razorpay({ key_id: keyId, key_secret: keySecret })
  : null;

export default razorpayInstance;
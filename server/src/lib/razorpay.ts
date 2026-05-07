import Razorpay from 'razorpay';

// Singleton instance — imported wherever Razorpay API calls are needed.
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export default razorpay;

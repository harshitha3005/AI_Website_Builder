import razorpayInstance from "../config/razorpay.js";
import { Payment } from "../models/paymentModel.js";
import crypto from 'crypto'
import { User } from "../models/userModel.js";


export const createOrder = async (req, res) => {
    try {
        const { planId, amount, credits } = req.body;
        console.log('createOrder request', {
            userId: req.user?._id,
            planId,
            amount,
            credits,
            auth: req.headers.authorization ? 'present' : 'missing'
        })

        if (!amount || !credits) {
            return res.status(400).json({ message: "Invalid plan data" })
        }

        if (!razorpayInstance) {
            return res.status(503).json({ message: "Payment service is not configured" });
        }

        // Step 1: Create Razorpay order
        const options = {
            amount: Math.round(Number(amount) * 100), // convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);
        console.log("✅ Razorpay Order Created:", razorpayOrder);

        await Payment.create({
            userId: req.user._id,
            planId,
            amount,
            credits,
            razorpayOrderId:razorpayOrder.id,
            status:"pending"
        })
        console.log(razorpayOrder)
        return res.json(razorpayOrder)
    } catch (error) {
         return res.status(500).json({message:error.message})
    }
}

// Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // const userId = req.user._id;

    // ✅ Handle successful payment
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
       return res.status(400).json({message:"Invalid Payment Signature"})
    }

    const payment = await Payment.findOne({
        razorpayOrderId:razorpay_order_id
    })

    if(!payment){
        return res.status(400).json({message:"Payment not found"})
    }
    if(payment.status === "paid"){
        return res.json({message:"Already processed"})
    }

    //update payment record
    payment.status = "paid"
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save()

    //update user credits
    const updateUser = await User.findByIdAndUpdate(
    payment.userId,
    {
        $inc: { credits: payment.credits },
        plan: payment.planId
    },
    { new: true }
)
    res.json({
        success:true,
        message:"Payment Verified and Credit added",
        user:updateUser
    })
  } catch (error) {
    console.error("❌ Error in verifyPayment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a Razorpay Payment Link (hosted checkout)
export const createPaymentLink = async (req, res) => {
    try {
        const { planId, amount, credits } = req.body;
        if (!amount || !credits) {
            return res.status(400).json({ message: "Invalid plan data" })
        }

        if (!razorpayInstance) {
            return res.status(503).json({ message: "Payment service is not configured" });
        }

        const payload = {
            amount: Math.round(Number(amount) * 100),
            currency: 'INR',
            accept_partial: false,
            description: `${planId} - ${credits} credits`,
            reference_id: `pl_${Date.now()}`,
            notes: { planId, credits },
            callback_method: 'get',
            callback_url: `${process.env.FRONTEND_URL}/payment-success`
        }

        const link = await razorpayInstance.paymentLink.create(payload)

        // create a local payment record (status pending)
        await Payment.create({
            userId: req.user._id,
            planId,
            amount,
            credits,
            razorpayOrderId: link.id,
            status: 'pending'
        })

        return res.json(link)
    } catch (error) {
        console.error('Error creating payment link:', error)
        return res.status(500).json({ message: error.message })
    }
}
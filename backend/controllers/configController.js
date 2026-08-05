export const getRazorpayKey = (_, res) => {
  try {
    const key = process.env.RAZORPAY_KEY_ID || null
    return res.json({ key })
  } catch (error) {
    return res.status(500).json({ key: null })
  }
}

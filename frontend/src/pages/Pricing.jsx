import { ArrowLeft, Check, Coins } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice'


const plans = [
    {
        id: "free",
        name: "Free",
        price: '₹0',
        credits: 100,
        description: "Perfect to explore Dora ai",
        features: [
            "AI website generation",
            "Responsive html outputs",
            "Basic animations"
        ],
        popular: false,
        button: "Get Started"
    },
    {
        id: "pro",
        name: "Pro",
        price: '₹499',
        credits: 500,
        description: "For serious creators and freelancers",
        features: [
            "Everything in Free",
            "Faster Generations",
            "Edit and regenerate",
            "Download Source code"
        ],
        popular: true,
        button: "Upgrade to Pro"
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: '₹1499',
        credits: 1000,
        description: "For teams and power users",
        features: [
            "Unlimited Iterations",
            "Highest Priority",
            "Team Collaboration",
            "Dedicated Support"
        ],
        popular: false,
        button: "Contact Sales"
    },
]

const Pricing = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)

    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken')
        return token ? { Authorization: `Bearer ${token}` } : {}
    }

    const fetchPublicKey = async () => {
        try {
            const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID
            if (envKey) return envKey
            const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/config/razorpay`)
            return res.data?.key
        } catch (e) {
            return null
        }
    }

    const handlePayment = async (plan) => {
        if (!userData) {
            alert('Please log in first to upgrade to Pro.')
            navigate('/')
            return
        }
        if (plan.id === "free") {
            navigate("/dashboard")
            return
        }
        try {  
            const amount = plan.id === "enterprise" ? 1499 : 499
            const authHeader = getAuthHeaders()
            const result = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/payment/order`, {
                planId: plan.id,
                amount: amount,
                credits: plan.credits
            }, { withCredentials: true, headers: authHeader })
           

            const key = await fetchPublicKey()
            if (!key) {
                alert('Razorpay public key is missing. Ensure it is set in frontend .env or backend .env and restart the servers.')
                console.error('Missing Razorpay public key (frontend and backend)')
                return
            }

            const options = {
                key: key,
                amount: result.data.amount,
                currency: 'INR',
                name: "Dora ai",
                description: `${plan.name} - ${plan.credits} Credits`,
                order_id: result.data.id,

                handler: async function (response) {
                    console.log(response)
                    const authHeader = getAuthHeaders()
                    const verify = await axios.post(
                        `${import.meta.env.VITE_SERVER_URL}/api/payment/verify`,
                        response,
                        { withCredentials: true, headers: authHeader }
                    )

                    console.log(verify.data)
                    dispatch(setUserData(verify.data.user))

                },
                theme: {
                    color: "#19173d"
                }
            }
            // Open hosted payment link in centered popup to avoid cross-origin iframe overlay
            try {
                const authHeader = getAuthHeaders()
                const linkRes = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/payment/link`, {
                    planId: plan.id,
                    amount: amount,
                    credits: plan.credits
                }, { withCredentials: true, headers: authHeader })

                const url = linkRes.data?.short_url || linkRes.data?.shortUrl || linkRes.data?.long_url || linkRes.data?.longUrl || linkRes.data?.url
                if (url) {
                    const w = 920
                    const h = 500
                    const left = Math.max(0, Math.round((window.screen.width - w) / 2))
                    const top = Math.max(0, Math.round((window.screen.height - h) / 2))
                    window.open(url, 'razorpay_window', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`)
                    return
                }
                // fallback to inline Razorpay if link creation failed
                const rzp = new window.Razorpay(options)
                rzp.open()
            } catch (e) {
                console.error('Payment link creation failed, falling back to inline checkout', e)
                const rzp = new window.Razorpay(options)
                rzp.open()
            }

            // Inject stronger CSS overrides for Razorpay overlay and iframe transparency
            const injectRazorpayOverrides = () => {
                try {
                    if (document.getElementById('razorpay-custom-overrides')) return
                    const css = `
                        /* Dark translucent backdrop for Razorpay overlays */
                        div[id^="razorpay"], div[class*="razorpay"], div[class*="razorpay-checkout"] {
                            background: rgba(0,0,0,0.6) !important;
                            backdrop-filter: blur(6px) !important;
                            -webkit-backdrop-filter: blur(6px) !important;
                        }
                        /* Make Razorpay iframes transparent so page shows behind */
                        iframe[id^="razorpay"], iframe[class*="razorpay"] {
                            background: transparent !important;
                        }
                        /* Replace white inline backgrounds applied by Razorpay */
                        div[style*="background:#fff"], div[style*="background: #fff"], div[style*="background:white"], div[style*="background: white"] {
                            background: rgba(0,0,0,0.6) !important;
                            backdrop-filter: blur(6px) !important;
                        }
                    `
                    const style = document.createElement('style')
                    style.id = 'razorpay-custom-overrides'
                    style.appendChild(document.createTextNode(css))
                    document.head.appendChild(style)

                    // Also perform a quick element-level pass to catch inline elements
                    const quickPatch = () => {
                        const els = Array.from(document.querySelectorAll('div, iframe'))
                        els.forEach((el) => {
                            try {
                                const rect = el.getBoundingClientRect()
                                if (rect.width >= window.innerWidth * 0.9 && rect.height >= window.innerHeight * 0.9) {
                                    el.style.setProperty('background', 'rgba(0,0,0,0.6)', 'important')
                                    el.style.setProperty('backdrop-filter', 'blur(6px)', 'important')
                                    el.style.setProperty('-webkit-backdrop-filter', 'blur(6px)', 'important')
                                }
                            } catch (e) {}
                        })
                    }
                    quickPatch()

                    // Observe DOM changes for a short while to apply the CSS to newly injected nodes
                    const mo = new MutationObserver(() => quickPatch())
                    mo.observe(document.body, { childList: true, subtree: true })
                    setTimeout(() => mo.disconnect(), 8000)
                } catch (e) {
                    // ignore errors
                }
            }

            injectRazorpayOverrides()
        } catch (error) {
            const message = error?.response?.data?.message || error.message || 'Payment request failed'
            console.error('Payment error:', message, error)
            alert(message)
        }
    }
    return (
        <div className='relative min-h-screen overflow-hidden bg-[#050505] text-white px-6 pt-16 pb-24'>
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -left-40 w-125 h-125 bg-indigo-600/20 rounded-full blur-[120px]' />
                <div className='absolute bottom-0 right-0 w-125 h-125 bg-indigo-600/20 rounded-full blur-[120px]' />
            </div>
            <button onClick={() => navigate("/")} className='relative z-10 mb-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition'>
                <ArrowLeft size={16} />
                Back
            </button>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className='relative z-10 max-w-4xl mx-auto text-center mb-14'
            >
                <h1 className='text-4xl md:text-5xl font-bold mb-4'>Simple, transparent pricing</h1>
                <p className='text-zinc-400 text-lg'>Buy credit once. Build anytime.</p>
            </motion.div>

            <div className='relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
                {plans.map((p, i) => (
                    <motion.div
                        key={i}
                        initial={{ oapcity: 0, y: 40 }}
                        whileInView={{ oapcity: 1, y: 0 }}
                        transition={{ delay: i * 0.12 }}
                        whileHover={{ y: -14, scale: 1.03 }}
                        className={`relative rounded-3xl p-8 border backdrop-blur-xl transition-all 
                            ${p.popular ? "border-indigo-500 bg-linear-to-b from-indigo-500/20 to-transparent shadow-2xl shadow-indigo-500/30" :
                                "border-white/10 bg-white/5 hover:border-indigo-400 hover:bg-white/10"}`}
                    >
                        {p.popular && <span className='absolute top-5 right-5 px-3 py-1 text-xs rounded-full bg-indigo-500'>Most Popular</span>}
                        <h1 className='text-xl font-semibold mb-2'>{p.name}</h1>
                        <p className='text-zinc-400 text-sm mb-6'>{p.description}</p>
                        <div className='flex items-end gap-1 mb-4'>
                            <span className='text-4xl font-bold'>{p.price}</span>
                            <span className='text-sm text-zinc-400 mb-1'>/one-time</span>
                        </div>
                        <div className='flex items-center gap-2 mb-8'>
                            <Coins size={18} className='text-yellow-400' />
                            <span className='font-semibold'>{p.credits} Credits</span>
                        </div>
                        <ul className='space-y-3 mb-10'>
                            {p.features.map((f) => (
                                <li key={f} className='flex items-center gap-2 text-sm text-zinc-300'>
                                    <Check size={16} className='text-green-400' />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <motion.button
                            onClick={() => handlePayment(p)}
                            whileTap={{ scale: 0.96 }}
                            className={`w-full py-3 rounded-xl font-semibold transition ${p.popular ? "bg-indigo-500 hover:bg-indigo-600" :
                                "bg-white/10 hover:bg-white/20"} disabled:opacity-60`}
                        >
                            {p.button}
                        </motion.button>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default Pricing
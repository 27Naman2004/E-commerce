import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, selectCurrentUser } from '../redux/slices/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIcon, EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// ─── Validators ───────────────────────────────────────────────────────────────
const isValidEmail = (v) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
const isValidIndianPhone = (v) => /^[6-9]\d{9}$/.test(v); // 10 digits, starts with 6-9

// ─── Slide Animation ──────────────────────────────────────────────────────────
const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

// ─── 6-Box OTP Input ──────────────────────────────────────────────────────────
const OtpBoxes = ({ value, onChange, disabled }) => {
  const refs = useRef([]);

  const handleChange = (e, i) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[i] = digit;
    onChange(arr.join(''));
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div
      role="group"
      aria-label="One-time password input"
      className="flex gap-2.5 justify-center my-6"
      onPaste={handlePaste}
    >
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          id={`otp-box-${i}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          disabled={disabled}
          autoComplete="one-time-code"
          aria-label={`Digit ${i + 1}`}
          className={`
            w-11 h-14 text-center text-xl font-bold rounded-xl border-2
            bg-[#FFF4F7] text-[#35232A] transition-all duration-200 select-none
            focus:outline-none focus:border-[#C94F73] focus:ring-2 focus:ring-pink-200
            disabled:opacity-40 disabled:cursor-not-allowed
            ${value[i] ? 'border-[#8E2948] bg-pink-50' : 'border-pink-200'}
          `}
        />
      ))}
    </div>
  );
};

// ─── Countdown Timer ──────────────────────────────────────────────────────────
const Countdown = ({ totalSeconds, onExpire, resendCooldown }) => {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onExpire]);

  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  const isUrgent = remaining <= 60;

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs text-muted-text">OTP expires in</p>
      <span className={`text-base font-bold tabular-nums ${isUrgent ? 'text-red-500' : 'text-secondary'}`}>
        {m}:{s}
      </span>
    </div>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useSelector(selectCurrentUser);
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => { if (userInfo) navigate(redirect); }, [userInfo, navigate, redirect]);

  // State machine: 'method' | 'input' | 'otp' | 'success'
  const [step, setStep] = useState('method');
  const [method, setMethod] = useState(null); // 'phone' | 'email'
  const [rawInput, setRawInput] = useState(''); // 10-digit phone OR email
  const [inputError, setInputError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [expired, setExpired] = useState(false);
  const resendRef = useRef(null);

  // Formatted identifier for API calls
  const identifier = method === 'phone' ? `+91${rawInput}` : rawInput.toLowerCase();

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const validate = () => {
    if (method === 'phone') {
      if (!isValidIndianPhone(rawInput)) {
        setInputError('Please enter a valid 10-digit Indian mobile number (starting with 6–9).');
        return false;
      }
    } else {
      if (!isValidEmail(rawInput)) {
        setInputError('Please enter a valid email address.');
        return false;
      }
    }
    setInputError('');
    return true;
  };

  const handleSendOtp = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const endpoint = method === 'phone' ? '/auth/send-phone-otp' : '/auth/send-otp';
      const body = method === 'phone' ? { phone: identifier } : { email: identifier };
      await api.post(endpoint, body);

      toast.success(`OTP sent to your ${method === 'phone' ? 'mobile' : 'email'}!`);
      setOtp('');
      setOtpError('');
      setExpired(false);
      setTimerKey((k) => k + 1);
      setResendCooldown(60);
      setStep('otp');
    } catch (err) {
      const msg = err.response?.data?.message || `Unable to send OTP. Please try again.`;
      setInputError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [method, identifier, rawInput]);

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { setOtpError('Please enter the complete 6-digit OTP.'); return; }
    if (expired) { setOtpError('OTP has expired. Please request a new OTP.'); return; }
    setOtpError('');
    setLoading(true);
    try {
      const endpoint = method === 'phone' ? '/auth/verify-phone-otp' : '/auth/verify-otp';
      const body = method === 'phone' ? { phone: identifier, otp } : { email: identifier, otp };
      const res = await api.post(endpoint, body);
      dispatch(setCredentials(res.data));
      setStep('success');
      setTimeout(() => navigate(redirect), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setOtpError(msg);
      if (msg.toLowerCase().includes('expired')) setExpired(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const endpoint = '/auth/resend-otp';
      const body = method === 'phone'
        ? { phone: identifier, type: 'phone' }
        : { email: identifier, type: 'email' };
      await api.post(endpoint, body);
      toast.success('New OTP sent!');
      setOtp('');
      setOtpError('');
      setExpired(false);
      setTimerKey((k) => k + 1);
      setResendCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Renders ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[88vh] flex items-center justify-center bg-[#FFF4F7] px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full shadow border border-pink-100 mb-4">
            <span className="text-2xl">🪷</span>
          </div>
          <h1 className="text-3xl font-playfair font-bold text-secondary">Kanha Collection</h1>
          <p className="text-muted-text text-sm mt-1">Sign in securely — no password needed</p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP: Method Picker ── */}
          {step === 'method' && (
            <motion.div key="method" {...slide} className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8 space-y-4">
              <h2 className="text-lg font-bold text-main-text text-center mb-4">How would you like to sign in?</h2>
              {[
                { m: 'phone', Icon: PhoneIcon, title: 'Continue with Phone', sub: 'OTP to your +91 mobile number' },
                { m: 'email', Icon: EnvelopeIcon, title: 'Continue with Email', sub: 'OTP to your inbox' },
              ].map(({ m, Icon, title, sub }) => (
                <button
                  key={m}
                  onClick={() => { setMethod(m); setRawInput(''); setInputError(''); setStep('input'); }}
                  className="w-full flex items-center gap-4 border-2 border-pink-100 hover:border-primary bg-[#FFF4F7] hover:bg-pink-50 rounded-2xl p-4 transition-all group"
                >
                  <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary transition-colors">
                    <Icon className="w-5 h-5 text-primary group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-main-text text-sm">{title}</p>
                    <p className="text-xs text-muted-text">{sub}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* ── STEP: Identifier Input ── */}
          {step === 'input' && (
            <motion.div key="input" {...slide} className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8">
              <button onClick={() => setStep('method')} className="flex items-center gap-1.5 text-sm text-muted-text hover:text-secondary mb-5 transition-colors">
                <ArrowLeftIcon className="w-4 h-4" /> Back
              </button>

              <h2 className="text-lg font-bold text-main-text mb-1">
                {method === 'phone' ? 'Enter your mobile number' : 'Enter your email address'}
              </h2>
              <p className="text-sm text-muted-text mb-5">
                {method === 'phone'
                  ? 'You will receive a real OTP via SMS'
                  : 'You will receive a real OTP in your inbox'}
              </p>

              {/* Input */}
              <div className="relative">
                {method === 'phone' && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-sm border-r border-pink-200 pr-3 pointer-events-none select-none">
                    +91
                  </span>
                )}
                <input
                  type={method === 'phone' ? 'tel' : 'email'}
                  value={rawInput}
                  autoFocus
                  autoComplete={method === 'phone' ? 'tel-national' : 'email'}
                  onChange={(e) => {
                    const val = method === 'phone'
                      ? e.target.value.replace(/\D/g, '').slice(0, 10)
                      : e.target.value;
                    setRawInput(val);
                    setInputError('');
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendOtp(); }}
                  placeholder={method === 'phone' ? '9876543210' : 'you@example.com'}
                  className={`w-full rounded-2xl py-4 bg-[#FFF4F7] border-2 focus:outline-none focus:ring-2 focus:ring-pink-200 text-main-text transition-all
                    ${method === 'phone' ? 'pl-16 pr-4' : 'px-4'}
                    ${inputError ? 'border-red-400 focus:border-red-400' : 'border-pink-100 focus:border-primary'}
                  `}
                />
              </div>
              {inputError && (
                <p className="text-red-500 text-xs mt-2 flex gap-1 items-start">⚠ {inputError}</p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading || !rawInput}
                className="mt-5 w-full bg-secondary hover:bg-primary text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md text-base"
              >
                {loading ? <><Spinner /> Sending OTP…</> : 'Send OTP →'}
              </button>
            </motion.div>
          )}

          {/* ── STEP: OTP Verification ── */}
          {step === 'otp' && (
            <motion.div key="otp" {...slide} className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8">
              {/* Back / Change number */}
              <button
                onClick={() => { setStep('input'); setOtp(''); setOtpError(''); }}
                className="flex items-center gap-1.5 text-sm text-muted-text hover:text-secondary mb-5 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Change {method === 'phone' ? 'number' : 'email'}
              </button>

              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-50 rounded-full mb-3">
                  {method === 'phone'
                    ? <PhoneIcon className="w-6 h-6 text-primary" />
                    : <EnvelopeIcon className="w-6 h-6 text-primary" />}
                </div>
                <h2 className="text-lg font-bold text-main-text">Enter OTP</h2>
                <p className="text-sm text-muted-text mt-1">
                  Sent to{' '}
                  <span className="font-semibold text-secondary">
                    {method === 'phone' ? `+91 ${rawInput}` : rawInput}
                  </span>
                </p>
              </div>

              <OtpBoxes value={otp} onChange={setOtp} disabled={loading || expired} />

              {otpError && (
                <p className="text-red-500 text-sm text-center mb-3 flex items-center justify-center gap-1">
                  ⚠ {otpError}
                </p>
              )}

              {/* Countdown */}
              {!expired && (
                <Countdown
                  key={timerKey}
                  totalSeconds={300}
                  resendCooldown={resendCooldown}
                  onExpire={() => {
                    setExpired(true);
                    setOtpError('OTP has expired. Please request a new OTP.');
                  }}
                />
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6 || expired}
                className="mt-5 w-full bg-secondary hover:bg-primary text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md text-base"
              >
                {loading ? <><Spinner /> Verifying…</> : 'Verify & Sign In ✓'}
              </button>

              {/* Resend */}
              <div className="text-center mt-4">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-muted-text">
                    Resend in <span className="font-bold text-secondary tabular-nums">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-sm font-bold text-primary hover:text-secondary transition-colors disabled:opacity-50"
                  >
                    ↺ Resend OTP
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP: Success ── */}
          {step === 'success' && (
            <motion.div key="success" {...slide} className="bg-white rounded-3xl shadow-lg border border-pink-100 p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-4"
              >
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-playfair font-bold text-secondary mb-2">Welcome! 🙏</h2>
              <p className="text-muted-text text-sm">Signed in successfully. Redirecting…</p>
            </motion.div>
          )}

        </AnimatePresence>

        <p className="text-center text-xs text-muted-text mt-6">
          By continuing, you agree to our{' '}
          <span className="text-secondary font-medium cursor-pointer hover:underline">Terms of Service</span>
          {' & '}
          <span className="text-secondary font-medium cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;

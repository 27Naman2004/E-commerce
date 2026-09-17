import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const err = {};

    if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Enter a valid email';
    if (form.password.length < 8) err.password = 'Password must be at least 8 characters';
    if (isRegister && !form.fullName.trim()) err.fullName = 'Full name is required';

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setSubmitting(true);
    try {
      if (isRegister) {
        await register({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        });
      } else {
        await login(form.email, form.password);
      }
      navigate('/home');
    } catch (apiErr) {
      const msg = apiErr.response?.data?.message || apiErr.message || 'Authentication failed';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-accent dark:bg-darkAccent transition-colors duration-300 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-surface dark:bg-darkSurface rounded-2xl shadow-xl p-8 border border-borderSoft dark:border-darkBorder hover:border-gold dark:hover:border-darkGold transition-all duration-300"
      >
        <h1 className="font-heading text-3xl text-center font-bold text-primary dark:text-darkPrimary mb-2">
          Kanha Collection
        </h1>
        <p className="text-center font-body text-textMuted dark:text-darkTextMuted mb-6">
          {isRegister ? 'Join our devotional family 🙏' : 'Welcome back 🙏'}
        </p>

        {submitError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg text-center font-body">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-body">
          {isRegister && (
            <div>
              <input
                type="text" placeholder="Full Name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-borderSoft dark:border-darkBorder bg-transparent text-textMain dark:text-darkText focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
              />
              {errors.fullName && <p className="text-xs font-bold text-red-500 mt-1">{errors.fullName}</p>}
            </div>
          )}

          <div>
            <input
              type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-borderSoft dark:border-darkBorder bg-transparent text-textMain dark:text-darkText focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
            />
            {errors.email && <p className="text-xs font-bold text-red-500 mt-1">{errors.email}</p>}
          </div>

          {isRegister && (
            <div>
              <input
                type="tel" placeholder="Phone Number (10 digits)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-borderSoft dark:border-darkBorder bg-transparent text-textMain dark:text-darkText focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
              />
            </div>
          )}

          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'} placeholder="Password (min 8 chars)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-borderSoft dark:border-darkBorder bg-transparent text-textMain dark:text-darkText focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-xl text-textMuted">
              {showPass ? '🙈' : '👁️'}
            </button>
            {errors.password && <p className="text-xs font-bold text-red-500 mt-1">{errors.password}</p>}
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            type="submit" 
            disabled={submitting}
            className="w-full py-3.5 mt-2 rounded-xl bg-primary hover:bg-primaryDark dark:bg-darkPrimary dark:hover:bg-darkPrimaryHover text-white font-bold uppercase tracking-widest shadow-md transition-colors duration-300 disabled:opacity-50"
          >
            {submitting ? (isRegister ? 'Registering...' : 'Logging in...') : (isRegister ? 'Create Account' : 'Login')}
          </motion.button>
        </form>

        <p className="text-center font-body text-sm text-textMuted dark:text-darkTextMuted mt-6">
          {isRegister ? 'Already have an account? ' : 'New here? '}
          <button 
            onClick={() => { setIsRegister(!isRegister); setSubmitError(''); setErrors({}); }} 
            className="text-primary dark:text-darkPrimary font-bold hover:underline"
          >
            {isRegister ? 'Sign In' : 'Create an account'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Enter a valid email';
    if (form.password.length < 6) err.password = 'Password must be 6+ chars';
    setErrors(err);
    if (Object.keys(err).length === 0) {
      localStorage.setItem('kanha-token', 'dummy-token');
      toast.success('✅ Logged in successfully!');
      navigate('/home');
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
        <p className="text-center font-body text-textMuted dark:text-darkTextMuted mb-8">
          Welcome back 🙏
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 font-body">
          <div>
            <input
              type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-borderSoft dark:border-darkBorder bg-transparent text-textMain dark:text-darkText focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all duration-300"
            />
            {errors.email && (
              <p className="text-sm font-bold text-[#C2185B] mt-2">{errors.email}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-borderSoft dark:border-darkBorder bg-transparent text-textMain dark:text-darkText focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all duration-300"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-2xl text-textMuted">
              {showPass ? '🙈' : '👁️'}
            </button>
            {errors.password && (
              <p className="text-sm font-bold text-[#C2185B] mt-2">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
            <label className="flex items-center gap-2 text-textMuted dark:text-darkTextMuted cursor-pointer hover:text-textMain transition-colors">
              <input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer" />
              Remember me
            </label>
            <Link to="#" className="text-primary dark:text-darkPrimary hover:underline font-semibold">
              Forgot password?
            </Link>
          </div>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="w-full py-4 mt-4 rounded-xl bg-primary hover:bg-primaryDark dark:bg-darkPrimary dark:hover:bg-darkPrimaryHover text-white font-bold uppercase tracking-widest shadow-md transition-colors duration-300">
            Login
          </motion.button>
          
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-borderSoft dark:border-darkBorder"></div>
            <span className="flex-shrink-0 mx-4 text-textMuted text-sm font-body">Or</span>
            <div className="flex-grow border-t border-borderSoft dark:border-darkBorder"></div>
          </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} type="button" className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-borderSoft dark:border-darkBorder bg-surface dark:bg-darkSurface text-textMain dark:text-darkText font-bold shadow-sm hover:border-textMain transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </motion.button>
        </form>

        <p className="text-center font-body text-sm text-textMuted dark:text-darkTextMuted mt-8">
          New here?{' '}
          <Link to="#" className="text-primary dark:text-darkPrimary font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

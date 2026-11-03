// src/pages/auth/Login.tsx
import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ------------------------------------------------------------------ */
/* OMA ID helpers                                                     */
/* ------------------------------------------------------------------ */

const looksLikeOma = (raw: string): boolean => {
  if (!raw) return false;
  const s = raw.trim().toLowerCase();
  if (s.startsWith('oma')) return true;
  // Pure digits — user is typing the year / suffix directly
  if (/^\d+$/.test(s)) return true;
  return false;
};

/**
 * Format raw keystrokes into `OMA-YYYY-XXXXXX`.
 * Only digits are kept after the prefix; the year is capped at 4
 * digits and the suffix at 6. Dashes are inserted automatically.
 */
const formatOma = (raw: string): string => {
  // Preserve any leading letters the user typed (o, om, oma)
  // so the caret doesn't collapse to position 0 on the first keystroke.
  const letters = raw.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
  const digits = raw.replace(/\D/g, '');

  if (digits.length === 0) {
    // Still typing letters — don't yet commit to "OMA-"
    return letters;
  }
  const year = digits.slice(0, 4);
  const suffix = digits.slice(4, 10);
  let out = `OMA-${year}`;
  if (suffix.length > 0) out += `-${suffix}`;
  return out;
};

/**
 * Compute where the caret should be, given the ORIGINAL cursor
 * position (before the value was replaced) and the formatted value.
 *
 * The rule: count non-prefix characters (digits) before the caret.
 * Then in the formatted string, place the caret after that many
 * digits. This positions the caret at the "next insertion point" —
 * visually the front of whatever the user is typing.
 */
const caretFront = (
  rawBefore: string,
  formatted: string,
  rawCaret: number
): number => {
  const typedBefore = rawBefore.slice(0, rawCaret);
  const digitsBefore = typedBefore.replace(/\D/g, '').length;

  if (digitsBefore === 0) {
    // No digits yet — caret goes right after the "OMA-" prefix
    // so the user starts typing the year immediately.
    return formatted.startsWith('OMA-') ? 4 : formatted.length;
  }

  // Walk the formatted string, counting digits, and stop after we've
  // passed the same number of digits the user has typed.
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) seen++;
    if (seen === digitsBefore) return i + 1;
  }
  return formatted.length;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const identifierRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });

  const [formErrors, setFormErrors] = useState({
    identifier: '',
    password: '',
  });

  const inOmaMode = useMemo(
    () => looksLikeOma(formData.identifier),
    [formData.identifier]
  );

  /* ---------------------------------------------------------------- */
  /* Validate                                                         */
  /* ---------------------------------------------------------------- */

  const validateForm = () => {
    let isValid = true;
    const errors = { identifier: '', password: '' };

    if (!formData.identifier.trim()) {
      errors.identifier = 'User ID, email, or username is required';
      isValid = false;
    } else if (inOmaMode) {
      const full = formData.identifier.trim();
      if (full.length >= 12 && !/^OMA-\d{4}-\d{6}$/.test(full)) {
        errors.identifier = 'OMA ID must look like OMA-2025-847291';
        isValid = false;
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  /* ---------------------------------------------------------------- */
  /* Identifier change — auto-format with FRONT-aligned caret         */
  /* ---------------------------------------------------------------- */

  const handleIdentifierChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.target;

    // `value` here is already the raw DOM value (React hasn't yet
    // re-rendered with our formatted string). Capture its caret
    // position NOW, before we mutate anything.
    const rawValue = input.value;
    const rawCaret =
      input.selectionStart ?? rawValue.length;

    const isOma = looksLikeOma(rawValue);
    const nextValue = isOma ? formatOma(rawValue) : rawValue;

    setFormData((prev) => ({ ...prev, identifier: nextValue }));
    if (formErrors.identifier) {
      setFormErrors((prev) => ({ ...prev, identifier: '' }));
    }
    if (loginError) setLoginError(null);

    // After React commits the new value, force the caret to the
    // calculated "front" position.
    requestAnimationFrame(() => {
      const el = identifierRef.current;
      if (!el) return;
      if (isOma) {
        const pos = caretFront(rawValue, nextValue, rawCaret);
        el.setSelectionRange(pos, pos);
      } else {
        // Non-OMA mode: keep the caret where the user left it.
        const pos = Math.min(rawCaret, nextValue.length);
        el.setSelectionRange(pos, pos);
      }
    });
  };

  /* ---------------------------------------------------------------- */
  /* Other fields                                                     */
  /* ---------------------------------------------------------------- */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (loginError) setLoginError(null);
  };

  /* ---------------------------------------------------------------- */
  /* Submit                                                           */
  /* ---------------------------------------------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError(null);

    try {
      const response: any = await login({
        identifier: formData.identifier.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      const userType = String(
        response?.user_type ||
          response?.user?.user_type ||
          localStorage.getItem('user_type') ||
          'customer'
      ).toLowerCase();

      if (userType === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userType === 'distributor') {
        navigate('/distributor', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      const data = error?.response?.data;
      const errorMessage =
        data?.error ||
        data?.detail ||
        data?.message ||
        data?.identifier?.[0] ||
        data?.non_field_errors?.[0] ||
        'Invalid credentials. Please try again.';
      setLoginError(String(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <Link to="/" className="inline-block">
            {/* Logo here */}
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your OMA User ID, email, or username
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identifier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID, Email, or Username
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
              <input
                ref={identifierRef}
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleIdentifierChange}
                placeholder="OMA-2025-847291, you@example.com, or username"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode={inOmaMode ? 'numeric' : 'text'}
                className={`w-full px-4 py-3 pl-10 rounded-lg border font-mono tracking-wide ${
                  formErrors.identifier
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amber-500'
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
              />
            </div>
            {formErrors.identifier ? (
              <p className="text-sm text-red-500 mt-1">
                {formErrors.identifier}
              </p>
            ) : inOmaMode ? (
              <p className="text-xs text-amber-600 mt-1">
                Formatting as OMA ID — just type the digits.
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Your OMA ID was sent to your email and phone when you
                registered.
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={`w-full px-4 py-3 pl-10 pr-10 rounded-lg border ${
                  formErrors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amber-500'
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-sm text-red-500 mt-1">
                {formErrors.password}
              </p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              to="/reset-password"
              className="text-sm text-amber-600 hover:text-amber-700 transition-colors duration-200 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error */}
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {loginError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-amber-600 hover:text-amber-700 font-semibold transition-colors duration-200"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
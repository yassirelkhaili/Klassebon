import React, { useState, useMemo } from "react";
import { ShieldCheck, Lock, Eye, Check, ChevronLeft, EyeOff } from 'lucide-react';
import { View } from "../types.ts";
import { api_prefix } from "@klassebon/shared";
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
   baseURL: import.meta.env.VITE_BETTER_AUTH_URL,
})

interface AuthProps {
   onNavigate: (view: View) => void;
}

type RegisterForm = {
   name: string;
   email: string;
   password: string;
   confirmPassword: string;
};

type LoginForm = {
   email: string;
   password: string;
   rememberMe: boolean;
};
type ResetPasswordForm = {
   password: string;
   confirmPassword: string;
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginErrors = Partial<Record<"email" | "password", string>>;
type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;
type ResetPasswordErrors = Partial<Record<keyof ResetPasswordForm, string>>;

function validateRegister(form: RegisterForm): RegisterErrors {
   const errors: RegisterErrors = {};

   if (!form.name.trim()) {
      errors.name = "Name is required";
   }

   if (!form.email.trim()) {
      errors.email = "Email is required";
   } else if (!emailRegex.test(form.email.trim())) {
      errors.email = "Enter a valid email address";
   }

   if (!form.password.trim()) {
      errors.password = "Password is required";
   } else if (form.password.trim().length < 8) {
      errors.password = "Password must be at least 8 characters";
   }

   if (!form.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
   } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
   }

   return errors;
}

function validateLogin(form: LoginForm): LoginErrors {
   const errors: LoginErrors = {};

   if (!form.email.trim()) {
      errors.email = "Email is required";
   } else if (!emailRegex.test(form.email.trim())) {
      errors.email = "Enter a valid email address";
   }

   if (!form.password.trim()) {
      errors.password = "Password is required";
   }

   return errors;
}

function validateResetPassword(form: ResetPasswordForm): ResetPasswordErrors {
   const errors: ResetPasswordErrors = {};

   if (!form.password.trim()) {
      errors.password = "Password is required";
   } else if (form.password.trim().length < 8) {
      errors.password = "Password must be at least 8 characters";
   }

   if (!form.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
   } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
   }

   return errors;
}

export function Login({ onNavigate }: AuthProps) {
   const [form, setForm] = useState<LoginForm>({
      email: "",
      password: "",
      rememberMe: false,
   });

   const [touched, setTouched] = useState({
      email: false,
      password: false,
   });

   const [errors, setErrors] = useState<LoginErrors>({});
   const [serverError, setServerError] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showPassword, setShowPassword] = useState(false);

   const currentErrors = useMemo(() => validateLogin(form), [form]);
   const isFormValid = Object.keys(currentErrors).length === 0;

   const updateField =
      (field: "email" | "password") =>
         (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            const nextForm = {
               ...form,
               [field]: value,
            };

            setForm(nextForm);
            setErrors(validateLogin(nextForm));
            setServerError("");
         };

   const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
         ...prev,
         rememberMe: e.target.checked,
      }));
      setServerError("");
   };

   const handleBlur = (field: "email" | "password") => {
      setTouched((prev) => ({
         ...prev,
         [field]: true,
      }));

      setErrors(validateLogin(form));
   };

   const inputClass = (field: "email" | "password") =>
      [
         "w-full bg-surface-container rounded-xl py-4 px-5 text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-200 outline-none",
         "focus:ring-1 focus:bg-surface-bright",
         touched[field] && errors[field]
            ? "border border-red-500 focus:ring-red-500"
            : "border border-transparent focus:ring-primary",
      ].join(" ");

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const validationErrors = validateLogin(form);
      setErrors(validationErrors);
      setTouched({
         email: true,
         password: true,
      });
      setServerError("");

      if (Object.keys(validationErrors).length > 0) {
         return;
      }

      try {
         setIsSubmitting(true);

         /* const res = await fetch(`${api_prefix}/auth/sign-in/email`, {
             method: "POST",
             headers: {
                "Content-Type": "application/json",
             },
             credentials: "include",
             body: JSON.stringify({
                email: form.email.trim(),
                password: form.password,
                rememberMe: form.rememberMe,
             }),
          });*/

         const result = await authClient.signIn.email(
            {
               email: form.email.trim(),
               password: form.password,
               rememberMe: form.rememberMe,
            },
            {
               onSuccess: () => onNavigate("dashboard"),
               onError: (ctx) => setServerError(ctx.error.message),
            }
         );


         //const raw = await res.clone().text();

         if (result.error) {
            throw new Error(result.error.message || "Login failed");
         }

         onNavigate("dashboard");
      } catch (error) {
         setServerError(
            error instanceof Error ? error.message : "An unknown error occurred"
         );
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-black to-surface-container-low">
         <header className="fixed top-0 w-full flex justify-center items-center py-8">
            <div className="text-2xl font-headline font-bold tracking-tighter text-primary">
               KlasseBon
            </div>
         </header>

         <main className="w-full max-w-[440px] z-10">
            <div className="flex justify-start mb-6">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-label font-semibold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Local Ledger Encryption Active
               </div>
            </div>

            <div className="bg-surface-container-low p-8 md:p-10 rounded-2xl bloom-shadow relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>

               <div className="relative z-10">
                  <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">
                     Welcome back
                  </h1>
                  <p className="text-on-surface-variant text-sm mb-10 font-body">
                     Access your private financial vault securely.
                  </p>

                  <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                     <div className="space-y-2">
                        <label
                           className="block text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest ml-1"
                           htmlFor="email"
                        >
                           Email Address
                        </label>
                        <input
                           id="email"
                           name="email"
                           type="email"
                           autoComplete="username"
                           value={form.email}
                           onChange={updateField("email")}
                           onBlur={() => handleBlur("email")}
                           className={inputClass("email")}
                           placeholder="name@private.ledger"
                        />
                        {touched.email && errors.email && (
                           <p className="px-1 text-sm text-red-400">{errors.email}</p>
                        )}
                     </div>

                     <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                           <label
                              className="block text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest"
                              htmlFor="password"
                           >
                              Password
                           </label>
                        </div>

                        <div className="relative">
                           <input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              value={form.password}
                              onChange={updateField("password")}
                              onBlur={() => handleBlur("password")}
                              className={`${inputClass("password")} pr-14`}
                              placeholder="••••••••"
                           />

                           <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              aria-pressed={showPassword}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                           >
                              {showPassword ? (
                                 <EyeOff className="w-5 h-5" />
                              ) : (
                                 <Eye className="w-5 h-5" />
                              )}
                           </button>
                        </div>

                        {touched.password && errors.password && (
                           <p className="px-1 text-sm text-red-400">{errors.password}</p>
                        )}
                     </div>

                     <div className="flex items-center justify-between py-2">
                        <label className="flex items-center gap-3 cursor-pointer group/check">
                           <div className="relative flex items-center">
                              <input
                                 name="rememberMe"
                                 type="checkbox"
                                 checked={form.rememberMe}
                                 onChange={handleRememberMeChange}
                                 className="peer appearance-none w-5 h-5 rounded-md border-2 border-outline-variant bg-transparent checked:bg-primary-container checked:border-primary transition-all duration-200"
                              />
                              <Check className="absolute text-[14px] text-on-primary-container opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-3 h-3" />
                           </div>
                           <span className="text-sm font-body text-on-surface-variant group-hover/check:text-on-surface transition-colors">
                              Keep me signed in
                           </span>
                        </label>

                        <button
                           type="button"
                           //onClick={() => onNavigate("forgot-password")}
                           className="text-xs font-label font-semibold text-primary hover:text-primary-fixed transition-colors tracking-wide"
                        >
                           Forgot Password?
                        </button>
                     </div>

                     {serverError && (
                        <p className="text-sm text-red-400 px-1">{serverError}</p>
                     )}

                     <button
                        className="w-full bg-gradient-to-br from-primary-container to-primary py-4 rounded-xl text-on-primary font-headline font-bold text-base tracking-wide shadow-lg shadow-primary/10 active:scale-[0.98] transition-all duration-150 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                     >
                        {isSubmitting ? "Signing In..." : "Sign In"}
                     </button>
                  </form>

                  <div className="mt-10 pt-8 border-t border-outline-variant/10 text-center">
                     <p className="text-on-surface-variant text-sm font-body">
                        New to the ledger?
                        <button
                           type="button"
                           onClick={() => onNavigate("register")}
                           className="text-primary font-semibold ml-1 hover:underline underline-offset-4 decoration-primary/30"
                        >
                           Create an account
                        </button>
                     </p>
                  </div>
               </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4">
               <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant/10">
                  <ShieldCheck className="text-primary w-5 h-5 mb-2" />
                  <p className="text-[10px] font-label text-on-surface-variant leading-relaxed">
                     End-to-end encryption for all transaction metadata.
                  </p>
               </div>

               <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant/10">
                  <Lock className="text-primary w-5 h-5 mb-2" />
                  <p className="text-[10px] font-label text-on-surface-variant leading-relaxed">
                     Biometric 2FA supported for mobile sessions.
                  </p>
               </div>
            </div>
         </main>

         <footer className="fixed bottom-0 w-full flex flex-col items-center justify-center gap-4 pb-8">
            <div className="flex gap-6">
               <button className="text-xs font-label text-slate-500 hover:text-slate-300 transition-colors tracking-wide uppercase">
                  Privacy Policy
               </button>
               <button className="text-xs font-label text-slate-500 hover:text-slate-300 transition-colors tracking-wide uppercase">
                  Terms of Service
               </button>
               <button className="text-xs font-label text-slate-500 hover:text-slate-300 transition-colors tracking-wide uppercase">
                  Security
               </button>
            </div>

            <div className="text-[10px] font-label text-slate-500 tracking-widest uppercase opacity-80">
               © 2024 KlasseBon. Secured by The Private Ledger.
            </div>
         </footer>
      </div>
   );
}

export function Register({ onNavigate }: AuthProps) {

   const [form, setForm] = useState<RegisterForm>({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
   });
   const [touched, setTouched] = useState<Record<keyof RegisterForm, boolean>>({
      name: false,
      email: false,
      password: false,
      confirmPassword: false,
   });

   const [errors, setErrors] = useState<RegisterErrors>({});
   const [serverError, setServerError] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);

   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);


   const currentErrors = useMemo(() => validateRegister(form), [form]);
   const isFormValid = Object.keys(currentErrors).length === 0;

   const updateField =
      (field: keyof RegisterForm) =>
         (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            const nextForm = {
               ...form,
               [field]: value,
            };

            setForm(nextForm);
            setErrors(validateRegister(nextForm));
            setServerError("");
         };

   const handleBlur = (field: keyof RegisterForm) => {
      setTouched((prev) => ({
         ...prev,
         [field]: true,
      }));

      setErrors(validateRegister(form));
   };

   const inputClass = (field: keyof RegisterForm) =>
      [
         "w-full bg-surface-container rounded-lg py-3 px-4 text-on-surface placeholder:text-outline transition-all duration-200 outline-none",
         "focus:ring-1 focus:bg-surface-bright",
         touched[field] && errors[field]
            ? "border border-red-500 focus:ring-red-500"
            : "border border-transparent focus:ring-primary",
      ].join(" ");

   const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const validationErrors = validateRegister(form);
      setErrors(validationErrors);
      setTouched({
         name: true,
         email: true,
         password: true,
         confirmPassword: true,
      });
      setServerError("");

      if (Object.keys(validationErrors).length > 0) {
         return;
      }

      try {
         setIsSubmitting(true);

         const result = await authClient.signUp.email({
            email: form.email.trim(),
            password: form.password.trim(),
            name: form.name.trim(),
         });

         if (result.error) {
            throw new Error(result.error.message || "Registration failed");
         }


         onNavigate("login");
      } catch (error) {
         setServerError(
            error instanceof Error ? error.message : "An unknown error occurred"
         );
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-black to-surface-container-low">
         <header className="fixed top-0 w-full flex justify-center items-center py-8">
            <div className="text-2xl font-headline font-bold tracking-tighter text-primary">
               KlasseBon
            </div>
         </header>

         <main className="w-full max-w-md px-6 py-24 flex flex-col items-center">
            <div className="w-full bg-surface-container-low rounded-xl p-8 bloom-shadow relative overflow-hidden group">
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>

               <div className="relative z-10">
                  <div className="mb-8">
                     <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface mb-2">
                        Create Account
                     </h1>
                     <p className="text-on-surface-variant text-sm">
                        Join the private ledger for secure financial management.
                     </p>
                  </div>

                  <form className="space-y-5" onSubmit={handleRegister} noValidate>
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant px-1">
                           Full Name
                        </label>
                        <input
                           name="name"
                           type="text"
                           value={form.name}
                           onChange={updateField("name")}
                           onBlur={() => handleBlur("name")}
                           className={inputClass("name")}
                           placeholder="John Doe"
                           autoComplete="name"
                        />
                        {touched.name && errors.name && (
                           <p className="px-1 text-sm text-red-400">{errors.name}</p>
                        )}
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant px-1">
                           Email Address
                        </label>
                        <input
                           name="email"
                           type="email"
                           value={form.email}
                           onChange={updateField("email")}
                           onBlur={() => handleBlur("email")}
                           className={inputClass("email")}
                           placeholder="name@domain.com"
                           autoComplete="email"
                        />
                        {touched.email && errors.email && (
                           <p className="px-1 text-sm text-red-400">{errors.email}</p>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant px-1">
                              Password
                           </label>
                           <div className="relative">
                              <input
                                 name="password"
                                 type={showPassword ? "text" : "password"}
                                 value={form.password}
                                 onChange={updateField("password")}
                                 onBlur={() => handleBlur("password")}
                                 className={inputClass("password")}
                                 placeholder="••••••••"
                                 autoComplete="new-password"
                              />
                              <button
                                 type="button"
                                 onClick={() => setShowPassword((prev) => !prev)}
                                 aria-label={showPassword ? "Hide password" : "Show password"}
                                 aria-pressed={showPassword}
                                 className="absolute inset-y-0 right-0 px-3 text-on-surface-variant hover:text-on-surface transition-colors"
                              >
                                 {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                 ) : (
                                    <Eye className="w-5 h-5" />
                                 )}
                              </button>
                           </div>
                           {touched.password && errors.password && (
                              <p className="px-1 text-sm text-red-400">{errors.password}</p>
                           )}

                        </div>

                        <div className="space-y-1.5">
                           <label className="text-xs font-medium uppercase tracking-wider text-on-surface-variant px-1">
                              Confirm
                           </label>
                           <input
                              name="confirmPassword"
                              type="password"
                              value={form.confirmPassword}
                              onChange={updateField("confirmPassword")}
                              onBlur={() => handleBlur("confirmPassword")}
                              className={inputClass("confirmPassword")}
                              placeholder="••••••••"
                           />
                           {touched.confirmPassword && errors.confirmPassword && (
                              <p className="px-1 text-sm text-red-400">
                                 {errors.confirmPassword}
                              </p>
                           )}
                        </div>
                     </div>

                     {serverError && (
                        <p className="text-sm text-red-400 px-1">{serverError}</p>
                     )}

                     <button
                        className="w-full mt-4 bg-gradient-to-br from-primary-container to-primary text-on-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/10 transform transition-all active:scale-95 duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                     >
                        {isSubmitting ? "Creating..." : "Create Account"}
                     </button>
                  </form>

                  <div className="mt-8 flex items-center justify-center gap-2 py-3 px-4 bg-secondary-container/30 rounded-lg">
                     <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                     <span className="text-[10px] font-label font-medium uppercase tracking-widest text-on-secondary-container">
                        Local-Only Processing Active
                     </span>
                  </div>

                  <div className="mt-8 text-center space-y-4">
                     <p className="text-sm text-on-surface-variant">
                        Already have an account?
                        <button
                           type="button"
                           onClick={() => onNavigate("login")}
                           className="text-primary font-semibold hover:text-primary-fixed transition-colors underline-offset-4 hover:underline ml-1"
                        >
                           Sign In
                        </button>
                     </p>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}
export function ResetPassword({ onNavigate }: AuthProps) {
   const [form, setForm] = useState<ResetPasswordForm>({
      password: "",
      confirmPassword: "",
   });

   const [touched, setTouched] = useState<Record<keyof ResetPasswordForm, boolean>>({
      password: false,
      confirmPassword: false,
   });

   const [errors, setErrors] = useState<ResetPasswordErrors>({});
   const [serverError, setServerError] = useState("");
   const [successMessage, setSuccessMessage] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   const currentErrors = useMemo(() => validateResetPassword(form), [form]);
   const isFormValid = Object.keys(currentErrors).length === 0;

   const token = new URLSearchParams(window.location.search).get("token") ?? "";

   const updateField =
      (field: keyof ResetPasswordForm) =>
         (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            const nextForm = {
               ...form,
               [field]: value,
            };

            setForm(nextForm);
            setErrors(validateResetPassword(nextForm));
            setServerError("");
            setSuccessMessage("");
         };

   const handleBlur = (field: keyof ResetPasswordForm) => {
      setTouched((prev) => ({
         ...prev,
         [field]: true,
      }));

      setErrors(validateResetPassword(form));
   };

   const inputClass = (field: keyof ResetPasswordForm) =>
      [
         "w-full bg-surface-container rounded-lg py-3 px-4 text-on-surface placeholder:text-outline transition-all duration-200 outline-none",
         "focus:ring-1 focus:bg-surface-bright",
         touched[field] && errors[field]
            ? "border border-red-500 focus:ring-red-500"
            : "border border-transparent focus:ring-primary",
      ].join(" ");

   const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const validationErrors = validateResetPassword(form);
      setErrors(validationErrors);
      setTouched({
         password: true,
         confirmPassword: true,
      });
      setServerError("");
      setSuccessMessage("");

      if (!token) {
         setServerError("Missing or invalid reset token");
         return;
      }

      if (Object.keys(validationErrors).length > 0) {
         return;
      }

      try {
         setIsSubmitting(true);

         const res = await fetch(`${api_prefix}/auth/reset-password`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
               token,
               newPassword: form.password.trim(),
            }),
         });

         const raw = await res.clone().text();

         if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.error || raw || "Password reset failed");
         }

         setSuccessMessage("Your password has been reset successfully.");
         setTimeout(() => {
            onNavigate("login");
         }, 1200);
      } catch (error) {
         setServerError(
            error instanceof Error ? error.message : "An unknown error occurred"
         );
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-black to-surface-container-low">
         <header className="fixed top-0 w-full flex justify-center items-center py-8">
            <div className="text-2xl font-headline font-bold tracking-tighter text-primary">
               KlasseBon
            </div>
         </header>

         <main className="w-full max-w-md px-6 flex flex-col items-center justify-center flex-grow">
            <div className="w-full bg-surface-container-low rounded-xl p-8 md:p-10 bloom-shadow relative overflow-hidden group">
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>

               <div className="mb-8 relative z-10">
                  <h1 className="text-3xl font-headline font-bold tracking-tight text-on-surface mb-3">
                     Set New Password
                  </h1>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                     Enter your new password below to regain access to your private ledger.
                  </p>
               </div>

               <form className="space-y-6 relative z-10" onSubmit={handleResetPassword} noValidate>
                  <div className="space-y-2">
                     <label
                        htmlFor="reset-password"
                        className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider ml-1"
                     >
                        New Password
                     </label>

                     <div className="relative">
                        <input
                           id="reset-password"
                           name="password"
                           type={showPassword ? "text" : "password"}
                           value={form.password}
                           onChange={updateField("password")}
                           onBlur={() => handleBlur("password")}
                           className={`${inputClass("password")} pr-12`}
                           placeholder="••••••••"
                           autoComplete="new-password"
                        />

                        <button
                           type="button"
                           onClick={() => setShowPassword((prev) => !prev)}
                           aria-label={showPassword ? "Hide password" : "Show password"}
                           aria-pressed={showPassword}
                           className="absolute inset-y-0 right-0 px-3 text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                           {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                           ) : (
                              <Eye className="w-5 h-5" />
                           )}
                        </button>
                     </div>

                     {touched.password && errors.password && (
                        <p className="px-1 text-sm text-red-400">{errors.password}</p>
                     )}
                  </div>

                  <div className="space-y-2">
                     <label
                        htmlFor="reset-confirm-password"
                        className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider ml-1"
                     >
                        Confirm Password
                     </label>

                     <div className="relative">
                        <input
                           id="reset-confirm-password"
                           name="confirmPassword"
                           type={showConfirmPassword ? "text" : "password"}
                           value={form.confirmPassword}
                           onChange={updateField("confirmPassword")}
                           onBlur={() => handleBlur("confirmPassword")}
                           className={`${inputClass("confirmPassword")} pr-12`}
                           placeholder="••••••••"
                           autoComplete="new-password"
                        />

                        <button
                           type="button"
                           onClick={() => setShowConfirmPassword((prev) => !prev)}
                           aria-label={
                              showConfirmPassword
                                 ? "Hide password confirmation"
                                 : "Show password confirmation"
                           }
                           aria-pressed={showConfirmPassword}
                           className="absolute inset-y-0 right-0 px-3 text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                           {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                           ) : (
                              <Eye className="w-5 h-5" />
                           )}
                        </button>
                     </div>

                     {touched.confirmPassword && errors.confirmPassword && (
                        <p className="px-1 text-sm text-red-400">{errors.confirmPassword}</p>
                     )}
                  </div>

                  {serverError && (
                     <p className="text-sm text-red-400 px-1">{serverError}</p>
                  )}

                  {successMessage && (
                     <p className="text-sm text-green-400 px-1">{successMessage}</p>
                  )}

                  <button
                     className="w-full mt-4 bg-gradient-to-br from-primary-container to-primary text-on-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/10 transform transition-all active:scale-95 duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                     type="submit"
                     disabled={!isFormValid || isSubmitting}
                  >
                     {isSubmitting ? "Resetting..." : "Update Password"}
                  </button>
               </form>

               <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-center relative z-10">
                  <button
                     type="button"
                     onClick={() => onNavigate("login")}
                     className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-xs font-label uppercase tracking-widest group"
                  >
                     <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                     Back to Sign In
                  </button>
               </div>
            </div>
         </main>

         <footer className="fixed bottom-0 w-full flex flex-col items-center justify-center gap-4 pb-8">
            <div className="flex gap-6">
               <button className="text-xs font-label text-slate-500 hover:text-slate-300 transition-colors tracking-wide uppercase">
                  Privacy Policy
               </button>
               <button className="text-xs font-label text-slate-500 hover:text-slate-300 transition-colors tracking-wide uppercase">
                  Terms of Service
               </button>
               <button className="text-xs font-label text-slate-500 hover:text-slate-300 transition-colors tracking-wide uppercase">
                  Security
               </button>
            </div>

            <p className="text-xs font-label text-slate-500 tracking-widest uppercase opacity-80">
               © 2024 KlasseBon. Secured by The Private Ledger.
            </p>
         </footer>
      </div>
   );
}
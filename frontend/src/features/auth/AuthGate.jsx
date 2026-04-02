import React, { useEffect, useState } from 'react';
import { LoaderCircle, LockKeyhole, LogIn, LogOut, Shield, Terminal, UserRound } from 'lucide-react';
import DashboardApp from '../dashboard/DashboardApp.jsx';
import { AUTH_UNAUTHORIZED_EVENT, fetchCurrentUser, login, logout } from '../../shared/api/client.js';

const clipPathButton = {
  clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
};

const clipPathPanel = {
  clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
};

function AuthShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] font-mono text-[#e0e0e0] selection:bg-[#00f0ff] selection:text-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(252,238,10,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,0,60,0.16),_transparent_32%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-3 py-8 sm:px-4 sm:py-10">
        {children}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <AuthShell>
      <div className="w-full max-w-xl border border-[#00f0ff] bg-[#111] p-5 shadow-[0_0_40px_rgba(0,240,255,0.12)] animate-[fadeIn_0.3s_ease-out] sm:p-8" style={clipPathPanel}>
        <div className="mb-6 flex items-center gap-4 border-b border-[#333] pb-5">
          <div className="bg-[#fcee0a] p-3 text-black shadow-[4px_4px_0_#ff003c]">
            <Terminal className="h-8 w-8" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#00f0ff] drop-shadow-[2px_2px_0_#ff003c] sm:text-3xl">HOK_NEXUS_OS</h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.35em] text-[#fcee0a]">AUTH.GATEWAY // INITIALIZING</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.25em] text-[#00f0ff]">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          正在校验登录状态
        </div>
      </div>
    </AuthShell>
  );
}

function LoginScreen({ form, onChange, onSubmit, errorMessage, isLoggingIn }) {
  return (
    <AuthShell>
      <section className="relative w-full max-w-md border border-[#00f0ff] bg-[#111] p-5 shadow-[0_0_40px_rgba(0,240,255,0.1)] animate-[fadeIn_0.35s_ease-out] sm:p-8" style={clipPathPanel}>
        <div className="absolute left-0 top-0 h-2 w-36 bg-[#ff003c]" />
        <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-[#fcee0a]" />

        <div className="mb-6 flex items-center gap-3 border-b border-[#333] pb-5 sm:mb-8 sm:gap-4 sm:pb-6">
          <div className="bg-[#fcee0a] p-3 text-black shadow-[4px_4px_0_#ff003c]">
            <Shield className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#fcee0a] sm:text-xs sm:tracking-[0.4em]">ACCESS.GATEWAY</p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#00f0ff] drop-shadow-[2px_2px_0_#ff003c] sm:text-4xl">HOK_NEXUS_OS</h1>
          </div>
        </div>

        <h2 className="mb-6 flex items-center gap-2 text-lg font-black uppercase tracking-[0.2em] text-[#00f0ff] sm:mb-8 sm:text-xl sm:tracking-[0.25em]">
          <LogIn className="h-5 w-5" /> 系统登录
        </h2>

        {errorMessage && (
          <div className="mb-6 border border-[#ff003c] bg-[#22020a] px-4 py-3 text-sm font-bold tracking-wide text-[#ff8aa3]">
            AUTH_ERROR // {errorMessage}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
              <UserRound className="h-4 w-4 text-[#00f0ff]" /> 用户名
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={onChange}
              autoComplete="username"
              className="w-full border border-[#333] bg-[#050505] px-4 py-3 text-sm text-[#00f0ff] outline-none transition-colors focus:border-[#00f0ff]"
              placeholder="请输入管理员账号"
              required
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
              <LockKeyhole className="h-4 w-4 text-[#fcee0a]" /> 密码
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              className="w-full border border-[#333] bg-[#050505] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#fcee0a]"
              placeholder="请输入密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="flex w-full items-center justify-center gap-2 bg-[#fcee0a] py-4 font-black uppercase tracking-[0.3em] text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            style={clipPathButton}
          >
            {isLoggingIn ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Terminal className="h-5 w-5" />}
            {isLoggingIn ? '校验中' : '进入主控台'}
          </button>
        </form>
      </section>
    </AuthShell>
  );
}

function SessionDock({ currentUser, onLogout, isLoggingOut }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleBlurCapture = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  };

  return (
    <div
      className="fixed right-3 top-3 z-50 max-w-[calc(100vw-1.5rem)] animate-[fadeIn_0.25s_ease-out] sm:right-5 sm:top-5"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocusCapture={() => setIsOpen(true)}
      onBlurCapture={handleBlurCapture}
    >
      <div className="relative flex justify-end">
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center border border-[#00f0ff] bg-[#111] shadow-[0_0_25px_rgba(0,240,255,0.14)] transition-colors hover:border-[#fcee0a] focus:border-[#fcee0a] focus:outline-none sm:h-[72px] sm:w-[72px]"
          style={clipPathPanel}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <div className="flex h-8 w-8 items-center justify-center bg-[#fcee0a] text-black shadow-[3px_3px_0_#ff003c] sm:h-10 sm:w-10">
            <UserRound className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.1} />
          </div>
        </button>

        <div
          className={`absolute right-0 top-[52px] w-[min(260px,calc(100vw-1.5rem))] border border-[#00f0ff] bg-[#111] p-3.5 shadow-[0_0_25px_rgba(0,240,255,0.14)] transition-all duration-200 sm:top-[64px] sm:w-[260px] sm:p-4 ${
            isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
          }`}
          style={clipPathPanel}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#fcee0a]">AUTH SESSION</p>
          <p className="mt-2 truncate text-xs uppercase tracking-[0.2em] text-[#00f0ff]">@{currentUser.username}</p>

          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="mt-4 flex w-full items-center justify-center gap-2 border border-[#ff003c] bg-[#1a060d] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#ff6f93] transition-colors hover:bg-[#2a0812] disabled:cursor-not-allowed disabled:opacity-70"
            style={clipPathButton}
          >
            {isLoggingOut ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            退出
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [sessionState, setSessionState] = useState('checking');
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
        setSessionState('authenticated');
      } catch (error) {
        if (error.status !== 401) {
          setLoginError(error.message || '登录状态校验失败');
        }
        setSessionState('anonymous');
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      setSessionState('anonymous');
      setLoginForm({ username: '', password: '' });
      setLoginError('登录已过期，请重新登录');
      setIsLoggingIn(false);
      setIsLoggingOut(false);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const handleLoginInputChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const user = await login(loginForm);
      setCurrentUser(user);
      setSessionState('authenticated');
      setLoginForm({ username: '', password: '' });
    } catch (error) {
      setLoginError(error.message || '登录失败');
      setSessionState('anonymous');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
    } finally {
      setCurrentUser(null);
      setSessionState('anonymous');
      setIsLoggingOut(false);
    }
  };

  if (sessionState === 'checking') {
    return <LoadingScreen />;
  }

  if (sessionState !== 'authenticated' || !currentUser) {
    return (
      <LoginScreen
        form={loginForm}
        onChange={handleLoginInputChange}
        onSubmit={handleLogin}
        errorMessage={loginError}
        isLoggingIn={isLoggingIn}
      />
    );
  }

  return (
    <>
      <SessionDock currentUser={currentUser} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      <DashboardApp />
    </>
  );
}



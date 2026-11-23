import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ onOpenNewNote }) {
  const { user, logout } = useAuth();

  // Extract initials for user badge
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EBDADF] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#800020] flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#800020]">
                Burgundy<span className="text-stone-800">Notes</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 bg-[#FAF0F2] text-[#800020] rounded-full border border-[#EBDADF]">
                MERN Stack
              </span>
            </div>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Create Note Button */}
            <button
              onClick={onOpenNewNote}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#800020] hover:bg-[#68031C] active:bg-[#520215] text-white text-sm font-semibold transition-colors duration-150 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">New Note</span>
            </button>

            {/* User Profile Info */}
            <div className="flex items-center pl-2 border-l border-stone-200 space-x-3">
              <div className="flex items-center space-x-2.5">
                <div
                  title={user?.email || user?.name}
                  className="w-9 h-9 rounded-full bg-[#FAF0F2] border border-[#EBDADF] flex items-center justify-center text-[#800020] font-bold text-xs"
                >
                  {getInitials(user?.name)}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-stone-900 leading-tight">
                    {user?.name || 'Authenticated User'}
                  </span>
                  <span className="text-[11px] text-stone-500 leading-tight max-w-[140px] truncate">
                    {user?.email}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log out of session"
                className="p-2 rounded-lg text-stone-500 hover:text-[#800020] hover:bg-[#FAF0F2] transition-colors duration-150 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

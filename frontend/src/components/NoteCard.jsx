import React from 'react';
import { Pin, Edit3, Trash2, Calendar, Tag } from 'lucide-react';

const CATEGORY_COLORS = {
  Personal: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Work: 'bg-blue-50 text-blue-800 border-blue-200',
  Ideas: 'bg-amber-50 text-amber-800 border-amber-200',
  Study: 'bg-purple-50 text-purple-800 border-purple-200',
  General: 'bg-[#FAF0F2] text-[#800020] border-[#EBDADF]',
};

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  // Format formatted timestamp
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const categoryStyle = CATEGORY_COLORS[note.category] || CATEGORY_COLORS.General;

  return (
    <div
      className={`group relative flex flex-col justify-between bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
        note.isPinned
          ? 'border-[#C88A98] shadow-xs ring-1 ring-[#800020]/15'
          : 'border-stone-200 hover:border-[#D4B2BA]'
      }`}
    >
      <div className="p-5">
        {/* Card Header: Category & Pin Action */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${categoryStyle}`}
          >
            <Tag className="w-3 h-3" />
            {note.category}
          </span>

          <button
            onClick={() => onTogglePin(note)}
            title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              note.isPinned
                ? 'bg-[#800020] text-white shadow-xs'
                : 'text-stone-400 hover:text-[#800020] hover:bg-[#FAF0F2]'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Note Title */}
        <h3 className="text-base font-bold text-stone-900 group-hover:text-[#800020] transition-colors leading-snug mb-2 line-clamp-2">
          {note.title}
        </h3>

        {/* Note Content preview */}
        <p className="text-stone-600 text-sm whitespace-pre-line line-clamp-5 leading-relaxed font-normal">
          {note.content}
        </p>
      </div>

      {/* Card Footer: Date & Actions */}
      <div className="px-5 py-3.5 bg-stone-50/70 border-t border-stone-100 rounded-b-xl flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span>{formatDate(note.updatedAt || note.createdAt)}</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(note)}
            title="Edit note"
            className="p-1.5 rounded-md text-stone-500 hover:text-[#800020] hover:bg-[#FAF0F2] transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(note)}
            title="Delete note"
            className="p-1.5 rounded-md text-stone-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

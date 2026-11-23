import React, { useState, useEffect, useCallback } from 'react';
import { notesApi } from '../api/api';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { Search, X, Plus, Pin, FileText, Loader2, AlertCircle } from 'lucide-react';

const CATEGORIES = ['All', 'General', 'Work', 'Personal', 'Ideas', 'Study'];

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch notes from API
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

      const response = await notesApi.getAll(params);
      if (response.data && response.data.success) {
        setNotes(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
      setError(err?.response?.data?.message || 'Could not load your notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  // Save Note (Create or Update)
  const handleSaveNote = async (notePayload) => {
    if (editingNote) {
      // Update
      const res = await notesApi.update(editingNote._id, notePayload);
      if (res.data && res.data.success) {
        setNotes((prev) =>
          prev.map((n) => (n._id === editingNote._id ? res.data.data : n))
        );
      }
    } else {
      // Create
      const res = await notesApi.create(notePayload);
      if (res.data && res.data.success) {
        setNotes((prev) => [res.data.data, ...prev]);
      }
    }
  };

  // Toggle Pin Status
  const handleTogglePin = async (note) => {
    try {
      const updatedPinned = !note.isPinned;
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? { ...n, isPinned: updatedPinned } : n))
      );
      await notesApi.update(note._id, { isPinned: updatedPinned });
      // Re-fetch to guarantee sorting order
      fetchNotes();
    } catch (err) {
      console.error('Failed to update pin status:', err);
      fetchNotes(); // Revert on failure
    }
  };

  // Delete flow
  const handleOpenDeleteModal = (note) => {
    setDeletingNote(note);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingNote) return;
    setIsDeleting(true);
    try {
      await notesApi.delete(deletingNote._id);
      setNotes((prev) => prev.filter((n) => n._id !== deletingNote._id));
      setIsDeleteModalOpen(false);
      setDeletingNote(null);
    } catch (err) {
      console.error('Failed to delete note:', err);
      alert(err?.response?.data?.message || 'Failed to delete note.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Split into Pinned and Other notes
  const pinnedNotes = notes.filter((n) => n.isPinned);
  const regularNotes = notes.filter((n) => !n.isPinned);

  return (
    <div className="min-h-screen bg-[#FAF8F8] flex flex-col">
      {/* Top Navigation */}
      <Navbar onOpenNewNote={handleOpenCreateModal} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls: Search Bar & Category Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by title or content..."
                className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-sm text-stone-900 placeholder-stone-400 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Total count badge */}
            <div className="text-xs font-semibold text-stone-500 bg-white px-3.5 py-2 rounded-xl border border-stone-200 self-start sm:self-auto shadow-xs">
              Total Notes: <span className="text-[#800020] font-bold">{notes.length}</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#800020] text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-[#D4B2BA] hover:text-[#800020]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchNotes}
              className="text-xs font-semibold text-rose-700 underline hover:text-rose-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#800020] mb-3" />
            <p className="text-sm font-medium text-stone-500">Loading your notes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && notes.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF0F2] border border-[#EBDADF] flex items-center justify-center text-[#800020] mx-auto mb-4 shadow-xs">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              {searchQuery || selectedCategory !== 'All' ? 'No matching notes found' : 'No notes yet'}
            </h3>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search terms or filter criteria.'
                : 'Keep your thoughts organized. Create your very first note to get started.'}
            </p>
            {searchQuery || selectedCategory !== 'All' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 text-sm font-semibold text-[#800020] bg-white border border-[#800020] rounded-xl hover:bg-[#FAF0F2] transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#800020] hover:bg-[#68031C] rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Note</span>
              </button>
            )}
          </div>
        )}

        {/* Notes Grid Sections */}
        {!loading && notes.length > 0 && (
          <div className="space-y-8">
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Pin className="w-4 h-4 text-[#800020] fill-[#800020]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#800020]">
                    Pinned Notes ({pinnedNotes.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteModal}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All / Other Notes Section */}
            {regularNotes.length > 0 && (
              <section>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">
                    Other Notes ({regularNotes.length})
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {regularNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteModal}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Note Creation / Edit Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        initialData={editingNote}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        noteTitle={deletingNote?.title}
        isDeleting={isDeleting}
      />
    </div>
  );
}

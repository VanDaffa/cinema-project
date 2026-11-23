import React, { useState } from 'react';
import { HiTrash, HiArrowUturnLeft } from 'react-icons/hi2';

// Kotak jurnal pribadi (skor 1-10 dan catatan singkat)
const JournalPanel = ({
  userRating,
  onRatingChange,
  reviewText,
  onReviewChange,
  isSaving,
  onSave,
  onClear,
  onRemove,
}) => {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const hasNotes = userRating > 0 || reviewText.length > 0;

  return (
    <div className="bg-slate-900/95 rounded-2xl p-6 border border-slate-700/80 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-1 h-5 bg-emerald-500 rounded-full" />
          <span>Jurnal Pribadimu</span>
        </h3>
      </div>

      {/* Skor Pribadi 1 - 10 (klik skor yang sama lagi untuk membatalkan) */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400">Skor Pribadi</span>
          <span className="font-bold text-amber-400">
            {userRating > 0 ? `${userRating} / 10` : 'Belum dinilai'}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => onRatingChange(userRating === score ? 0 : score)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                userRating === score
                  ? 'bg-amber-500 border-amber-400 text-slate-950'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {score}
            </button>
          ))}
        </div>
      </div>

      {/* Catatan Ulasan Singkat */}
      <div className="mb-4">
        <label className="block text-xs text-slate-400 mb-1.5">Catatan Singkat</label>
        <textarea
          rows={3}
          value={reviewText}
          onChange={(e) => onReviewChange(e.target.value)}
          maxLength={2000}
          placeholder="Tulis kesanmu tentang tayangan ini..."
          className="w-full bg-slate-800/90 text-white placeholder-slate-500 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500 resize-none"
        />
      </div>

      <button
        type="button"
        disabled={isSaving}
        onClick={onSave}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
      >
        {isSaving ? 'Menyimpan...' : 'Simpan Rating & Catatan'}
      </button>

      {/* Aksi lanjutan: kosongkan skor & catatan (status tetap), atau hapus dari koleksi */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
        <button
          type="button"
          disabled={isSaving || !hasNotes}
          onClick={onClear}
          className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium py-2 rounded-xl border border-slate-700 transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <HiArrowUturnLeft className="w-3.5 h-3.5" />
          <span>Kosongkan Skor &amp; Catatan</span>
        </button>

        {confirmingRemove ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3">
            <p className="text-xs text-red-200 leading-relaxed mb-2.5">
              Hapus tayangan ini dari koleksimu? Status, skor, dan catatan akan hilang.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={onRemove}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
              >
                Ya, Hapus
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setConfirmingRemove(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 rounded-lg border border-slate-700 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => setConfirmingRemove(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-medium py-2 rounded-xl transition-colors disabled:opacity-40"
          >
            <HiTrash className="w-3.5 h-3.5" />
            <span>Hapus dari Koleksi</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default JournalPanel;

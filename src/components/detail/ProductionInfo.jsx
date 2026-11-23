import React from 'react';
import { getLanguageName } from '../../utils/language';

// localizedTitle: judul Indonesia yang sudah difilter (kosong jika sama dengan judul lain)
const ProductionInfo = ({ detail, mediaType, localizedTitle }) => (
  <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
    <h3 className="text-base font-bold text-white mb-5 pb-3 border-b border-slate-800 flex items-center gap-2.5">
      <span className="w-1 h-5 bg-red-600 rounded-full" />
      <span>Informasi Produksi</span>
    </h3>

    <div className="space-y-4 text-sm">
      <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
        <span className="text-slate-400">Status</span>
        <span className="font-semibold text-right text-slate-100">{detail.status || '-'}</span>
      </div>
      {localizedTitle && (
        <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
          <span className="text-slate-400">Judul Indonesia</span>
          <span className="font-semibold text-right text-slate-100">{localizedTitle}</span>
        </div>
      )}
      <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
        <span className="text-slate-400">Bahasa Asli</span>
        <span className="font-semibold uppercase text-right text-slate-100">
          {getLanguageName(detail.original_language)}
        </span>
      </div>

      {mediaType === 'movie' ? (
        <>
          <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
            <span className="text-slate-400">Anggaran</span>
            <span className="font-semibold text-right text-slate-100">
              {detail.budget > 0 ? `$${detail.budget.toLocaleString('en-US')}` : '-'}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
            <span className="text-slate-400">Pendapatan</span>
            <span className="font-semibold text-right text-slate-100">
              {detail.revenue > 0 ? `$${detail.revenue.toLocaleString('en-US')}` : '-'}
            </span>
          </div>
        </>
      ) : (
        <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
          <span className="text-slate-400">Jaringan</span>
          <span className="font-semibold text-right text-slate-100">
            {detail.networks?.length > 0 ? detail.networks.map((n) => n.name).join(', ') : '-'}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1.5 pt-1">
        <span className="text-slate-400">Studio Produksi</span>
        <span className="font-medium text-slate-200 leading-relaxed">
          {detail.production_companies?.length > 0
            ? detail.production_companies.map((c) => c.name).join(', ')
            : '-'}
        </span>
      </div>
    </div>
  </div>
);

export default ProductionInfo;

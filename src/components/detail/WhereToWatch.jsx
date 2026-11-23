import React from 'react';
import { HiTv, HiArrowTopRightOnSquare } from 'react-icons/hi2';

// Gabungkan platform streaming resmi di Indonesia (prioritas flatrate/langganan)
const buildStreamingList = (watchProviders) => {
  if (!watchProviders) return [];
  const map = new Map();
  const groups = [
    ...(watchProviders.flatrate || []).map((p) => ({ ...p, accessType: 'Streaming' })),
    ...(watchProviders.rent || []).map((p) => ({ ...p, accessType: 'Sewa' })),
    ...(watchProviders.buy || []).map((p) => ({ ...p, accessType: 'Beli' })),
  ];
  groups.forEach((item) => {
    if (!map.has(item.provider_id)) {
      map.set(item.provider_id, item);
    }
  });
  return Array.from(map.values()).slice(0, 8);
};

const WhereToWatch = ({ watchProviders }) => {
  const streamingList = buildStreamingList(watchProviders);

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2.5">
          <span className="w-1 h-5 bg-red-600 rounded-full" />
          <span>Tersedia di (ID)</span>
        </h3>
        <HiTv className="w-4 h-4 text-slate-400" />
      </div>

      {streamingList.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            {streamingList.map((provider) => (
              <div
                key={provider.provider_id}
                className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/70 rounded-xl p-2"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                  alt={provider.provider_name}
                  className="w-8 h-8 rounded-lg shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {provider.provider_name}
                  </p>
                  <p className="text-[10px] text-slate-400">{provider.accessType}</p>
                </div>
              </div>
            ))}
          </div>
          {watchProviders?.link && (
            <a
              href={watchProviders.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              <span>Lihat tautan resmi via TMDB</span>
              <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
            </a>
          )}
        </>
      ) : (
        <p className="text-xs text-slate-400 leading-relaxed">
          Belum tersedia informasi platform streaming resmi untuk wilayah Indonesia.
        </p>
      )}
    </div>
  );
};

export default WhereToWatch;

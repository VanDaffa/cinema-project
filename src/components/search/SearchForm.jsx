import React from 'react';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';

const SearchForm = ({ mediaType, typeLabel, queryInput, onQueryChange, onSubmit, onClear }) => (
  <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 flex-1">
    <div className="relative flex-1">
      <HiMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        placeholder={
          mediaType === 'person'
            ? 'Ketik nama aktor atau aktris yang dicari...'
            : `Ketik judul ${typeLabel.toLowerCase()} yang dicari...`
        }
        value={queryInput}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm rounded-xl pl-10 pr-9 py-2.5 border border-slate-700 focus:outline-none focus:border-red-500 transition-colors"
      />
      {queryInput && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          <HiXMark className="w-4 h-4" />
        </button>
      )}
    </div>
    <button
      type="submit"
      className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors shrink-0"
    >
      Cari
    </button>
  </form>
);

export default SearchForm;

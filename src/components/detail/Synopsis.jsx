import React from 'react';
import SectionHeading from './SectionHeading';

const Synopsis = ({ detail }) => (
  <section className="mb-10">
    <SectionHeading className="mb-4">Sinopsis</SectionHeading>
    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
      {detail.overview || 'Sinopsis belum tersedia untuk tayangan ini.'}
    </p>
    {detail.overviewLanguage === 'en' && (
      <p className="text-xs text-slate-500 mt-3">
        Sinopsis bahasa Indonesia belum tersedia, menampilkan versi bahasa Inggris.
      </p>
    )}
  </section>
);

export default Synopsis;

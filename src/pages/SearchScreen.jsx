import React from 'react';
import { useNavigate } from 'react-router-dom';
import useSearchCatalog from '../hooks/useSearchCatalog';
import useRandomPick from '../hooks/useRandomPick';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchHeader from '../components/search/SearchHeader';
import MediaTypeSwitch from '../components/search/MediaTypeSwitch';
import SearchForm from '../components/search/SearchForm';
import FilterBar from '../components/search/FilterBar';
import CatalogSkeleton from '../components/search/CatalogSkeleton';
import PersonGrid from '../components/search/PersonGrid';
import MediaGrid from '../components/search/MediaGrid';
import Pagination from '../components/search/Pagination';
import EmptyResults from '../components/search/EmptyResults';
import RandomPickModal from '../components/search/RandomPickModal';

const SearchScreen = () => {
  const navigate = useNavigate();
  const search = useSearchCatalog();
  const { mediaType, loading, items, totalPages } = search;

  const { randomPick, isPickingRandom, randomize, clearRandomPick } = useRandomPick({
    mediaType,
    selectedGenre: search.selectedGenre,
    minRating: search.minRating,
  });

  const handleViewRandomPick = () => {
    const targetPath =
      randomPick.media_type === 'tv' ? `/tv/${randomPick.id}` : `/movie/${randomPick.id}`;
    clearRandomPick();
    navigate(targetPath);
  };

  return (
    <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-14">
        <SearchHeader
          pageHeading={search.pageHeading}
          loading={loading}
          typeLabel={search.typeLabel}
          itemCount={items.length}
          totalResults={search.totalResults}
          showRandomizer={mediaType !== 'person'}
          isPickingRandom={isPickingRandom}
          onRandomize={randomize}
        />

        {/* Panel Pencarian, Sakelar 3 Kategori & Filter */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-3">
            <MediaTypeSwitch mediaType={mediaType} onSwitch={search.switchMediaType} />
            <SearchForm
              mediaType={mediaType}
              typeLabel={search.typeLabel}
              queryInput={search.queryInput}
              onQueryChange={search.setQueryInput}
              onSubmit={search.submitSearch}
              onClear={search.clearQuery}
            />
          </div>

          {mediaType !== 'person' && (
            <FilterBar
              genres={search.genres}
              selectedGenre={search.selectedGenre}
              selectedYear={search.selectedYear}
              minRating={search.minRating}
              sortBy={search.sortBy}
              sortDisabled={Boolean(search.activeQuery.trim())}
              onGenreChange={search.changeGenre}
              onYearChange={search.changeYear}
              onRatingChange={search.changeMinRating}
              onSortChange={search.changeSortBy}
              onReset={search.resetFilters}
            />
          )}
        </div>

        {/* Hasil Katalog */}
        {loading ? (
          <CatalogSkeleton />
        ) : items.length > 0 ? (
          <>
            {mediaType === 'person' ? (
              <PersonGrid people={items} />
            ) : (
              <MediaGrid items={items} mediaType={mediaType} />
            )}

            {totalPages > 1 && (
              <Pagination
                page={search.page}
                totalPages={totalPages}
                onPrev={search.goToPreviousPage}
                onNext={search.goToNextPage}
              />
            )}
          </>
        ) : (
          <EmptyResults typeLabel={search.typeLabel} onReset={search.resetFilters} />
        )}
      </main>

      {randomPick && (
        <RandomPickModal
          pick={randomPick}
          isPicking={isPickingRandom}
          onClose={clearRandomPick}
          onRandomizeAgain={randomize}
          onViewDetail={handleViewRandomPick}
        />
      )}

      <Footer />
    </div>
  );
};

export default SearchScreen;

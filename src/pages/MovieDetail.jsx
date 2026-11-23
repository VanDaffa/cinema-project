import React, { useEffect } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import { getDisplayTitle, getSecondaryTitle } from '../utils/title';
import { useAuth } from '../context/AuthContext';
import useMediaDetail from '../hooks/useMediaDetail';
import useJournal from '../hooks/useJournal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DetailSkeleton from '../components/detail/DetailSkeleton';
import DetailNotFound from '../components/detail/DetailNotFound';
import DetailHero from '../components/detail/DetailHero';
import HeroActions from '../components/detail/HeroActions';
import Synopsis from '../components/detail/Synopsis';
import TrailerPlayer from '../components/detail/TrailerPlayer';
import SeasonList from '../components/detail/SeasonList';
import CastCarousel from '../components/detail/CastCarousel';
import JournalPanel from '../components/detail/JournalPanel';
import WhereToWatch from '../components/detail/WhereToWatch';
import ProductionInfo from '../components/detail/ProductionInfo';
import { CollectionSection, RecommendationSection } from '../components/detail/RelatedSections';

const MovieDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const mediaType = location.pathname.startsWith('/tv/') ? 'tv' : 'movie';
  const shouldAutoPlay = searchParams.get('play') === 'true';

  const { user } = useAuth();
  const {
    loading,
    detail,
    cast,
    videos,
    mainTrailerKey,
    recommendations,
    collectionData,
    watchProviders,
  } = useMediaDetail(mediaType, id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, mediaType]);

  const title = getDisplayTitle(detail);
  const releaseDate = detail?.release_date || detail?.first_air_date || '';
  const releaseYear = releaseDate ? releaseDate.slice(0, 4) : 'TBA';
  // Judul pendamping: judul internasional untuk film Indonesia, judul asli untuk film asing
  const secondaryTitle = getSecondaryTitle(detail);
  const localizedTitle = detail?.localizedTitle || '';
  const showLocalizedTitle =
    localizedTitle && localizedTitle !== title && localizedTitle !== secondaryTitle;

  const journal = useJournal({ detail, mediaType, title, releaseDate });

  if (loading) return <DetailSkeleton />;
  if (!detail) return <DetailNotFound />;

  const validSeasons =
    mediaType === 'tv' ? (detail.seasons || []).filter((s) => s.episode_count > 0) : [];

  return (
    <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
      <Navbar />

      <DetailHero
        detail={detail}
        mediaType={mediaType}
        title={title}
        secondaryTitle={secondaryTitle}
        releaseYear={releaseYear}
      >
        <HeroActions
          hasTrailer={Boolean(mainTrailerKey)}
          journalStatus={journal.journalStatus}
          isSaving={journal.isSaving}
          onToggleWatchlist={journal.toggleWatchlist}
          onMarkAsWatched={journal.markAsWatched}
        />
      </DetailHero>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          {/* Kolom Kiri */}
          <div className="flex-1 min-w-0">
            <Synopsis detail={detail} />

            {mainTrailerKey && (
              <TrailerPlayer
                key={`${mediaType}-${detail.id}`}
                videos={videos}
                mainTrailerKey={mainTrailerKey}
                title={title}
                shouldAutoPlay={shouldAutoPlay}
              />
            )}

            {validSeasons.length > 0 && (
              <SeasonList seasons={validSeasons} fallbackPosterPath={detail.poster_path} />
            )}

            {cast.length > 0 && <CastCarousel cast={cast} />}
          </div>

          {/* Kolom Kanan: Jurnal Personal, Platform Streaming & Info Produksi */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            {user && journal.journalStatus && (
              <JournalPanel
                userRating={journal.userRating}
                onRatingChange={journal.setUserRating}
                reviewText={journal.reviewText}
                onReviewChange={journal.setReviewText}
                isSaving={journal.isSaving}
                onSave={journal.saveNotes}
                onClear={journal.clearNotes}
                onRemove={journal.removeFromCollection}
              />
            )}

            <WhereToWatch watchProviders={watchProviders} />

            <ProductionInfo
              detail={detail}
              mediaType={mediaType}
              localizedTitle={showLocalizedTitle ? localizedTitle : ''}
            />
          </aside>
        </div>

        {collectionData && collectionData.parts?.length > 1 && (
          <CollectionSection collection={collectionData} currentId={detail.id} />
        )}

        {recommendations.length > 0 && (
          <RecommendationSection items={recommendations} mediaType={mediaType} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MovieDetail;

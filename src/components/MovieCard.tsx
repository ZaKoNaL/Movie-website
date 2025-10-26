import type { Movie } from '../types/types'

interface MovieCardProps {
  movie: Movie;
  setSelected: (movie: Movie) => void;
}

export default function MovieCard({ movie, setSelected }: MovieCardProps) {
    
  const { title, vote_average, poster_path, release_date, original_language } = movie;
  return (
  <div className='movie-card' onClick={() => setSelected(movie)}>
    <img 
      src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : `/No-Poster-y.png`} 
      alt={title}
      />
    <div className='mt-4'>
      <h3 className='text-lg font-semibold'>{title}</h3>
      <div className='content'>
        <img src="star.svg" alt="Star Icon" />
        <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
        <span>•</span>
        <p className='lang'>{original_language}</p>
        <span>•</span>
        <p className='year'>
          {release_date ? release_date.split('-')[0] : 'N/A'}
        </p>
      </div>
    </div>
  </div>
)
}
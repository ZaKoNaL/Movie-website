import { createPortal } from 'react-dom'
import type { Movie } from '../types/types'
import { useState, useEffect } from 'react'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

interface MovieExtraDetails {
  runtime: number;
  budget: number;
  revenue: number;
  tagline: string;
}

interface ModalProps {
    movie: Movie;
    closeModal: () => void;
}

export default function Modal({ movie, closeModal }: ModalProps) {
    const { id, title, vote_average, poster_path, release_date, overview, genres } = movie;
    const [extras, setExtras] = useState<MovieExtraDetails | null>(null);

    useEffect(() => {
      const fetchExtraDetails = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS);
          if (!response.ok) {
            throw new Error('Failed to fetch movie details');
          }
          const data = await response.json();
          setExtras({
            runtime: data.runtime,
            budget: data.budget,
            revenue: data.revenue,
            tagline: data.tagline,
          });
        } catch (error) {
          console.error(`Error fetching movie details: ${error}`);
        }
      };
      fetchExtraDetails();
    }, [id]);

  return createPortal(
    <div
      className="modal"
      onClick={closeModal}>
      <div
        className="window"
        onClick={(e) => e.stopPropagation()}>
        <section className="flex flex-col overflow-y-auto hide-scrollbar max-h-[calc(80vh-3rem)] pb-6">
          <div className='title'>
              <h2>{movie.title}</h2>
          </div>
          <div className='flex flex-col sm:flex-row gap-6'>
            <div className='w-full sm:w-1/3 sm:max-w-60 flex-shrink-0'>
              <img 
                className='rounded-xl object-top w-full h-auto'
                src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : `/No-Poster-y.png`} 
                alt={title}
              />
            </div>

            <div className="grid grid-cols-[grid-template-columns:clamp(80px,10vw,150px)_1fr] gap-y-4 gap-x-6 text-white/90 auto-rows-min">
              <div className="label">Genres</div>
              <div className="value">{genres.join(', ')}</div>
              <div className="label">Release Date</div>
              <div className="value">{release_date || 'N/A'}</div>
              <div className="label">Rating</div>
              <div className="value">{vote_average.toFixed(1)}/10</div>
              {extras && (<>
                {extras.tagline ? (
                  <>
                    <div className="label">Tagline</div>
                    <div className="value italic">{extras.tagline}</div>
                  </>
                ): null}
                {extras.runtime ? (<>
                  <div className="label">Runtime</div>
                  <div className="value">{extras.runtime} minutes</div>
                </>): null}
                {extras.budget ? (<>
                  <div className="label">Budget</div>
                  <div className="value">{extras.budget ? `$${extras.budget.toLocaleString()}` : 'N/A'}</div>
                </>): null}
                {extras.revenue ? (<>
                  <div className="label">Revenue</div>
                  <div className="value">{extras.revenue ? `$${extras.revenue.toLocaleString()}` : 'N/A'}</div>
                </>): null}
              </>)}
            </div>
          </div>
          <div className='overview'>
            <p>{overview}</p>
          </div>
          
        </section>
      </div>
    </div>,
    document.body
  )
}

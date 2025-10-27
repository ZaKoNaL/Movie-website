'use client'
import { useState, useEffect } from 'react'
import './App.css'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import type { Movie, Genre, TrendingMovie } from './types/types'
import { useDebounce } from './hooks/useDebounce'
import Modal from './components/Modal'
import { updateSearchCount } from './appwrite'
import { getTrendingMovies } from './appwrite'



const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [genres, setGenres] = useState<Record<number, string>>({});

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/genre/movie/list?language=en`, API_OPTIONS);
      if(!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      const data = await response.json();
      const genresMap: Record<number, string> = {};
      data.genres.forEach((genre: Genre) => {
        genresMap[genre.id] = genre.name;
      });
      setGenres(genresMap);
    } catch (error) {
      console.error(`Error fetching genres: ${error}`);
    }
  }

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query 
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
      console.log(data);
      const movies: Movie[] = data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        vote_average: movie.vote_average,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        original_language: movie.original_language,
        overview: movie.overview,
        genres: movie.genre_ids?.map((id: number) => genres[id]).filter(Boolean) || [],
      }));
      setMovieList(movies || []);      

      if (query && movies.length > 0) {
        await updateSearchCount(query, movies[0]);
      }

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(`Error fetching movies. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleTrendingClick = async (movie_id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/movie/${movie_id}`, API_OPTIONS);
      if (!response.ok) throw new Error('Failed to fetch movie');
      const data = await response.json();

      const movie: Movie = {
        id: data.id,
        title: data.title,
        vote_average: data.vote_average,
        poster_path: data.poster_path,
        release_date: data.release_date,
        original_language: data.original_language,
        overview: data.overview,
        genres: data.genre_ids?.map((id: number) => genres[id]).filter(Boolean) || [],
      };

      setSelectedMovie(movie);
    } catch (error) {
      console.error(error);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const dbResults = await getTrendingMovies();
    
      const movies: TrendingMovie[] = dbResults.map(item => ({
        $id: item.$id,
        movie_id: item.movie_id as number,
        poster_url: item.poster_url as string,
        count: item.count as number,
    }));
    setTrendingMovies(movies);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchGenres();
    loadTrendingMovies();
  }, []);

  useEffect(() => {
    Object.keys(genres).length > 0 && fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm, genres]);
  
  return (
    <main>
      <div className='pattern' />

      <div className='wrapper'>
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
        </header>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {trendingMovies.length > 0 && (
        <section className='trending'>
          <h2>Trending Movies</h2>

          <ul>
            {trendingMovies.map((trendingMovie, index) => (
              <li key={trendingMovie.$id}>
                <p>{index + 1}</p>
                <img 
                  src={trendingMovie.poster_url ? `https://image.tmdb.org/t/p/w500/${trendingMovie.poster_url}` : `/No-Poster-y.png`}
                  alt='Poster'
                  onClick={() => handleTrendingClick(trendingMovie.movie_id)}
                />
                <span>{trendingMovie.count} searches</span>
              </li>
            ))}
          </ul>
        </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  setSelected={(movie) => setSelectedMovie(movie)}
                  />
              ))}
            </ul>
          )
        }
        </section>
        {selectedMovie && <Modal movie={selectedMovie} closeModal={() => setSelectedMovie(null)} />}
      </div>
    </main>
  )
}

export default App
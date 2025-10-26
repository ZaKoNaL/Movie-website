    
    export type Movie = {
    id: number;
    title: string;
    vote_average: number;
    poster_path: string;
    release_date: string;
    original_language: string;
    overview: string;
    genres: string[];
    }

    export type Genre = {
    id: number;
    name: string;
    }

    export type TrendingMovie = {
    $id: string;
    count: number;
    movie_id: number;
    poster_url: string;
    };
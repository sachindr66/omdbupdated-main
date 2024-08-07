import React, { useEffect, useState } from 'react';
import './omdb.css/Movies.css';
import { Search } from '@mui/icons-material';
import PosterDetails from './PosterDetails';

const OMDB_API_KEY = '31edf87f'; // Replace with your actual OMDB API key
const MIN_POSTERS_COUNT = 120; // Minimum number of posters to display
const SERIES_TYPE = 'series'; // Filter by movie type

const Series = () => {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null); // State to store selected movie details
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false); // State to manage loading

    useEffect(() => {
        fetchMoviesByType();
    }, []);

    const fetchMoviesByType = async () => {
        try {
            const encodeSearch = encodeURIComponent(SERIES_TYPE); // Encode search term
            const response = await fetch(`https://www.omdbapi.com/?s=${encodeSearch}&type=series&apikey=${OMDB_API_KEY}`);
            const data = await response.json();

            if (data.Search && data.Search.length > 0) {
                // Ensure at least MIN_POSTERS_COUNT posters are displayed
                const initialMovies = data.Search.slice(0, MIN_POSTERS_COUNT);
                setMovies(initialMovies);
                // Fetch more movies if less than MIN_POSTERS_COUNT
                if (initialMovies.length < MIN_POSTERS_COUNT) {
                    await fetchMoreMovies(data.Search.length);
                }
            } else {
                setError('No series found.');
            }
        } catch (err) {
            setError('Failed to fetch series data.');
            console.error(err);
        }
    };

    const fetchMoreMovies = async (startIdx) => {
        try {
            let currentMovies = [...movies];
            let page = 2;
            while (currentMovies.length < MIN_POSTERS_COUNT) {
                const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(SERIES_TYPE)}&type=series&apikey=${OMDB_API_KEY}&page=${page}`);
                const data = await response.json();
                if (data.Search && data.Search.length > 0) {
                    currentMovies = [...currentMovies, ...data.Search];
                }
                page++;
            }
            setMovies(currentMovies.slice(0, MIN_POSTERS_COUNT));
        } catch (err) {
            console.error('Failed to fetch additional movies.', err);
        }
    };

    const handleMovieClick = async (imdbID) => {
        setLoading(true); // Start loading
        try {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}&plot=full`);
            const data = await response.json();

            setSelectedMovie(data); // Store selected movie details in state
        } catch (err) {
            console.error('Failed to fetch series details.', err);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleCloseDetails = () => {
        setSelectedMovie(null); // Reset selected movie details state
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSubmitSearch = async (e) => {
        e.preventDefault();
        if (searchTerm.trim() === '') {
            setError('Please enter a series title to search.');
            return;
        }
        setSelectedMovie(null);
        setLoading(true); // Start loading
        try {
            const encodeSearch = encodeURIComponent(searchTerm.trim()); // Encode search term
            const response = await fetch(`https://www.omdbapi.com/?s=${encodeSearch}&apikey=${OMDB_API_KEY}`);
            const data = await response.json();

            if (data.Search && data.Search.length > 0) {
                setMovies(data.Search.slice(0, MIN_POSTERS_COUNT));
                setError('');
            } else {
                setMovies([]);
                setError('No series found. Please check the spelling and try again.');
            }
        } catch (err) {
            setError('Please check your internet connection.');
            console.error('Error searching for movies:', err);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className='movies'>
            <form onSubmit={handleSubmitSearch} className="forms">
                <div className="movie_input">
                    <input
                        type="text"
                        placeholder="Search for series..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className='inputs'
                    />
                    <button className="movie_btn" type="submit">
                        <i><Search /></i>
                    </button>
                </div>
            </form>
            {error && <p>{error}</p>}
            {loading ? (
                <p>Loading...</p>
            ) : selectedMovie ? (
                <PosterDetails selectedMovie={selectedMovie} handleCloseDetails={handleCloseDetails} />
            ) : (
                <div className='cards_parent'>
                    <div className='contactcontent3'>Series</div>
                    <div className='cardslist'>
                        {movies.length > 0 ? (
                            movies.map(movie => (
                                <div key={movie.imdbID} className='carad-parent'>
                                    <div className="omdb-card">
                                        <div className='omdb-poster'>
                                            <img
                                                src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200'}
                                                alt={movie.Title}
                                                className='poster'
                                            />
                                        </div>
                                        <div className="poster-info">
                                            <div className="poster-info1">
                                                <div className="poster-info2">
                                                    <p className="info">Type: {movie.Type}</p>
                                                    <p className="info">imdbID: {movie.imdbID}</p>
                                                    <p className="info">Year: {movie.Year}</p>
                                                </div>
                                                <p className='title' onClick={() => handleMovieClick(movie.imdbID)}>
                                                    <h3>{movie.Title}</h3>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="downloaddbtn" onClick={() => handleMovieClick(movie.imdbID)}>
                                        <p className='trigger_btn'>
                                            {movie.Title}
                                        </p>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No series found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Series;

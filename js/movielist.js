'use strict';

import { api, fetchDataFromServer } from "./api.js";
import { sidebar } from "./sidebar.js";
import { createMovieCard } from "./moviecard.js";
import { search } from "./search.js";

// Get genre name and URL parameter from localStorage
const genreName = window.localStorage.getItem("genreName");
const urlParam = window.localStorage.getItem("urlParam");

const pageContent = document.querySelector("[page-content]");

sidebar();

let currentPage = 1;
let totalPages = 0;

// Fetch movies based on the genre
fetchMovies(currentPage);

// Function to fetch movies
function fetchMovies(page) {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${api}&sort_by=popularity.desc&include_adult=false&page=${page}&${urlParam}`;

    fetchDataFromServer(url, ({ results: movieList, total_pages }) => {
        totalPages = total_pages;
        document.title = `${genreName} Movies - UniFlix`;

        const movieListEle = createMovieListElement(movieList);
        pageContent.appendChild(movieListEle);

        // Add load more button functionality
        addLoadMoreButtonListener(movieListEle);
    });
}

// Function to create movie list section
function createMovieListElement(movieList) {
    const movieListEle = document.createElement("section");
    movieListEle.classList.add("movie-list", "genre-list");
    movieListEle.setAttribute("aria-label", `${genreName} Movies`);

    movieListEle.innerHTML = `
        <div class="title-wrapper">
            <h1 class="heading">All ${genreName} Movies</h1>
        </div>
        <div class="grid-list"></div>
        <button class="button load-more" load-more>Load More</button>
    `;

    // Add movie cards based on fetched items
    movieList.forEach(movie => {
        const movieCard = createMovieCard(movie);
        movieListEle.querySelector(".grid-list").appendChild(movieCard);
    });

    return movieListEle;
}

// Function to add event listener to the load more button
function addLoadMoreButtonListener(movieListEle) {
    const loadMoreButton = movieListEle.querySelector("[load-more]");

    loadMoreButton.addEventListener("click", function () {
        if (currentPage >= totalPages) {
            this.style.display = "none"; // Hide button if no more pages
            return;
        }
        
        currentPage++;
        this.classList.add("loading");

        // Fetch next page of movies
        fetchMovies(currentPage);
        this.classList.remove("loading");
    });
}

// Initialize search functionality
search();

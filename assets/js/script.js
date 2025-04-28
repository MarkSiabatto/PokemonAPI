// Constants
const CONFIG = {
    BASE_URL: 'https://pokeapi.co/api/v2/pokemon',
    LIMIT: 30,
    OFFSET: 0
};

// Pokemon Service Class
class PokemonService {
    static async fetchPokemons(url = `${CONFIG.BASE_URL}?limit=${CONFIG.LIMIT}&offset=${CONFIG.OFFSET}`) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching Pokemon list:', error);
            throw error;
        }
    }

    static async fetchPokemonDetails(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching Pokemon details:', error);
            throw error;
        }
    }
}

// UI Component Class
class PokemonUI {
    constructor() {
        this.characterContainer = document.getElementById('characterData');
        this.paginationContainer = document.getElementById('pagination');
    }

    createPokemonCard(pokemon) {
        return `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 mt-4">
                <div class="card cardStyle h-100">
                    <img 
                        src="${pokemon.sprites.front_shiny}" 
                        class="card-img-top img-fluid" 
                        alt="${pokemon.name}"
                        loading="lazy"
                    >
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-capitalize text-center">${pokemon.name}</h5>
                        <div class="mt-auto">
                            <p class="card-text text-center mb-1">Height: ${pokemon.height}</p>
                            <p class="card-text text-center">Weight: ${pokemon.weight}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPagination(info) {
        const html = `
            <li class="page-item ${!info.previous ? 'disabled' : ''}">
                <button class="page-link" 
                    ${info.previous ? `data-url="${info.previous}"` : ''}>
                    Previous
                </button>
            </li>
            <li class="page-item ${!info.next ? 'disabled' : ''}">
                <button class="page-link" 
                    ${info.next ? `data-url="${info.next}"` : ''}>
                    Next
                </button>
            </li>
        `;
        this.paginationContainer.innerHTML = html;
    }

    clearCharacterContainer() {
        this.characterContainer.innerHTML = '';
    }

    showLoadingState() {
        this.characterContainer.innerHTML = '<div class="text-center w-100"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    }
}

// Main App Class
class PokemonApp {
    constructor() {
        this.ui = new PokemonUI();
        this.init();
    }

    async init() {
        await this.loadPokemons();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.ui.paginationContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('page-link')) {
                const url = e.target.dataset.url;
                if (url) {
                    await this.loadPokemons(url);
                }
            }
        });
    }

    async loadPokemons(url) {
        try {
            this.ui.showLoadingState();
            const data = await PokemonService.fetchPokemons(url);
            
            this.ui.clearCharacterContainer();
            
            // Fetch all Pokemon details in parallel
            const pokemonPromises = data.results.map(pokemon => 
                PokemonService.fetchPokemonDetails(pokemon.url)
            );
            
            const pokemons = await Promise.all(pokemonPromises);
            
            const cardsHTML = pokemons.map(pokemon => 
                this.ui.createPokemonCard(pokemon)
            ).join('');
            
            this.ui.characterContainer.innerHTML = cardsHTML;
            this.ui.renderPagination(data);
            
        } catch (error) {
            this.ui.characterContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Failed to load Pokemon data. Please try again later.
                </div>
            `;
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PokemonApp();
});


// Constants
const CONFIG = {
    BASE_URL: 'https://pokeapi.co/api/v2/pokemon',
    LIMIT: 30,
    OFFSET: 0,
    MAX_POKEMON: 898
};

// Updated Virtual Keyboard Configuration
const KEYBOARD_LAYOUT = {
    numbers: '1234567890',
    firstRow: 'QWERTYUIOP',
    secondRow: 'ASDFGHJKL',
    thirdRow: 'ZXCVBNM'
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

    static async fetchRandomPokemon() {
        const randomId = Math.floor(Math.random() * CONFIG.MAX_POKEMON) + 1;
        return await this.fetchPokemonById(randomId);
    }

    static async fetchPokemonById(id) {
        try {
            const response = await fetch(`${CONFIG.BASE_URL}/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching Pokemon:', error);
            throw error;
        }
    }

    static async searchPokemon(query) {
        try {
            const response = await fetch(`${CONFIG.BASE_URL}/${query.toLowerCase()}`);
            return await response.json();
        } catch (error) {
            console.error('Error searching Pokemon:', error);
            throw error;
        }
    }
}

// UI Component Class
class VirtualKeyboard {
    constructor(container, onKeyPress) {
        this.container = container;
        this.onKeyPress = onKeyPress;
        this.render();
    }

    render() {
        // Render number row
        this.renderRow('number-row', KEYBOARD_LAYOUT.numbers);
        // Render letter rows
        this.renderRow('first-row', KEYBOARD_LAYOUT.firstRow);
        this.renderRow('second-row', KEYBOARD_LAYOUT.secondRow);
        this.renderRow('third-row', KEYBOARD_LAYOUT.thirdRow);
    }

    renderRow(rowId, keys) {
        const row = document.getElementById(rowId);
        [...keys].forEach(key => {
            const keyButton = document.createElement('button');
            keyButton.className = 'key';
            keyButton.textContent = key;
            keyButton.addEventListener('click', () => this.onKeyPress(key));
            row.appendChild(keyButton);
        });
    }
}

class PokemonUI {
    constructor() {
        this.characterContainer = document.getElementById('characterData');
        this.paginationContainer = document.getElementById('pagination');
        this.pokemonDisplay = document.getElementById('pokemon-display');
        this.searchInput = document.getElementById('pokemon-search');
        this.searchButton = document.getElementById('search-btn');
        this.virtualKeyboard = new VirtualKeyboard(
            document.getElementById('virtual-keyboard'),
            this.handleVirtualKeyPress.bind(this)
        );
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.searchButton.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
    }

    handleVirtualKeyPress(key) {
        this.searchInput.value += key;
        this.searchInput.focus();
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;

        try {
            const pokemon = await PokemonService.searchPokemon(query);
            this.displayPokemon(pokemon);
        } catch (error) {
            this.showError('Pokemon not found!');
        }
    }

    displayPokemon(pokemon) {
        const mainImage = document.getElementById('pokemon-image');
        const shinyImage = document.getElementById('pokemon-shiny');
        const infoContainer = document.getElementById('pokemon-info');

        mainImage.src = pokemon.sprites.front_default;
        mainImage.alt = pokemon.name;
        shinyImage.src = pokemon.sprites.front_shiny;
        shinyImage.alt = `${pokemon.name} shiny`;

        infoContainer.innerHTML = `
            <h2 class="pokemon-name">${pokemon.name.toUpperCase()}</h2>
            <div class="pokemon-details">
                <p><strong>Height:</strong> ${pokemon.height / 10}m</p>
                <p><strong>Weight:</strong> ${pokemon.weight / 10}kg</p>
                <div class="pokemon-types">
                    ${pokemon.types.map(type => 
                        `<span class="type ${type.type.name}">${type.type.name}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="pokemon-stats">
                ${pokemon.stats.map(stat => `
                    <div class="stat-row">
                        <span class="stat-name">${stat.stat.name}</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar" style="width: ${stat.base_stat}%"></div>
                            <span class="stat-value">${stat.base_stat}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showError(message) {
        this.pokemonDisplay.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
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
        // Load random Pokemon on startup
        try {
            const randomPokemon = await PokemonService.fetchRandomPokemon();
            this.ui.displayPokemon(randomPokemon);
        } catch (error) {
            this.ui.showError('Failed to load random Pokemon');
        }

        // Load catalog
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


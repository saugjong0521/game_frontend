// api.js
import axios from 'axios';

// KSTADIUM API 인스턴스
const API = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_BASE_URL
});

// GAME API 인스턴스  
const gameAPI = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_GAME_API_BASE_URL
});

export { API, gameAPI };
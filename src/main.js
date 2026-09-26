import './style.css';
import Game from './game.js';
import controls from './controls.js';
import { unlockAudio } from './sound.js';

const gameEl = document.querySelector('.game');
const game = new Game(gameEl);

controls.attach(gameEl);
controls.onPress = () => {
    unlockAudio();
    game.onPress();
};

gameEl.focus();
game.start();

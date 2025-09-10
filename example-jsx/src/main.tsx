import * as GAME from 'shalloteer';
import { Game } from './Game';

const gameStructure = Game();

GAME.withJSX(gameStructure).run();
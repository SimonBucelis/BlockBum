import { GamePiece, PIECE_TEMPLATES, PowerUpType } from './types';

let pieceCounter = 0;

export const generatePiece = (_powerUp?: PowerUpType): GamePiece => {
  const template = PIECE_TEMPLATES[Math.floor(Math.random() * PIECE_TEMPLATES.length)];
  return {
    id: `piece-${pieceCounter++}`,
    shape: template.shape,
    color: template.color,
  };
};

export const generatePieces = (count: number, powerUps?: PowerUpType[]): GamePiece[] => {
  // No bomb pieces in tray — bomb works like Line Zap: use power-up then tap a cell
  return Array.from({ length: count }, () => generatePiece());
};

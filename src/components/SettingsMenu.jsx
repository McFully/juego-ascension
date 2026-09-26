import React from 'react';
import { GameSettingsModal } from './app/GameSettingsModal.jsx';

/**
 * SettingsMenu — Componente unificado canónico para ajustes y gestión de partidas.
 * Reutiliza GameSettingsModal garantizando cero duplicación de código.
 */
export const SettingsMenu = (props) => {
  return <GameSettingsModal {...props} />;
};

export default SettingsMenu;


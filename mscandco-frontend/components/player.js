'use client'

import { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

export { PlayerContext };

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    return {
      player: { isPlaying: false }
    };
  }
  return context;
};

const Player = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const value = {
    player: {
      isPlaying,
      setIsPlaying
    }
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export default Player;

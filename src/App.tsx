import { GameCanvas } from './components/game/GameCanvas';
import { GameHUD } from './components/game/GameHUD';
import { MainMenu } from './components/ui/MainMenu';
import { RaceSelectionScreen } from './components/ui/RaceSelectionScreen';
import { RewardModal } from './components/ui/RewardModal';
import { GameOverScreen } from './components/ui/GameOverScreen';
import { TowerSelectionPanel } from './components/ui/TowerSelectionPanel';
import { TowerInfoPanel } from './components/ui/TowerInfoPanel';
import { PauseMenu } from './components/ui/PauseMenu';
import { CheatMenu } from './components/ui/CheatMenu';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="game-container">
        <GameCanvas />
        <GameHUD />
        <TowerSelectionPanel />
        <TowerInfoPanel />

        {/* Overlays */}
        <MainMenu />
        <RaceSelectionScreen />
        <RewardModal />
        <PauseMenu />
        <GameOverScreen />

        {/* Dev Tools */}
        <CheatMenu />
      </div>
    </div>
  );
}

export default App;

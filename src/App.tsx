import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { HollowButton } from './components/HollowButton';
import { SaveCard } from './components/SaveCard';
import { HollowPanel } from './components/HollowPanel';
import { SilkParticles } from './components/SilkParticles';
import { HollowLogo } from './components/HollowLogo';
import { ToastContainer } from './components/Toast';
import { GameToggle } from './components/GameToggle';
import { TabSlider } from './components/TabSlider';
import { 
  RefreshCw, 
  Settings, 
  Download, 
  Upload, 
  Search,
  Gamepad2,
  Monitor,
  Zap,
  FolderOpen,
  Plus
} from 'lucide-react';

interface SaveData {
  slot: number;
  file: string;
  path: string;
  modified: string;
  size: number;
  gameDisplayName: string;
  game: string;
  exists?: boolean;
}

interface Config {
  pcSave: string;
  switchSave: string;
  lastSync: string | null;
}

function App() {
  const [saves, setSaves] = useState<SaveData[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('silksong');
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncDirection, setSyncDirection] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'sync' | 'setup' | 'convert'>('sync');
  const [showManualSetup, setShowManualSetup] = useState(false);
  const [manualPcPath, setManualPcPath] = useState('');
  const [manualSwitchPath, setManualSwitchPath] = useState('');
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>>([]);
  const [convertInputPath, setConvertInputPath] = useState('');
  const [convertOutputPath, setConvertOutputPath] = useState('');
  const [convertDirection, setConvertDirection] = useState<'pc-to-switch' | 'switch-to-pc'>('pc-to-switch');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [selectedGame]);

  useEffect(() => {
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // disable dev tools shortcuts
    const disableDevTools = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('keydown', disableDevTools);

    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', disableDevTools);
    };
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSaves(),
        loadConfig()
      ]);
    } catch (error) {
      showToast('error', `Failed to load data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSaves = async () => {
    try {
      const result = await invoke<SaveData[]>('detect_saves', { gameFilter: selectedGame });
      setSaves(result);
    } catch (error) {
      throw new Error(`Failed to detect saves: ${error}`);
    }
  };

  const loadConfig = async () => {
    try {
      const result = await invoke<Config>('load_config', { game: selectedGame });
      setConfig(result);
    } catch (error) {
      throw new Error(`Failed to load config: ${error}`);
    }
  };

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleGameChange = (game: string) => {
    setSelectedGame(game);
    setCurrentTab('sync');
  };

  const formatPath = (path: string) => {
    if (path.length < 50) return path;
    
    // truncate long paths for display
    const parts = path.split(/[/\\]/);
    if (parts.length > 3) {
      const start = parts.slice(0, 2).join('/');
      const end = parts.slice(-2).join('/');
      return `${start}/.../${end}`;
    }
    
    return path;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', `${type} path copied to clipboard`);
    } catch (error) {
      showToast('error', 'Failed to copy to clipboard');
    }
  };

  const handleSync = async (forceDirection?: string) => {
    if (!config || !config.pcSave || !config.switchSave) {
      showToast('warning', 'Please configure save paths first');
      return;
    }

    setSyncing(true);
    setSyncDirection(forceDirection || null);
    
    try {
      await invoke<string>('sync_saves', { 
        game: selectedGame, 
        forceDirection 
      });
      
      let message = 'Save files synchronized successfully';
      if (forceDirection === 'pc-to-switch') {
        message = 'PC save copied to Switch format';
      } else if (forceDirection === 'switch-to-pc') {
        message = 'Switch save copied to PC format';
      }
      
      showToast('success', message);
      await loadConfig();
    } catch (error) {
      showToast('error', `Sync failed: ${error}`);
    } finally {
      setSyncing(false);
      setSyncDirection(null);
    }
  };

  const handleAutoSetup = async (save: SaveData) => {
    setLoading(true);
    try {
      const outputName = `${selectedGame}-slot${save.slot}.zip`;
      const newConfig = {
        pcSave: save.path,
        switchSave: outputName,
        lastSync: null
      };
      
      await invoke('save_config', { game: selectedGame, config: newConfig });
      await loadConfig();
      showToast('success', `Configured sync for ${save.gameDisplayName} slot ${save.slot}`);
    } catch (error) {
      showToast('error', `Setup failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSetup = async () => {
    if (!manualPcPath || !manualSwitchPath) {
      showToast('warning', 'Please specify both PC and Switch save paths');
      return;
    }

    setLoading(true);
    try {
      const newConfig = {
        pcSave: manualPcPath,
        switchSave: manualSwitchPath,
        lastSync: null
      };
      
      await invoke('save_config', { game: selectedGame, config: newConfig });
      await loadConfig();
      setShowManualSetup(false);
      setManualPcPath('');
      setManualSwitchPath('');
      showToast('success', 'Manual setup configured successfully');
    } catch (error) {
      showToast('error', `Manual setup failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const openFileDialog = async (title: string, filters: any[]) => {
    try {
      const { open } = await import('@tauri-apps/api/dialog');
      const result = await open({
        title,
        filters,
        multiple: false,
        directory: false
      });
      return result as string | null;
    } catch (error) {
      showToast('error', `Failed to open file dialog: ${error}`);
      return null;
    }
  };

  const openSaveDialog = async (title: string, filters: any[]) => {
    try {
      const { save } = await import('@tauri-apps/api/dialog');
      const result = await save({
        title,
        filters
      });
      return result as string | null;
    } catch (error) {
      showToast('error', `Failed to open save dialog: ${error}`);
      return null;
    }
  };

  const handleConvert = async () => {
    if (!convertInputPath) {
      showToast('warning', 'Please select an input file');
      return;
    }

    setConverting(true);
    try {
      const result = await invoke<string>('convert_save', {
        inputPath: convertInputPath,
        outputPath: convertOutputPath || undefined,
        direction: convertDirection
      });
      
      showToast('success', `Conversion completed: ${result}`);
      setConvertInputPath('');
      setConvertOutputPath('');
    } catch (error) {
      showToast('error', `Conversion failed: ${error}`);
    } finally {
      setConverting(false);
    }
  };

  const renderSyncTab = () => (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-1">
      <HollowPanel title="Sync Status">
        {config?.pcSave && config?.switchSave ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <Monitor className="w-4 h-4" />
                  <span className="font-hollow font-medium">PC Save</span>
                </div>
                <div 
                  className="bg-void-700 p-3 rounded-md border border-void-600 cursor-pointer hover:bg-void-600 hover:border-silk-500/30 transition-all duration-200"
                  onClick={() => copyToClipboard(config.pcSave, 'PC save')}
                  title={`${config.pcSave}`}
                >
                  <div className="text-sm text-knight-200 font-mono leading-relaxed">
                    {formatPath(config.pcSave)}
                  </div>
                  <div className="text-xs text-knight-400 mt-1 italic">
                    {config.pcSave.length > 50 ? 'Click to copy • Hover to see full path' : 'Click to copy'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-orange-400">
                  <Gamepad2 className="w-4 h-4" />
                  <span className="font-hollow font-medium">Switch Save</span>
                </div>
                <div 
                  className="bg-void-700 p-3 rounded-md border border-void-600 cursor-pointer hover:bg-void-600 hover:border-silk-500/30 transition-all duration-200"
                  onClick={() => copyToClipboard(config.switchSave, 'Switch save')}
                  title={`${config.switchSave}`}
                >
                  <div className="text-sm text-knight-200 font-mono leading-relaxed">
                    {formatPath(config.switchSave)}
                  </div>
                  <div className="text-xs text-knight-400 mt-1 italic">
                    {config.switchSave.length > 50 ? 'Click to copy • Hover to see full path' : 'Click to copy'}
                  </div>
                </div>
              </div>
            </div>
            
            {config.lastSync && (
              <div className="text-sm text-knight-400">
                Last sync: {new Date(config.lastSync).toLocaleString()}
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <HollowButton 
                icon={Zap} 
                onClick={() => handleSync()}
                disabled={loading || syncing}
                loading={syncing}
              >
                Auto Sync
              </HollowButton>
              <HollowButton 
                icon={Upload} 
                variant="secondary"
                onClick={() => handleSync('pc-to-switch')}
                disabled={loading || syncing}
                loading={syncing && syncDirection === 'pc-to-switch'}
              >
                PC → Switch
              </HollowButton>
              <HollowButton 
                icon={Download} 
                variant="secondary"
                onClick={() => handleSync('switch-to-pc')}
                disabled={loading || syncing}
                loading={syncing && syncDirection === 'switch-to-pc'}
              >
                Switch → PC
              </HollowButton>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-knight-400 mx-auto mb-4" />
            <p className="text-knight-300 font-hollow mb-4">
              Save sync not configured yet
            </p>
            <HollowButton onClick={() => setCurrentTab('setup')}>
              Set Up Sync
            </HollowButton>
          </div>
        )}
      </HollowPanel>
      </div>
    </div>
  );

  const renderManualSetup = () => {
    return (
      <HollowPanel title="Manual Setup">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-hollow font-medium text-knight-100 mb-1">
              PC Save File (.dat)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualPcPath}
                onChange={(e) => setManualPcPath(e.target.value)}
                placeholder="Select PC save file..."
                className="flex-1 px-3 py-1.5 bg-void-700 border border-void-600 rounded-md text-knight-100 font-mono text-sm focus:border-silk-500 focus:outline-none"
              />
              <HollowButton
                icon={FolderOpen}
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const path = await openFileDialog('Select PC Save File', [
                    { name: 'Save Files', extensions: ['dat'] }
                  ]);
                  if (path) setManualPcPath(path);
                }}
              >
                Browse
              </HollowButton>
            </div>
          </div>

          <div>
            <label className="block text-sm font-hollow font-medium text-knight-100 mb-1">
              Switch Save File (.zip or .json)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualSwitchPath}
                onChange={(e) => setManualSwitchPath(e.target.value)}
                placeholder="Enter Switch save path..."
                className="flex-1 px-3 py-1.5 bg-void-700 border border-void-600 rounded-md text-knight-100 font-mono text-sm focus:border-silk-500 focus:outline-none"
              />
              <HollowButton
                icon={FolderOpen}
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const path = await openSaveDialog('Choose Switch Save Path', [
                    { name: 'Save Files', extensions: ['zip', 'json'] }
                  ]);
                  if (path) setManualSwitchPath(path);
                }}
              >
                Save As
              </HollowButton>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <HollowButton
              onClick={handleManualSetup}
              disabled={!manualPcPath || !manualSwitchPath || loading}
              loading={loading}
            >
              Configure
            </HollowButton>
            <HollowButton
              variant="secondary"
              onClick={() => {
                setShowManualSetup(false);
                setManualPcPath('');
                setManualSwitchPath('');
              }}
            >
              Cancel
            </HollowButton>
          </div>
        </div>
      </HollowPanel>
    );
  };

  const renderSetupTab = () => {
    if (showManualSetup) {
      return (
        <div className="h-full overflow-y-auto">
          <div className="space-y-4 p-1">{renderManualSetup()}</div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-4 p-1">
        <HollowPanel title="Auto Setup" subtitle="Select a save file to configure automatic syncing">
          <div className="mb-3 flex justify-end">
            <HollowButton
              icon={Plus}
              variant="secondary"
              onClick={() => setShowManualSetup(true)}
            >
              Manual Setup
            </HollowButton>
          </div>
          
          {saves.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {saves.filter(save => save.game === selectedGame).map((save) => (
                <SaveCard
                  key={`${save.path}-${save.slot}`}
                  save={{ ...save, exists: true }}
                  onClick={() => handleAutoSetup(save)}
                  isSelected={config?.pcSave === save.path}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Search className="w-10 h-10 text-knight-400 mx-auto mb-3" />
              <p className="text-knight-300 font-hollow mb-2">
                No {selectedGame === 'silksong' ? 'Silksong' : 'Hollow Knight'} save files found
              </p>
              <p className="text-sm text-knight-400 font-hollow mb-4">
                Make sure you have played the game and saved at least once
              </p>
              <div className="flex gap-3 justify-center">
                <HollowButton 
                  icon={RefreshCw} 
                  onClick={loadSaves}
                  disabled={loading}
                  loading={loading}
                >
                  Refresh
                </HollowButton>
                <HollowButton 
                  icon={Plus} 
                  variant="secondary"
                  onClick={() => setShowManualSetup(true)}
                >
                  Manual Setup
                </HollowButton>
              </div>
            </div>
          )}
        </HollowPanel>
        </div>
      </div>
    );
  };

  const renderConvertTab = () => (
    <div className="h-full overflow-y-auto">
      <div className="p-1">
        <HollowPanel title="Manual Conversion">
          <div className="space-y-2">
        <div className="flex gap-2">
          <HollowButton
            variant={convertDirection === 'pc-to-switch' ? 'primary' : 'secondary'}
            onClick={() => setConvertDirection('pc-to-switch')}
            icon={Upload}
            size="sm"
          >
            PC → Switch
          </HollowButton>
          <HollowButton
            variant={convertDirection === 'switch-to-pc' ? 'primary' : 'secondary'}
            onClick={() => setConvertDirection('switch-to-pc')}
            icon={Download}
            size="sm"
          >
            Switch → PC
          </HollowButton>
        </div>

        <div>
          <label className="block text-sm font-hollow font-medium text-knight-100 mb-1">
            Input ({convertDirection === 'pc-to-switch' ? '.dat' : '.zip/.json'})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={convertInputPath}
              onChange={(e) => setConvertInputPath(e.target.value)}
              placeholder={`${convertDirection === 'pc-to-switch' ? 'PC' : 'Switch'} file...`}
              className="flex-1 px-3 py-1.5 bg-void-700 border border-void-600 rounded-md text-knight-100 font-mono text-sm focus:border-silk-500 focus:outline-none"
            />
            <HollowButton
              icon={FolderOpen}
              variant="secondary"
              size="sm"
              onClick={async () => {
                const extensions = convertDirection === 'pc-to-switch' ? ['dat'] : ['zip', 'json'];
                const path = await openFileDialog('Select Input File', [
                  { name: 'Save Files', extensions }
                ]);
                if (path) setConvertInputPath(path);
              }}
            >
              Browse
            </HollowButton>
          </div>
        </div>

        <div>
          <label className="block text-sm font-hollow font-medium text-knight-100 mb-1">
            Output (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={convertOutputPath}
              onChange={(e) => setConvertOutputPath(e.target.value)}
              placeholder={`${convertDirection === 'pc-to-switch' ? 'Switch' : 'PC'} path...`}
              className="flex-1 px-3 py-1.5 bg-void-700 border border-void-600 rounded-md text-knight-100 font-mono text-sm focus:border-silk-500 focus:outline-none"
            />
            <HollowButton
              icon={FolderOpen}
              variant="secondary"
              size="sm"
              onClick={async () => {
                const extensions = convertDirection === 'pc-to-switch' ? ['zip'] : ['dat'];
                const path = await openSaveDialog('Save As', [
                  { name: 'Save Files', extensions }
                ]);
                if (path) setConvertOutputPath(path);
              }}
            >
              Save As
            </HollowButton>
          </div>
        </div>

        <div className="flex justify-center pt-1">
          <HollowButton
            onClick={handleConvert}
            disabled={!convertInputPath || converting}
            loading={converting}
            icon={RefreshCw}
            size="sm"
          >
            Convert
          </HollowButton>
        </div>
          </div>
        </HollowPanel>
      </div>
    </div>
  );

  const gameOptions = [
    { key: 'silksong', name: 'Silksong' },
    { key: 'hk', name: 'Hollow Knight' }
  ];

  return (
    <div className="h-screen void-gradient relative overflow-hidden">
      <SilkParticles />

      <div className="h-full flex flex-col relative z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl flex-1 flex flex-col overflow-hidden">
          <div className="text-center mb-6 flex-shrink-0">
            <div className="flex justify-center mb-3">
              <HollowLogo />
            </div>
            <h1 className="text-3xl font-hollow font-bold text-knight-100 animate-float">
              Hollow Sync
            </h1>
          </div>

          <div className="flex justify-center mb-4 flex-shrink-0">
            <GameToggle
              value={selectedGame}
              onChange={handleGameChange}
              options={gameOptions}
            />
          </div>

          <div className="flex justify-center mb-4 flex-shrink-0">
            <TabSlider
              value={currentTab}
              onChange={(value) => setCurrentTab(value as any)}
              tabs={[
                { key: 'sync', label: 'Sync', icon: Zap },
                { key: 'setup', label: 'Setup', icon: Settings },
                { key: 'convert', label: 'Convert', icon: RefreshCw }
              ]}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            {currentTab === 'sync' && renderSyncTab()}
            {currentTab === 'setup' && renderSetupTab()}
            {currentTab === 'convert' && renderConvertTab()}
          </div>
        </div>
        
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    </div>
  );
}

export default App;
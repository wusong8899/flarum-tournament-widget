import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';
import type { TournamentPlatform } from '../types';
import PlatformIcon from './PlatformIcon';

interface PlatformSelectorProps {
  platforms: TournamentPlatform[];
  selectedPlatform: TournamentPlatform | null;
  onPlatformSelect: (platform: TournamentPlatform) => void;
}

interface PlatformSelectorState {
  showDropdown: boolean;
}

export default class PlatformSelector extends Component<PlatformSelectorProps, PlatformSelectorState> {
  oninit(vnode: Mithril.Vnode<PlatformSelectorProps, PlatformSelectorState>) {
    super.oninit(vnode);
    this.state = {
      showDropdown: false,
    };
  }

  view(): Mithril.Children {
    const { selectedPlatform } = this.attrs;
    const { showDropdown } = this.state;

    return (
      <div className="TournamentPlatformSelector">
        <div className="TournamentPlatformSelector-label">游戏平台</div>
        <div 
          className="TournamentPlatformSelector-dropdown" 
          onclick={() => this.toggleDropdown()}
        >
          <div className="TournamentPlatformSelector-selected">
            <div className="TournamentPlatformSelector-info">
              <div className="TournamentPlatformSelector-icon">
                <PlatformIcon 
                  platform={selectedPlatform} 
                  size="medium"
                />
              </div>
              <div className="TournamentPlatformSelector-details">
                <div className="TournamentPlatformSelector-name">
                  {this.getPlatformName(selectedPlatform)}
                </div>
              </div>
            </div>
          </div>
          {icon('fas fa-chevron-down', { className: 'TournamentPlatformSelector-dropdownIcon' })}
        </div>

        {showDropdown && this.renderPlatformDropdown()}
      </div>
    );
  }

  private toggleDropdown(): void {
    this.state.showDropdown = !this.state.showDropdown;
  }

  private getPlatformName(platform: TournamentPlatform | null): string {
    if (!platform) {
      return '请选择游戏平台';
    }
    return platform.name || '请选择游戏平台';
  }

  private renderPlatformDropdown(): Mithril.Children {
    const { platforms } = this.attrs;

    if (!platforms || platforms.length === 0) {
      return (
        <div className="TournamentPlatformSelector-dropdownMenu">
          <div className="TournamentPlatformSelector-dropdownItem TournamentPlatformSelector-noData">
            暂无可选平台
          </div>
        </div>
      );
    }

    return (
      <div className="TournamentPlatformSelector-dropdownMenu">
        {platforms.map(platform => (
          <div 
            key={platform.id}
            className="TournamentPlatformSelector-dropdownItem"
            onclick={() => this.selectPlatform(platform)}
          >
            <div className="TournamentPlatformSelector-icon">
              <PlatformIcon platform={platform} size="small" />
            </div>
            <div className="TournamentPlatformSelector-name">
              {platform.name}
            </div>
          </div>
        ))}
      </div>
    );
  }

  private selectPlatform(platform: TournamentPlatform): void {
    const { onPlatformSelect } = this.attrs;
    
    onPlatformSelect(platform);
    this.state.showDropdown = false;
  }
}
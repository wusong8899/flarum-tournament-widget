import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import avatar from 'flarum/common/helpers/avatar';
import User from 'flarum/common/models/User';
import m, { Vnode, VnodeDOM } from 'mithril';

interface IParticipant {
  id: string;
  rank: number;
  title: string;
  amount: number;
  score: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  platform: {
    id: number | null;
    name: string;
    username: string;
    iconUrl: string | null;
    iconClass: string | null;
    usesUrlIcon: boolean;
    usesCssIcon: boolean;
  };
  platformAccount: string; // Legacy field for backward compatibility
}

interface LeaderboardAttrs {
  participants: IParticipant[];
}

export default class Leaderboard extends Component<LeaderboardAttrs> {
  containerRef: HTMLElement | null = null;

  oncreate(vnode: VnodeDOM<LeaderboardAttrs>) {
    super.oncreate(vnode);
    this.containerRef = vnode.dom as HTMLElement;
    this.observeResize();
  }

  onremove() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private resizeObserver?: ResizeObserver;

  observeResize() {
    if (!this.containerRef || typeof ResizeObserver === 'undefined') return;
    
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        // Add classes based on container width for additional responsive control
        if (width < 640) {
          this.containerRef?.classList.add('compact-view');
          this.containerRef?.classList.remove('wide-view');
        } else if (width > 1200) {
          this.containerRef?.classList.add('wide-view');
          this.containerRef?.classList.remove('compact-view');
        } else {
          this.containerRef?.classList.remove('compact-view', 'wide-view');
        }
      }
    });
    
    this.resizeObserver.observe(this.containerRef);
  }

  view(vnode: Vnode<LeaderboardAttrs>) {
    const { participants } = vnode.attrs;
    
    // Get preview limit from settings (default to 5)
    const previewLimitSetting = app.forum.attribute('wusong8899_tournament.preview_limit');
    const previewLimit = previewLimitSetting ? parseInt(previewLimitSetting) : 5;
    
    const rankingsToShow = participants.slice(0, previewLimit);

    return (
      <div className="Leaderboard">
        <div className="Leaderboard-header">
          <div className="Leaderboard-headerRow">
            <div className="Leaderboard-headerCell rank">
              {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.rank')}
            </div>
            <div className="Leaderboard-headerCell user">
              {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.user')}
            </div>
            <div className="Leaderboard-headerCell platform">
              {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.platform')}
            </div>
            <div className="Leaderboard-headerCell score">
              {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.amount')}
            </div>
          </div>
        </div>
        <div className="Leaderboard-list">
          {rankingsToShow.length > 0 ? (
            rankingsToShow.map((participant) => (
              <div 
                className={`Leaderboard-item rank-${participant.rank}`} 
                key={participant.id}
                data-rank={`#${participant.rank}`}
                title={`${participant.user.displayName} - ${participant.title}`}>
                <div className="Leaderboard-cell rank">
                  <i className={this.getRankIcon(participant.rank)}></i>
                  <span className="rank-number">{participant.rank}</span>
                </div>
                <div className="Leaderboard-cell user">
                  <div className="user-info">
                    {this.renderUserAvatar(participant.user)}
                    <div className="user-details">
                      <span className="user-name">{participant.user.displayName}</span>
                      <span className="user-title">{participant.title}</span>
                    </div>
                  </div>
                </div>
                <div className="Leaderboard-cell platform">
                  <div className="platform-info">
                    {this.renderPlatformIcon(participant.platform)}
                    <div className="platform-details">
                      <div className="platform-name">{participant.platform.name}</div>
                    </div>
                  </div>
                </div>
                <div className="Leaderboard-cell score">
                  <span className={`score-amount ${
                    participant.amount < 0 ? 'negative' : 
                    participant.amount > 0 ? 'positive' : 'zero'
                  }`}>
                    {participant.amount}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="Leaderboard-empty">
              {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.no_participants')}
            </div>
          )}
        </div>
        {participants.length > previewLimit && (
          <Button 
            className="Button Button--block Leaderboard-detailsBtn"
            onclick={() => { 
              m.route.set('/tournament/rankings');
            }}
          >
            {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.view_details')}
          </Button>
        )}
      </div>
    );
  }

  getRankIcon(rank: number): string {
    if (rank === 1) return 'fas fa-crown rank-gold';
    if (rank === 2) return 'fas fa-crown rank-silver';
    if (rank === 3) return 'fas fa-crown rank-bronze';
    return 'fas fa-medal';
  }

  renderUserAvatar(userData: IParticipant['user']) {
    // Try to get the User model from the store
    const user = app.store.getById<User>('users', userData.id);
    
    if (user) {
      // Use Flarum's avatar helper with the proper User model
      return avatar(user, { className: 'user-avatar' });
    } else {
      // Fallback to manual avatar rendering
      return userData.avatarUrl ? (
        <img 
          className="user-avatar" 
          src={userData.avatarUrl} 
          alt={userData.displayName}
        />
      ) : (
        <div className="user-avatar user-avatar--default">
          <i className="fas fa-user"></i>
        </div>
      );
    }
  }

  renderPlatformIcon(platform: IParticipant['platform']) {
    if (platform.usesUrlIcon && platform.iconUrl) {
      return (
        <img 
          className="platform-icon image-icon" 
          src={platform.iconUrl} 
          alt={platform.name}
        />
      );
    } else if (platform.usesCssIcon && platform.iconClass) {
      return <i className={`platform-icon css-icon ${platform.iconClass}`}></i>;
    } else {
      // Default platform icon
      return <i className="platform-icon css-icon fas fa-gamepad"></i>;
    }
  }
}
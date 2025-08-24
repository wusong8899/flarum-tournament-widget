import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import { Vnode } from 'mithril';

interface IParticipant {
  id: string;
  rank: number;
  title: string;
  amount: number;
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
  showAll: boolean = false;

  view(vnode: Vnode<LeaderboardAttrs>) {
    const { participants } = vnode.attrs;
    const rankingsToShow = this.showAll ? participants : participants.slice(0, 5);

    return (
      <div className="Leaderboard">
        <div className="Leaderboard-header">
          <div className="Leaderboard-headerRow">
            <div className="Leaderboard-headerCell rank">
              {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.rank')}
            </div>
            <div className="Leaderboard-headerCell title">
              {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.rank_title')}
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
              <div className={`Leaderboard-item rank-${participant.rank}`} key={participant.id}>
                <div className="Leaderboard-cell rank">
                  <i className={this.getRankIcon(participant.rank)}></i>
                  <span className="rank-number">{participant.rank}</span>
                </div>
                <div className="Leaderboard-cell title">
                  <span className="title-text">{participant.title}</span>
                </div>
                <div className="Leaderboard-cell user">
                  <div className="user-info">
                    {participant.user.avatarUrl && (
                      <img 
                        className="user-avatar" 
                        src={participant.user.avatarUrl} 
                        alt={participant.user.displayName}
                      />
                    )}
                    <span className="user-name">{participant.user.displayName}</span>
                  </div>
                </div>
                <div className="Leaderboard-cell platform">
                  <div className="platform-info">
                    {this.renderPlatformIcon(participant.platform)}
                    <div className="platform-details">
                      <div className="platform-name">{participant.platform.name}</div>
                      <div className="platform-username">{participant.platform.username}</div>
                    </div>
                  </div>
                </div>
                <div className="Leaderboard-cell score">
                  <span className="score-amount">{participant.amount}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="Leaderboard-empty">
              {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.no_participants')}
            </div>
          )}
        </div>
        {!this.showAll && participants.length > 5 && (
          <Button 
            className="Button Button--block Leaderboard-expandBtn"
            onclick={() => { 
              this.showAll = true; 
            }}
          >
            {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.view_all', { count: participants.length })}
          </Button>
        )}
        {this.showAll && participants.length > 5 && (
          <Button 
            className="Button Button--block Leaderboard-collapseBtn"
            onclick={() => { 
              this.showAll = false; 
            }}
          >
            {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.collapse')}
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
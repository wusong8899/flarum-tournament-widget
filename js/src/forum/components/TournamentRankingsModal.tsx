import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Button from 'flarum/common/components/Button';
import avatar from 'flarum/common/helpers/avatar';
import User from 'flarum/common/models/User';
import type Mithril from 'mithril';
import m from 'mithril';

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
  platformAccount: string;
}

interface ITournamentData {
  title: string;
  prizePool: string;
  startDate: string;
  detailsUrl: string;
  backgroundImage: string;
  headerTitle: string;
  headerImage: string;
  participants: IParticipant[];
}

export default class TournamentRankingsModal extends Modal {
  protected loading = true;
  protected tournamentData: ITournamentData | null = null;
  protected error: string | null = null;

  oninit(vnode: Mithril.Vnode) {
    super.oninit(vnode);
    this.loadTournamentData();
  }

  className() {
    return 'TournamentRankingsModal Modal--large';
  }

  title() {
    return this.tournamentData?.headerTitle ;
  }

  private async loadTournamentData(): Promise<void> {
    try {
      this.loading = true;
      m.redraw();

      const response = await app.request({
        method: 'GET',
        url: `${app.forum.attribute('apiUrl')}/tournament`,
      }) as { data?: { attributes?: ITournamentData } };

      if (response?.data?.attributes) {
        this.tournamentData = response.data.attributes;
        this.error = null;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to load tournament data:', error);
      this.error = 'Failed to load tournament data';
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  content() {
    try {
      return this.renderContent();
    } catch (error) {
      console.error('TournamentRankingsModal content error:', error);
      return (
        <div className="TournamentRankingsModal-error">
          <h3>Error loading tournament rankings</h3>
          <p>Please try again or contact support.</p>
          <Button className="Button Button--primary" onclick={() => this.hide()}>
            关闭
          </Button>
        </div>
      );
    }
  }

  private renderContent() {
    if (this.loading) {
      return <LoadingIndicator />;
    }

    if (this.error || !this.tournamentData) {
      return (
        <div className="TournamentRankingsModal-error">
          <h3>{app.translator.trans('core.forum.error.generic_message')}</h3>
          <p>{this.error || 'Tournament data not available'}</p>
          <Button className="Button Button--primary" onclick={() => this.hide()}>
            关闭
          </Button>
        </div>
      );
    }

    const { tournamentData } = this;

    return (
      <div className="TournamentRankingsModal-content">
        <div className="TournamentRankingsModal-header">
          <div className="TournamentRankingsModal-tournamentInfo">
            <h3>{tournamentData.title}</h3>
            <p className="TournamentRankingsModal-prizePool">
              {app.translator.trans('wusong8899-tournament-widget.forum.tournament.prize_pool')}: {tournamentData.prizePool}
            </p>
          </div>
        </div>

        <div className="TournamentRankingsModal-leaderboard">
          {this.renderFullLeaderboard()}
        </div>
      </div>
    );
  }

  private renderFullLeaderboard() {
    if (!this.tournamentData || !this.tournamentData.participants.length) {
      return (
        <div className="TournamentRankingsModal-empty">
          {app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.no_participants')}
        </div>
      );
    }

    return (
      <div className="Leaderboard Leaderboard--modal">
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
          {this.tournamentData.participants.map((participant) => (
            <div 
              className={`Leaderboard-item rank-${participant.rank}`} 
              key={participant.id}
              data-rank={`#${participant.rank}`}
              title={`${participant.user.displayName} - ${participant.title}`}
            >
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
          ))}
        </div>
      </div>
    );
  }

  private getRankIcon(rank: number): string {
    if (rank === 1) return 'fas fa-crown rank-gold';
    if (rank === 2) return 'fas fa-crown rank-silver';
    if (rank === 3) return 'fas fa-crown rank-bronze';
    return 'fas fa-medal';
  }

  private renderUserAvatar(userData: IParticipant['user']) {
    const user = app.store.getById<User>('users', userData.id);
    
    if (user) {
      return avatar(user, { className: 'user-avatar' });
    } else {
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

  private renderPlatformIcon(platform: IParticipant['platform']) {
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
      return <i className="platform-icon css-icon fas fa-gamepad"></i>;
    }
  }
}
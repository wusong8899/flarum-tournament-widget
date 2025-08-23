import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import { Vnode } from 'mithril';

interface IParticipant {
  id: string;
  platformAccount: string;
  score: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
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
          <h3>{app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.title')}</h3>
          <h4>{app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.points')}</h4>
        </div>
        <ul className="Leaderboard-list">
          {rankingsToShow.length > 0 ? (
            rankingsToShow.map((participant, index) => (
              <li className={`Leaderboard-item rank-${index + 1}`} key={participant.id}>
                <span className="Leaderboard-rank">
                  <i className={this.getRankIcon(index + 1)}></i> {index + 1}
                </span>
                <span className="Leaderboard-user">
                  <div className="username">{participant.user.displayName}</div>
                  <div className="prize">
                    <i className="fas fa-gem"></i> {participant.score}
                  </div>
                </span>
                <span className="Leaderboard-score">{participant.score}</span>
              </li>
            ))
          ) : (
            <div className="Leaderboard-empty">{app.translator.trans('wusong8899-tournament-widget.forum.leaderboard.no_participants')}</div>
          )}
        </ul>
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
}
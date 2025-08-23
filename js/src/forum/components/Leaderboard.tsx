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
          <h3>排行榜</h3>
          <h4>积分</h4>
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
            <div className="Leaderboard-empty">暂无参与者</div>
          )}
        </ul>
        {!this.showAll && participants.length > 5 && (
          <Button 
            className="Button Button--block Leaderboard-expandBtn"
            onclick={() => { 
              this.showAll = true; 
            }}
          >
            详情 (查看全部 {participants.length} 名)
          </Button>
        )}
        {this.showAll && participants.length > 5 && (
          <Button 
            className="Button Button--block Leaderboard-collapseBtn"
            onclick={() => { 
              this.showAll = false; 
            }}
          >
            收起
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
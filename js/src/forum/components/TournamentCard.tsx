import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import ParticipateModal from './ParticipateModal';
import { Vnode } from 'mithril';

interface TournamentCardAttrs {
  title: string;
  prizePool: string;
  detailsUrl: string;
  backgroundImage: string;
  timeElapsed: {
    days: string;
    hours: string;
    mins: string;
    secs: string;
  };
  userParticipated: boolean;
  onParticipate: () => void;
}

export default class TournamentCard extends Component<TournamentCardAttrs> {
  view(vnode: Vnode<TournamentCardAttrs>) {
    const { title, prizePool, detailsUrl, backgroundImage, timeElapsed, userParticipated, onParticipate } = vnode.attrs;

    return (
      <div className="TournamentCard" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <a className="TournamentCard-detailsLink" href={detailsUrl} target="_blank" rel="noopener noreferrer">
          详情
        </a>
        <div className="TournamentCard-content">
          <div className="TournamentCard-title">{title}</div>
          <div className="TournamentCard-prizePool">
            <label>奖池</label>
            <span>{prizePool}</span>
          </div>
          <div className="Timer">
            <label>开始于</label>
            <div className="Timer-display">
              {timeElapsed.days}天 {timeElapsed.hours}:{timeElapsed.mins}:{timeElapsed.secs}
            </div>
          </div>
          {!userParticipated && app.session.user && (
            <Button 
              className="Button Button--primary TournamentCard-participateBtn"
              onclick={() => {
                app.modal.show(ParticipateModal, {
                  onParticipate: onParticipate
                });
              }}
            >
              立即参加
            </Button>
          )}
          {userParticipated && (
            <div className="TournamentCard-participated">
              <i className="fas fa-check-circle"></i> 已参加
            </div>
          )}
          {!app.session.user && (
            <Button 
              className="Button Button--primary TournamentCard-participateBtn"
              onclick={() => app.route('login')}
            >
              登录参加
            </Button>
          )}
        </div>
      </div>
    );
  }
}
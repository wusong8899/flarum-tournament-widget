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
          {app.translator.trans('wusong8899-tournament-widget.forum.tournament.details')}
        </a>
        <div className="TournamentCard-content">
          <div className="TournamentCard-title">{title}</div>
          <div className="TournamentCard-prizePool">
            <label>{app.translator.trans('wusong8899-tournament-widget.forum.tournament.prize_pool')}</label>
            <span>{prizePool}</span>
          </div>
          <div className="Timer">
            <label>{app.translator.trans('wusong8899-tournament-widget.forum.tournament.started_at')}</label>
            <div className="Timer-display">
              <div className="Timer-boxes">
                <div className="Timer-unit">
                  <strong>{timeElapsed.days}</strong>
                </div>
                <span className="Timer-separator">:</span>
                <div className="Timer-unit">
                  <strong>{timeElapsed.hours}</strong>
                </div>
                <span className="Timer-separator">:</span>
                <div className="Timer-unit">
                  <strong>{timeElapsed.mins}</strong>
                </div>
                <span className="Timer-separator">:</span>
                <div className="Timer-unit">
                  <strong>{timeElapsed.secs}</strong>
                </div>
              </div>
              <div className="Timer-labels">
                <div className="Timer-label">DAYS</div>
                <span className="Timer-spacer"></span>
                <div className="Timer-label">HRS</div>
                <span className="Timer-spacer"></span>
                <div className="Timer-label">MINS</div>
                <span className="Timer-spacer"></span>
                <div className="Timer-label">SECS</div>
              </div>
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
              {app.translator.trans('wusong8899-tournament-widget.forum.tournament.participate_now')}
            </Button>
          )}
          {userParticipated && (
            <div className="TournamentCard-participated">
              <i className="fas fa-check-circle"></i> {app.translator.trans('wusong8899-tournament-widget.forum.tournament.participated')}
            </div>
          )}
          {!app.session.user && (
            <Button 
              className="Button Button--primary TournamentCard-participateBtn"
              onclick={() => app.route('login')}
            >
              {app.translator.trans('wusong8899-tournament-widget.forum.tournament.login_to_participate')}
            </Button>
          )}
        </div>
      </div>
    );
  }
}
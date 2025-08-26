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
  userApplicationStatus: {
    isApproved: boolean;
    submittedAt?: string;
    approvedAt?: string;
  } | null;
  onParticipate: () => void;
}

export default class TournamentCard extends Component<TournamentCardAttrs> {
  view(vnode: Vnode<TournamentCardAttrs>) {
    const { title, prizePool, detailsUrl, backgroundImage, timeElapsed, userParticipated, userApplicationStatus, onParticipate } = vnode.attrs;

    return (
      <div className="TournamentCard" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="TournamentCard-header">
          <div className="TournamentCard-title">{title}</div>
          <a className="TournamentCard-detailsLink" href={detailsUrl} target="_blank" rel="noopener noreferrer">
            {app.translator.trans('wusong8899-tournament-widget.forum.tournament.details')}
          </a>
          <div className="TournamentCard-prizePool">
            <label>{app.translator.trans('wusong8899-tournament-widget.forum.tournament.prize_pool')}</label>
            <span>{prizePool}</span>
          </div>
        </div>
        <div className="TournamentCard-content">
          <div className="TournamentCard-contentRow">
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
            <div className="TournamentCard-actions">
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
              {userParticipated && userApplicationStatus && (
                <div className={`TournamentCard-status ${userApplicationStatus.isApproved ? 'approved' : 'pending'}`}>
                  {userApplicationStatus.isApproved ? (
                    <>
                      <i className="fas fa-check-circle"></i> 
                      {app.translator.trans('wusong8899-tournament-widget.forum.tournament.approved')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-clock"></i> 
                      {app.translator.trans('wusong8899-tournament-widget.forum.tournament.pending_approval')}
                    </>
                  )}
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
        </div>
      </div>
    );
  }
}
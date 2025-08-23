import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import m from 'mithril';
import { Vnode } from 'mithril';

interface ParticipateModalAttrs {
  onParticipate?: () => void;
}

export default class ParticipateModal extends Modal<ParticipateModalAttrs> {
  platformAccount: string = '';
  loading: boolean = false;

  className() {
    return 'ParticipateModal Modal--small';
  }

  title() {
    return app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.title');
  }

  content() {
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.platform_account_label')}</label>
            <input
              className="FormControl"
              type="text"
              placeholder={app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.platform_account_placeholder')}
              value={this.platformAccount}
              oninput={(e: Event) => {
                this.platformAccount = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div className="Form-group">
            <Button
              className="Button Button--primary"
              type="submit"
              loading={this.loading}
              disabled={!this.platformAccount.trim()}
              onclick={this.onsubmit.bind(this)}
            >
              {app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.submit')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  onsubmit(e: Event) {
    e.preventDefault();
    
    if (!this.platformAccount.trim()) {
      return;
    }

    this.loading = true;

    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/tournament/participate',
      body: {
        data: {
          attributes: {
            platformAccount: this.platformAccount.trim()
          }
        }
      }
    }).then(
      () => {
        this.hide();
        app.alerts.show('success', app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.success'));
        // Trigger a refresh of the tournament widget
        this.attrs.onParticipate?.();
      },
      (error) => {
        this.loading = false;
        const errorMessage = error?.response?.errors?.[0]?.detail || app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.error');
        app.alerts.show('error', errorMessage);
      }
    );
  }
}
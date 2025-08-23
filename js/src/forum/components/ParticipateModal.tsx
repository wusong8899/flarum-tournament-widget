import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import { Vnode } from 'mithril';

export default class ParticipateModal extends Modal {
  platformAccount: string = '';
  loading: boolean = false;

  className() {
    return 'ParticipateModal Modal--small';
  }

  title() {
    return '参加活动';
  }

  content() {
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <label className="FormLabel">平台账号</label>
            <input
              className="FormControl"
              type="text"
              placeholder="请输入您的平台账号"
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
              提交
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
        app.alerts.show('success', '参加成功！');
        // Trigger a refresh of the tournament widget
        m.redraw();
      },
      (error) => {
        this.loading = false;
        const errorMessage = error?.response?.errors?.[0]?.detail || '参加失败，请重试';
        app.alerts.show('error', errorMessage);
      }
    );
  }
}
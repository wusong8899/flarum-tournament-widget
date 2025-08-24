import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import m from 'mithril';
import { Vnode } from 'mithril';
import PlatformSelector from './PlatformSelector';
import type { TournamentPlatform } from '../types';

interface ParticipateModalAttrs {
  onParticipate?: () => void;
}

export default class ParticipateModal extends Modal<ParticipateModalAttrs> {
  platformAccount: string = '';
  platformUsername: string = '';
  selectedPlatform: TournamentPlatform | null = null;
  platforms: TournamentPlatform[] = [];
  loading: boolean = false;
  loadingPlatforms: boolean = true;

  oninit(vnode: Vnode<ParticipateModalAttrs>) {
    super.oninit(vnode);
    this.loadPlatforms();
  }

  className() {
    return 'ParticipateModal Modal--small';
  }

  title() {
    return app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.title');
  }

  content() {
    if (this.loadingPlatforms) {
      return (
        <div className="Modal-body">
          <div className="LoadingIndicator"></div>
          <p>加载平台信息中...</p>
        </div>
      );
    }

    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <PlatformSelector
              platforms={this.platforms}
              selectedPlatform={this.selectedPlatform}
              onPlatformSelect={(platform) => this.onPlatformSelect(platform)}
            />
          </div>
          <div className="Form-group">
            <label className="FormLabel">平台用户名</label>
            <input
              className="FormControl"
              type="text"
              placeholder="请输入您在该平台的用户名"
              value={this.platformUsername}
              oninput={(e: Event) => {
                this.platformUsername = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div className="Form-group">
            <Button
              className="Button Button--primary"
              type="submit"
              loading={this.loading}
              disabled={!this.selectedPlatform || !this.platformUsername.trim()}
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
    
    if (!this.selectedPlatform || !this.platformUsername.trim()) {
      return;
    }

    this.loading = true;

    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/tournament/participate',
      body: {
        data: {
          attributes: {
            platformId: this.selectedPlatform.id,
            platformUsername: this.platformUsername.trim(),
            // Keep legacy field for backward compatibility
            platformAccount: this.platformUsername.trim()
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

  private loadPlatforms() {
    app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/tournament/platforms'
    }).then(
      (response: any) => {
        this.platforms = response.data.map((platform: any) => ({
          id: platform.id,
          name: platform.attributes.name,
          iconUrl: platform.attributes.iconUrl,
          iconClass: platform.attributes.iconClass,
          isActive: platform.attributes.isActive,
          displayOrder: platform.attributes.displayOrder
        }));
        this.loadingPlatforms = false;
        m.redraw();
      },
      (error) => {
        console.error('Failed to load platforms:', error);
        this.loadingPlatforms = false;
        app.alerts.show('error', '加载平台信息失败');
        m.redraw();
      }
    );
  }

  private onPlatformSelect(platform: TournamentPlatform) {
    this.selectedPlatform = platform;
    // Clear username when switching platforms
    this.platformUsername = '';
  }
}
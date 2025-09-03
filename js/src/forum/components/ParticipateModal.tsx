import app from 'flarum/forum/app';
import Modal, { IInternalModalAttrs } from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import m from 'mithril';
import { Vnode } from 'mithril';
import PlatformSelector from './PlatformSelector';
import type { TournamentPlatform } from '../types';
import Platform from '../../common/models/Platform';

interface ParticipateModalAttrs extends IInternalModalAttrs {
  onParticipate?: () => void;
}

export default class ParticipateModal extends Modal<ParticipateModalAttrs> {
  platformAccount: string = '';
  platformUsername: Stream<string> = Stream('');
  winLossAmount: Stream<number> = Stream(0);
  winLossAmountText: Stream<string> = Stream('0');
  selectedPlatform: TournamentPlatform | null = null;
  platforms: TournamentPlatform[] = [];
  loading: boolean = false;
  loadingPlatforms: boolean = true;
  errors: Record<string, string> = {};

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
              onPlatformSelect={(platform: TournamentPlatform) => this.onPlatformSelect(platform)}
            />
            {this.errors.platform && (
              <div className="Alert Alert--error" style={{ marginTop: '8px' }}>
                {this.errors.platform}
              </div>
            )}
            {this.errors.platformId && (
              <div className="Alert Alert--error" style={{ marginTop: '8px' }}>
                {this.errors.platformId}
              </div>
            )}
          </div>
          <div className="Form-group">
            <label className="FormLabel">平台用户名</label>
            <input
              className={this.errors.platformUsername ? 'FormControl FormControl--error' : 'FormControl'}
              type="text"
              placeholder="请输入您在该平台的用户名（支持中文、英文、数字等任意字符）"
              bidi={this.platformUsername}
              oninput={() => {
                // Clear error when user starts typing
                if (this.errors.platformUsername) {
                  delete this.errors.platformUsername;
                  m.redraw();
                }
              }}
            />
            {this.errors.platformUsername && (
              <div className="Alert Alert--error" style={{ marginTop: '8px' }}>
                {this.errors.platformUsername}
              </div>
            )}
          </div>
          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.win_loss_amount_label')}</label>
            <input
              className={this.errors.winLossAmount ? 'FormControl FormControl--error' : 'FormControl'}
              type="number"
              placeholder={app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.win_loss_amount_placeholder')}
              value={this.winLossAmountText()}
              oninput={(e: Event) => {
                const value = (e.target as HTMLInputElement).value;
                this.winLossAmountText(value);
                
                // Update the numeric Stream with converted value
                if (value === '' || value === '-') {
                  this.winLossAmount(0);
                } else {
                  const numValue = parseInt(value) || 0;
                  this.winLossAmount(numValue);
                }
                
                // Clear error when user starts typing
                if (this.errors.winLossAmount) {
                  delete this.errors.winLossAmount;
                  m.redraw();
                }
              }}
            />
            {this.errors.winLossAmount && (
              <div className="Alert Alert--error" style={{ marginTop: '8px' }}>
                {this.errors.winLossAmount}
              </div>
            )}
          </div>
          <div className="Form-group">
            <Button
              className="Button Button--primary"
              type="submit"
              loading={this.loading}
              disabled={!this.selectedPlatform || !this.platformUsername().trim()}
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
    
    // Clear previous errors
    this.errors = {};
    
    // Client-side validation
    if (!this.selectedPlatform) {
      this.errors.platform = '需要选择平台';
    }
    
    if (!this.platformUsername().trim()) {
      this.errors.platformUsername = '需要输入平台用户名';
    }
    
    // If there are validation errors, don't submit
    if (Object.keys(this.errors).length > 0) {
      m.redraw();
      return;
    }

    this.loading = true;

    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/tournament/participate',
      body: {
        data: {
          attributes: {
            platformId: this.selectedPlatform!.id,
            platformUsername: this.platformUsername().trim(),
            winLossAmount: this.winLossAmount(),
            // Keep legacy field for backward compatibility
            platformAccount: this.platformUsername().trim()
          }
        }
      }
    }).then(
      () => {
        this.loading = false;
        app.modal.close();
        app.alerts.show({ type: 'success' }, app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.success'));
        // Trigger a refresh of the tournament widget
        this.attrs.onParticipate?.();
      },
      (error) => {
        this.loading = false;
        this.handleError(error);
        m.redraw();
      }
    );
  }

  private loadPlatforms() {
    app.store
      .find('platforms')
      .then((platforms: any) => {
        const list = platforms as Platform[];
        this.platforms = list.map((p: Platform) => ({
          id: p.id()!,
          name: p.name(),
          iconUrl: p.iconUrl(),
          iconClass: p.iconClass(),
          isActive: p.isActive(),
          displayOrder: p.displayOrder(),
        }));
        this.loadingPlatforms = false;
        m.redraw();
      })
      .catch((error) => {
        console.error('Failed to load platforms:', error);
        this.loadingPlatforms = false;
        app.alerts.show({ type: 'error' }, '加载平台信息失败');
        m.redraw();
      });
  }

  private onPlatformSelect(platform: TournamentPlatform) {
    this.selectedPlatform = platform;
    // Clear username when switching platforms
    this.platformUsername('');
    // Clear platform related errors
    delete this.errors.platform;
    delete this.errors.platformId;
  }

  private handleError(error: any) {
    // Clear previous errors
    this.errors = {};
    
    if (error?.response?.errors) {
      // Handle JSON:API validation errors
      const errors = error.response.errors;
      errors.forEach((err: any) => {
        if (err.source?.pointer) {
          const field = err.source.pointer.replace('/data/attributes/', '');
          this.errors[field] = err.detail || err.title;
        } else {
          // If error doesn't have a specific field, show as general message
          app.alerts.show({ type: 'error' }, err.detail || err.title || app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.error'));
        }
      });
    } else if (error?.response?.data?.errors) {
      // Handle Laravel validation errors
      const errors = error.response.data.errors;
      Object.keys(errors).forEach(field => {
        this.errors[field] = errors[field][0]; // Take first error message
      });
    } else {
      // Generic error handling
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          app.translator.trans('wusong8899-tournament-widget.forum.participate_modal.error');
      app.alerts.show({ type: 'error' }, errorMessage);
    }
  }
}
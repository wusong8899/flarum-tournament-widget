import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';
import m from 'mithril';
import PlatformManagement from './PlatformManagement';
import RankTitleManagement from './RankTitleManagement';
import ParticipantManagement from './ParticipantManagement';

export default class TournamentManagementPage extends ExtensionPage {
  private activeTab = Stream('general');
  private loading = false;
  private validationErrors: Record<string, string> = {};

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);
    app.setTitle(app.translator.trans('wusong8899-tournament-widget.admin.title'));
  }

  content() {
    if (this.loading) {
      return <LoadingIndicator />;
    }

    return (
      <div className="TournamentManagementPage">
        <div className="container">
          <div className="TournamentManagementPage-header">
            <h2>{app.translator.trans('wusong8899-tournament-widget.admin.title')}</h2>
            <p className="helpText">
              {app.translator.trans('wusong8899-tournament-widget.admin.description')}
            </p>
          </div>

          <nav className="TournamentManagementPage-tabs">
            {this.renderTab('general', 'wusong8899-tournament-widget.admin.tabs.general')}
            {this.renderTab('platforms', 'wusong8899-tournament-widget.admin.tabs.platforms')}
            {this.renderTab('rank_titles', 'wusong8899-tournament-widget.admin.tabs.rank_titles')}
            {this.renderTab('participants', 'wusong8899-tournament-widget.admin.tabs.participants')}
          </nav>

          <div className="TournamentManagementPage-content">
            {this.renderTabContent()}
          </div>
        </div>
      </div>
    );
  }

  private renderTab(tabName: string, labelKey: string): Mithril.Children {
    const isActive = this.activeTab() === tabName;
    
    return (
      <Button
        className={`Button Button--text TournamentManagementPage-tab ${isActive ? 'active' : ''}`}
        onclick={() => this.activeTab(tabName)}
      >
        {app.translator.trans(labelKey)}
      </Button>
    );
  }

  private renderTabContent(): Mithril.Children {
    switch (this.activeTab()) {
      case 'general':
        return this.renderGeneralSettings();
      case 'platforms':
        return <PlatformManagement />;
      case 'rank_titles':
        return <RankTitleManagement />;
      case 'participants':
        return <ParticipantManagement />;
      default:
        return this.renderGeneralSettings();
    }
  }

  private renderGeneralSettings(): Mithril.Children {
    return (
      <div className="TournamentManagementPage-generalSettings">
        <div className="Form">
          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.admin.settings.title_label')}</label>
            <input
              className="FormControl"
              type="text"
              bidi={this.setting('wusong8899_tournament.title')}
            />
            <div className="helpText">
              {app.translator.trans('wusong8899-tournament-widget.admin.settings.title_help')}
            </div>
          </div>

          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.admin.settings.prize_pool_label')}</label>
            <input
              className="FormControl"
              type="text"
              bidi={this.setting('wusong8899_tournament.prize_pool')}
            />
            <div className="helpText">
              {app.translator.trans('wusong8899-tournament-widget.admin.settings.prize_pool_help')}
            </div>
          </div>

          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.admin.settings.start_date_label')}</label>
            <input
              className={`FormControl ${this.validationErrors.start_date ? 'FormControl--error' : ''}`}
              type="datetime-local"
              value={this.formatDateForInput(this.setting('wusong8899_tournament.start_date')())}
              step="1"
              onchange={(e: Event) => this.validateAndSetDate((e.target as HTMLInputElement).value)}
            />
            {this.validationErrors.start_date && (
              <div className="FormGroup-error">
                {this.validationErrors.start_date}
              </div>
            )}
            <div className="helpText">
              {app.translator.trans('wusong8899-tournament-widget.admin.settings.start_date_help')}
            </div>
          </div>

          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.admin.settings.details_url_label')}</label>
            <input
              className={`FormControl ${this.validationErrors.details_url ? 'FormControl--error' : ''}`}
              type="url"
              bidi={this.setting('wusong8899_tournament.details_url')}
              onchange={(e: Event) => this.validateUrl('details_url', (e.target as HTMLInputElement).value)}
            />
            {this.validationErrors.details_url && (
              <div className="FormGroup-error">
                {this.validationErrors.details_url}
              </div>
            )}
            <div className="helpText">
              {app.translator.trans('wusong8899-tournament-widget.admin.settings.details_url_help')}
            </div>
          </div>

          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.admin.settings.background_image_label')}</label>
            <input
              className={`FormControl ${this.validationErrors.background_image ? 'FormControl--error' : ''}`}
              type="url"
              bidi={this.setting('wusong8899_tournament.background_image')}
              onchange={(e: Event) => this.validateUrl('background_image', (e.target as HTMLInputElement).value)}
            />
            {this.validationErrors.background_image && (
              <div className="FormGroup-error">
                {this.validationErrors.background_image}
              </div>
            )}
            <div className="helpText">
              {app.translator.trans('wusong8899-tournament-widget.admin.settings.background_image_help')}
            </div>
          </div>

          {this.submitButton()}
        </div>
      </div>
    );
  }

  private validateUrl(field: string, url: string): void {
    if (!url.trim()) {
      // Empty URL is valid (optional field)
      delete this.validationErrors[field];
      this.setting(`wusong8899_tournament.${field}`)(url);
      return;
    }

    try {
      new URL(url);
      delete this.validationErrors[field];
      this.setting(`wusong8899_tournament.${field}`)(url);
    } catch {
      this.validationErrors[field] = app.translator.trans('wusong8899-tournament-widget.admin.validation.invalid_url');
    }
    m.redraw();
  }

  private validateAndSetDate(dateStr: string): void {
    if (!dateStr.trim()) {
      delete this.validationErrors.start_date;
      this.setting('wusong8899_tournament.start_date')(dateStr);
      return;
    }

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      // Convert to ISO string format that backend expects
      const isoString = date.toISOString();
      delete this.validationErrors.start_date;
      this.setting('wusong8899_tournament.start_date')(isoString);
    } catch {
      this.validationErrors.start_date = app.translator.trans('wusong8899-tournament-widget.admin.validation.invalid_date');
    }
    m.redraw();
  }

  private formatDateForInput(isoString: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      
      // Format for datetime-local input (YYYY-MM-DDTHH:mm:ss)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    } catch {
      return '';
    }
  }

  saveSettings(e?: MouseEvent) {
    // Clear any existing validation errors
    this.validationErrors = {};
    
    // Validate before saving
    let hasErrors = false;
    
    const detailsUrl = this.setting('wusong8899_tournament.details_url')();
    if (detailsUrl && detailsUrl.trim()) {
      try {
        new URL(detailsUrl);
      } catch {
        this.validationErrors.details_url = app.translator.trans('wusong8899-tournament-widget.admin.validation.invalid_url');
        hasErrors = true;
      }
    }
    
    const backgroundImage = this.setting('wusong8899_tournament.background_image')();
    if (backgroundImage && backgroundImage.trim()) {
      try {
        new URL(backgroundImage);
      } catch {
        this.validationErrors.background_image = app.translator.trans('wusong8899-tournament-widget.admin.validation.invalid_url');
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      app.alerts.show({ type: 'error' }, app.translator.trans('wusong8899-tournament-widget.admin.validation.fix_errors'));
      m.redraw();
      return Promise.resolve();
    }
    
    return super.saveSettings(e).then(
      () => {
        // Flarum automatically shows success message
      },
      (error) => {
        console.error('Settings save error:', error);
        const errorMessage = error?.response?.errors?.[0]?.detail || app.translator.trans('wusong8899-tournament-widget.admin.settings.save_error');
        app.alerts.show({ type: 'error' }, errorMessage);
      }
    );
  }
}
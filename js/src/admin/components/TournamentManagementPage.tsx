import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';
import PlatformManagement from './PlatformManagement';
import RankTitleManagement from './RankTitleManagement';

export default class TournamentManagementPage extends ExtensionPage {
  private activeTab = Stream('general');
  private loading = false;

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
              value={this.setting('wusong8899_tournament.title')()}
              onchange={(e: Event) => this.setting('wusong8899_tournament.title')((e.target as HTMLInputElement).value)}
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
              value={this.setting('wusong8899_tournament.prize_pool')()}
              onchange={(e: Event) => this.setting('wusong8899_tournament.prize_pool')((e.target as HTMLInputElement).value)}
            />
            <div className="helpText">
              {app.translator.trans('wusong8899-tournament-widget.admin.settings.prize_pool_help')}
            </div>
          </div>

          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.admin.settings.start_date_label')}</label>
            <input
              className="FormControl"
              type="text"
              value={this.setting('wusong8899_tournament.start_date')()}
              onchange={(e: Event) => this.setting('wusong8899_tournament.start_date')((e.target as HTMLInputElement).value)}
            />
            <div className="helpText">
              {app.translator.trans('wusong8899-tournament-widget.admin.settings.start_date_help')}
            </div>
          </div>

          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.admin.settings.details_url_label')}</label>
            <input
              className="FormControl"
              type="url"
              value={this.setting('wusong8899_tournament.details_url')()}
              onchange={(e: Event) => this.setting('wusong8899_tournament.details_url')((e.target as HTMLInputElement).value)}
            />
            <div className="helpText">
              {app.translator.trans('wusong8899-tournament-widget.admin.settings.details_url_help')}
            </div>
          </div>

          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.admin.settings.background_image_label')}</label>
            <input
              className="FormControl"
              type="url"
              value={this.setting('wusong8899_tournament.background_image')()}
              onchange={(e: Event) => this.setting('wusong8899_tournament.background_image')((e.target as HTMLInputElement).value)}
            />
            <div className="helpText">
              {app.translator.trans('wusong8899-tournament-widget.admin.settings.background_image_help')}
            </div>
          </div>

          {this.submitButton()}
        </div>
      </div>
    );
  }
}
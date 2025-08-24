import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Switch from 'flarum/common/components/Switch';
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';

interface Platform {
  id: number;
  attributes: {
    name: string;
    iconUrl?: string;
    iconClass?: string;
    isActive: boolean;
    displayOrder: number;
  };
}

export default class PlatformManagement extends Component {
  private loading = true;
  private platforms: Platform[] = [];
  private newPlatformName = Stream('');
  private newPlatformIconUrl = Stream('');
  private newPlatformIconClass = Stream('');
  private submitting = false;

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);
    this.loadPlatforms();
  }

  view(): Mithril.Children {
    if (this.loading) {
      return <LoadingIndicator />;
    }

    return (
      <div className="PlatformManagement">
        <div className="PlatformManagement-header">
          <h3>{app.translator.trans('wusong8899-tournament-widget.admin.platforms.title')}</h3>
        </div>

        <div className="PlatformManagement-addForm">
          <h4>{app.translator.trans('wusong8899-tournament-widget.admin.platforms.add_button')}</h4>
          
          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.admin.platforms.name_label')}</label>
            <input
              className="FormControl"
              type="text"
              value={this.newPlatformName()}
              onchange={(e: Event) => this.newPlatformName((e.target as HTMLInputElement).value)}
              placeholder={app.translator.trans('wusong8899-tournament-widget.admin.platforms.name_help')}
            />
          </div>

          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.admin.platforms.icon_url_label')}</label>
            <input
              className="FormControl"
              type="url"
              value={this.newPlatformIconUrl()}
              onchange={(e: Event) => this.newPlatformIconUrl((e.target as HTMLInputElement).value)}
              placeholder={app.translator.trans('wusong8899-tournament-widget.admin.platforms.icon_url_help')}
            />
          </div>

          <div className="Form-group">
            <label className="FormLabel">{app.translator.trans('wusong8899-tournament-widget.admin.platforms.icon_class_label')}</label>
            <input
              className="FormControl"
              type="text"
              value={this.newPlatformIconClass()}
              onchange={(e: Event) => this.newPlatformIconClass((e.target as HTMLInputElement).value)}
              placeholder={app.translator.trans('wusong8899-tournament-widget.admin.platforms.icon_class_help')}
            />
          </div>

          <Button
            className="Button Button--primary"
            loading={this.submitting}
            onclick={() => this.createPlatform()}
          >
            {app.translator.trans('wusong8899-tournament-widget.admin.platforms.add_button')}
          </Button>
        </div>

        <div className="PlatformManagement-list">
          <h4>Existing Platforms</h4>
          {this.platforms.length > 0 ? (
            <div className="PlatformList">
              {this.platforms.map((platform) => (
                <div key={platform.id} className="PlatformList-item">
                  <div className="platform-info">
                    <div className="platform-icon">
                      {this.renderPlatformIcon(platform)}
                    </div>
                    <div className="platform-details">
                      <div className="platform-name">{platform.attributes.name}</div>
                      <div className="platform-meta">
                        {platform.attributes.iconUrl && (
                          <span className="meta-item">URL Icon: {platform.attributes.iconUrl}</span>
                        )}
                        {platform.attributes.iconClass && (
                          <span className="meta-item">CSS Icon: {platform.attributes.iconClass}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="platform-controls">
                    <Switch
                      state={platform.attributes.isActive}
                      onchange={(checked: boolean) => this.updatePlatform(platform.id, { isActive: checked })}
                    >
                      {platform.attributes.isActive 
                        ? app.translator.trans('wusong8899-tournament-widget.admin.platforms.enable')
                        : app.translator.trans('wusong8899-tournament-widget.admin.platforms.disable')
                      }
                    </Switch>
                    <Button
                      className="Button Button--danger Button--icon"
                      icon="fas fa-trash"
                      onclick={() => this.deletePlatform(platform.id)}
                      title="Delete Platform"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="PlatformList-empty">
              {app.translator.trans('wusong8899-tournament-widget.admin.platforms.empty')}
            </div>
          )}
        </div>
      </div>
    );
  }

  private async loadPlatforms(): Promise<void> {
    try {
      const response = await app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/tournament/platforms'
      });

      this.platforms = response.data || [];
      this.loading = false;
      m.redraw();
    } catch (error) {
      console.error('Failed to load platforms:', error);
      this.loading = false;
      m.redraw();
    }
  }

  private async createPlatform(): Promise<void> {
    if (!this.newPlatformName().trim()) {
      app.alerts.show({ type: 'error' }, 'Platform name is required');
      return;
    }

    this.submitting = true;
    m.redraw();

    try {
      const response = await app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/tournament/platforms',
        body: {
          data: {
            type: 'platforms',
            attributes: {
              name: this.newPlatformName(),
              iconUrl: this.newPlatformIconUrl() || null,
              iconClass: this.newPlatformIconClass() || null,
              isActive: true,
              displayOrder: this.platforms.length
            }
          }
        }
      });

      this.platforms.push(response.data);
      
      // Clear form
      this.newPlatformName('');
      this.newPlatformIconUrl('');
      this.newPlatformIconClass('');

      app.alerts.show({ type: 'success' }, 'Platform created successfully');
    } catch (error) {
      console.error('Failed to create platform:', error);
      app.alerts.show({ type: 'error' }, 'Failed to create platform');
    } finally {
      this.submitting = false;
      m.redraw();
    }
  }

  private async updatePlatform(id: number, attributes: Partial<Platform['attributes']>): Promise<void> {
    try {
      const response = await app.request({
        method: 'PATCH',
        url: app.forum.attribute('apiUrl') + `/tournament/platforms/` + id,
        body: {
          data: {
            type: 'platforms',
            attributes
          }
        }
      });

      // Update platform in list
      const index = this.platforms.findIndex(p => p.id === id);
      if (index !== -1) {
        this.platforms[index] = response.data;
        m.redraw();
      }
    } catch (error) {
      console.error('Failed to update platform:', error);
      app.alerts.show({ type: 'error' }, 'Failed to update platform');
    }
  }

  private async deletePlatform(id: number): Promise<void> {
    if (!confirm('Are you sure you want to delete this platform?')) {
      return;
    }

    try {
      await app.request({
        method: 'DELETE',
        url: app.forum.attribute('apiUrl') + `/tournament/platforms/${id}`
      });

      this.platforms = this.platforms.filter(p => p.id !== id);
      app.alerts.show({ type: 'success' }, 'Platform deleted successfully');
      m.redraw();
    } catch (error) {
      console.error('Failed to delete platform:', error);
      app.alerts.show({ type: 'error' }, 'Failed to delete platform');
    }
  }

  private renderPlatformIcon(platform: Platform): Mithril.Children {
    const { iconUrl, iconClass } = platform.attributes;
    
    if (iconUrl) {
      return <img src={iconUrl} alt={platform.attributes.name} className="platform-icon-img" />;
    } else if (iconClass) {
      return <i className={`platform-icon-css ${iconClass}`}></i>;
    } else {
      return <i className="platform-icon-css fas fa-gamepad"></i>;
    }
  }
}
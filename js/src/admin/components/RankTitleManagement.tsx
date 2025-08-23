import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';

interface RankTitleEntry {
  id: string;
  rank: string;
  title: string;
}

export default class RankTitleManagement extends Component {
  private loading = true;
  private saving = false;
  private rankTitles: { [key: string]: string } = {};
  private entries: RankTitleEntry[] = [];
  private nextId = 1;

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);
    this.loadRankTitles();
  }

  view(): Mithril.Children {
    if (this.loading) {
      return <LoadingIndicator />;
    }

    return (
      <div className="RankTitleManagement">
        <div className="RankTitleManagement-header">
          <h3>{app.translator.trans('wusong8899-tournament-widget.admin.rank_titles.title')}</h3>
          <div className="helpText">
            {app.translator.trans('wusong8899-tournament-widget.admin.rank_titles.help')}
          </div>
        </div>

        <div className="RankTitleManagement-list">
          <div className="RankTitleManagement-listHeader">
            <div className="rank-column">{app.translator.trans('wusong8899-tournament-widget.admin.rank_titles.rank_label')}</div>
            <div className="title-column">{app.translator.trans('wusong8899-tournament-widget.admin.rank_titles.title_label')}</div>
            <div className="actions-column">Actions</div>
          </div>

          {this.entries.map((entry) => (
            <div key={entry.id} className="RankTitleManagement-entry">
              <div className="rank-column">
                <input
                  className="FormControl"
                  type="text"
                  value={entry.rank}
                  placeholder="1, 2-5, default"
                  onchange={(e: Event) => this.updateEntryRank(entry.id, (e.target as HTMLInputElement).value)}
                />
              </div>
              <div className="title-column">
                <input
                  className="FormControl"
                  type="text"
                  value={entry.title}
                  placeholder={app.translator.trans('wusong8899-tournament-widget.admin.rank_titles.title_placeholder')}
                  onchange={(e: Event) => this.updateEntryTitle(entry.id, (e.target as HTMLInputElement).value)}
                />
              </div>
              <div className="actions-column">
                <Button
                  className="Button Button--icon"
                  icon="fas fa-times"
                  onclick={() => this.removeEntry(entry.id)}
                  title="Remove"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="RankTitleManagement-actions">
          <Button
            className="Button"
            icon="fas fa-plus"
            onclick={() => this.addEntry()}
          >
            {app.translator.trans('wusong8899-tournament-widget.admin.rank_titles.add_rank')}
          </Button>

          <Button
            className="Button Button--primary"
            loading={this.saving}
            onclick={() => this.saveRankTitles()}
          >
            {app.translator.trans('wusong8899-tournament-widget.admin.rank_titles.save_button')}
          </Button>
        </div>

        <div className="RankTitleManagement-preview">
          <h4>{app.translator.trans('wusong8899-tournament-widget.admin.rank_titles.preview_title')}</h4>
          <div className="preview-content">
            {this.renderPreview()}
          </div>
        </div>
      </div>
    );
  }

  private async loadRankTitles(): Promise<void> {
    try {
      const response = await app.request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/tournament/rank-titles'
      });

      this.rankTitles = response.data.attributes.rankTitles || {};
      this.entriesFromRankTitles();
      this.loading = false;
      m.redraw();
    } catch (error) {
      console.error('Failed to load rank titles:', error);
      this.loading = false;
      m.redraw();
    }
  }

  private entriesFromRankTitles(): void {
    this.entries = [];
    this.nextId = 1;

    Object.entries(this.rankTitles).forEach(([rank, title]) => {
      this.entries.push({
        id: String(this.nextId++),
        rank,
        title
      });
    });

    // Add empty entry if no entries exist
    if (this.entries.length === 0) {
      this.addEntry();
    }
  }

  private addEntry(): void {
    this.entries.push({
      id: String(this.nextId++),
      rank: '',
      title: ''
    });
    m.redraw();
  }

  private removeEntry(id: string): void {
    this.entries = this.entries.filter(entry => entry.id !== id);
    m.redraw();
  }

  private updateEntryRank(id: string, rank: string): void {
    const entry = this.entries.find(e => e.id === id);
    if (entry) {
      entry.rank = rank;
      m.redraw();
    }
  }

  private updateEntryTitle(id: string, title: string): void {
    const entry = this.entries.find(e => e.id === id);
    if (entry) {
      entry.title = title;
      m.redraw();
    }
  }

  private async saveRankTitles(): Promise<void> {
    this.saving = true;
    m.redraw();

    // Convert entries to rank titles object
    const rankTitles: { [key: string]: string } = {};
    this.entries.forEach(entry => {
      if (entry.rank.trim() && entry.title.trim()) {
        rankTitles[entry.rank.trim()] = entry.title.trim();
      }
    });

    try {
      await app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/tournament/rank-titles',
        body: {
          data: {
            type: 'rank-titles',
            attributes: {
              rankTitles
            }
          }
        }
      });

      this.rankTitles = rankTitles;
      app.alerts.show({ type: 'success' }, app.translator.trans('core.admin.saved_message'));
    } catch (error) {
      console.error('Failed to save rank titles:', error);
      app.alerts.show({ type: 'error' }, 'Failed to save rank titles');
    } finally {
      this.saving = false;
      m.redraw();
    }
  }

  private renderPreview(): Mithril.Children {
    const previewRanks = [1, 2, 3, 5, 15, 25];
    
    return (
      <div className="preview-list">
        {previewRanks.map(rank => {
          const title = this.getTitleForRank(rank);
          return (
            <div key={rank} className="preview-item">
              <span className="preview-rank">#{rank}</span>
              <span className="preview-title">{title}</span>
            </div>
          );
        })}
      </div>
    );
  }

  private getTitleForRank(rank: number): string {
    // Use current entries to determine title
    const rankTitles: { [key: string]: string } = {};
    this.entries.forEach(entry => {
      if (entry.rank.trim() && entry.title.trim()) {
        rankTitles[entry.rank.trim()] = entry.title.trim();
      }
    });

    // Check exact match first
    if (rankTitles[String(rank)]) {
      return rankTitles[String(rank)];
    }

    // Check ranges
    for (const [key, title] of Object.entries(rankTitles)) {
      if (key.includes('-')) {
        const [start, end] = key.split('-').map(Number);
        if (rank >= start && rank <= end) {
          return title;
        }
      }
    }

    // Return default
    return rankTitles.default || '参赛选手';
  }
}
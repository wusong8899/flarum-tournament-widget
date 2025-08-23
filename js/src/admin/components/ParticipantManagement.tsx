import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import type Mithril from 'mithril';

interface Participant {
  id: string;
  score: number;
  platformUsername: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  platform?: {
    id: string;
    name: string;
  };
}

export default class ParticipantManagement extends Component {
  private participants: Participant[] = [];
  private loading = false;
  private saving = false;
  private deleting = false;
  private editingScores: Record<string, number> = {};

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);
    this.loadParticipants();
  }

  view() {
    if (this.loading) {
      return <LoadingIndicator />;
    }

    return (
      <div className="ParticipantManagement">
        <div className="ParticipantManagement-header">
          <h3>{app.translator.trans('wusong8899-tournament-widget.admin.participants.title')}</h3>
          <p className="helpText">
            {app.translator.trans('wusong8899-tournament-widget.admin.participants.description')}
          </p>
        </div>

        {this.participants.length === 0 ? (
          <div className="ParticipantManagement-empty">
            <p>{app.translator.trans('wusong8899-tournament-widget.admin.participants.no_participants')}</p>
          </div>
        ) : (
          <div className="ParticipantManagement-table">
            <table className="Table">
              <thead>
                <tr>
                  <th>{app.translator.trans('wusong8899-tournament-widget.admin.participants.user')}</th>
                  <th>{app.translator.trans('wusong8899-tournament-widget.admin.participants.platform')}</th>
                  <th>{app.translator.trans('wusong8899-tournament-widget.admin.participants.score')}</th>
                  <th>{app.translator.trans('wusong8899-tournament-widget.admin.participants.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {this.participants.map((participant) => (
                  <tr key={participant.id}>
                    <td>
                      <div className="ParticipantManagement-user">
                        {participant.user.avatarUrl && (
                          <img
                            src={participant.user.avatarUrl}
                            alt={participant.user.displayName}
                            className="Avatar Avatar--size-small"
                          />
                        )}
                        <span className="username">
                          {participant.user.displayName || participant.user.username}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="ParticipantManagement-platform">
                        <span className="platform-name">
                          {participant.platform?.name || 'Unknown'}
                        </span>
                        {participant.platformUsername && (
                          <span className="platform-username">
                            ({participant.platformUsername})
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="FormControl FormControl--compact"
                        value={this.editingScores[participant.id] ?? participant.score}
                        oninput={(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          this.editingScores[participant.id] = parseInt(target.value) || 0;
                        }}
                        min="0"
                      />
                    </td>
                    <td>
                      <div style="display: flex; gap: 8px; justify-content: center;">
                        <Button
                          className="Button Button--primary Button--size-small"
                          loading={this.saving}
                          disabled={this.saving || this.deleting}
                          onclick={() => this.updateScore(participant)}
                        >
                          {app.translator.trans('wusong8899-tournament-widget.admin.participants.update')}
                        </Button>
                        <Button
                          className="Button Button--danger Button--size-small"
                          loading={this.deleting}
                          disabled={this.saving || this.deleting}
                          onclick={() => this.confirmDeleteParticipant(participant)}
                        >
                          {app.translator.trans('wusong8899-tournament-widget.admin.participants.remove')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="ParticipantManagement-actions">
          <Button
            className="Button"
            onclick={() => this.loadParticipants()}
            loading={this.loading}
          >
            {app.translator.trans('wusong8899-tournament-widget.admin.participants.refresh')}
          </Button>
        </div>
      </div>
    );
  }

  private async loadParticipants(): Promise<void> {
    this.loading = true;
    m.redraw();

    try {
      const response = await app.request({
        method: 'GET',
        url: `${app.forum.attribute('apiUrl')}/tournament/participants?include=user,platform`,
      });

      // Handle included data properly
      const included = response.included || [];
      const users = included.filter((item: any) => item.type === 'users');
      const platforms = included.filter((item: any) => item.type === 'platforms');

      this.participants = response.data.map((item: any) => {
        // Find related user
        const userId = item.relationships?.user?.data?.id;
        const user = users.find((u: any) => u.id === userId);
        
        // Find related platform
        const platformId = item.relationships?.platform?.data?.id;
        const platform = platforms.find((p: any) => p.id === platformId);

        return {
          id: item.id,
          score: item.attributes.score,
          platformUsername: item.attributes.platformUsername,
          createdAt: item.attributes.createdAt,
          user: user ? {
            id: user.id,
            username: user.attributes?.username || 'Unknown',
            displayName: user.attributes?.displayName || 'Unknown',
            avatarUrl: user.attributes?.avatarUrl,
          } : {
            id: '0',
            username: 'Deleted User',
            displayName: 'Deleted User',
          },
          platform: platform ? {
            id: platform.id,
            name: platform.attributes?.name || 'Unknown',
          } : undefined,
        };
      });

      // Initialize editing scores
      this.editingScores = {};
      this.participants.forEach(participant => {
        this.editingScores[participant.id] = participant.score;
      });
    } catch (error) {
      console.error('Failed to load participants:', error);
      app.alerts.show({ type: 'error' }, app.translator.trans('wusong8899-tournament-widget.admin.participants.load_error'));
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  private async updateScore(participant: Participant): Promise<void> {
    const newScore = this.editingScores[participant.id];
    if (newScore === participant.score) {
      return; // No change
    }

    this.saving = true;
    m.redraw();

    try {
      await app.request({
        method: 'PATCH',
        url: `${app.forum.attribute('apiUrl')}/tournament/participants/${participant.id}`,
        body: {
          data: {
            type: 'participants',
            id: participant.id,
            attributes: {
              score: newScore,
            },
          },
        },
      });

      // Update local state
      participant.score = newScore;
      app.alerts.show({ type: 'success' }, app.translator.trans('wusong8899-tournament-widget.admin.participants.update_success'));
    } catch (error) {
      console.error('Failed to update score:', error);
      app.alerts.show({ type: 'error' }, app.translator.trans('wusong8899-tournament-widget.admin.participants.update_error'));
      // Revert editing score on error
      this.editingScores[participant.id] = participant.score;
    } finally {
      this.saving = false;
      m.redraw();
    }
  }

  private confirmDeleteParticipant(participant: Participant): void {
    const confirmMessage = app.translator.trans(
      'wusong8899-tournament-widget.admin.participants.confirm_remove',
      { username: participant.user.displayName || participant.user.username }
    );

    if (confirm(confirmMessage)) {
      this.deleteParticipant(participant);
    }
  }

  private async deleteParticipant(participant: Participant): Promise<void> {
    this.deleting = true;
    m.redraw();

    try {
      await app.request({
        method: 'DELETE',
        url: `${app.forum.attribute('apiUrl')}/tournament/participants/${participant.id}`,
      });

      // Remove participant from local state
      this.participants = this.participants.filter(p => p.id !== participant.id);
      delete this.editingScores[participant.id];

      app.alerts.show(
        { type: 'success' },
        app.translator.trans('wusong8899-tournament-widget.admin.participants.remove_success')
      );
    } catch (error) {
      console.error('Failed to delete participant:', error);
      app.alerts.show(
        { type: 'error' },
        app.translator.trans('wusong8899-tournament-widget.admin.participants.remove_error')
      );
    } finally {
      this.deleting = false;
      m.redraw();
    }
  }
}
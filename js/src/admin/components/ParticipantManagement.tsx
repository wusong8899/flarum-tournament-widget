import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import extractText from 'flarum/common/utils/extractText';
import m, { VnodeDOM } from 'mithril';

// JSON:API response types
interface JsonApiResource {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
  relationships?: Record<string, {
    data?: { id: string; type: string } | null;
  }>;
}

interface JsonApiResponse {
  data: JsonApiResource[];
  included?: JsonApiResource[];
}

interface AdminParticipant {
  id: number;
  amount: number;
  score: number;
  initialScore: number;
  platformUsername: string;
  isApproved: boolean;
  approvedAt?: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string;
    money: number;
  };
  platform?: {
    id: number;
    name: string;
  };
  approvedBy?: {
    id: number;
    username: string;
    displayName: string;
  };
}

export default class ParticipantManagement extends Component {
  private participants: AdminParticipant[] = [];
  private loading = false;
  private saving = false;
  private deleting = false;
  private approving = false;
  private activeTab = 'all'; // 'all', 'pending', 'approved'
  private editingScores: Record<number, number | string> = {};

  oninit(vnode: VnodeDOM) {
    super.oninit(vnode);
    this.loadParticipants();
  }

  view() {
    if (this.loading) {
      return <LoadingIndicator />;
    }

    const filteredParticipants = this.getFilteredParticipants();
    const pendingCount = this.participants.filter(p => !p.isApproved).length;

    return (
      <div className="ParticipantManagement">
        <div className="ParticipantManagement-header">
          <h3>{app.translator.trans('wusong8899-tournament-widget.admin.participants.title')}</h3>
          <p className="helpText">
            {app.translator.trans('wusong8899-tournament-widget.admin.participants.description')}
          </p>
        </div>

        {/* Tab navigation */}
        <div className="ParticipantManagement-tabs">
          <button 
            className={this.activeTab === 'all' ? 'Button Button--primary' : 'Button'}
            onclick={() => this.switchTab('all')}
          >
            {app.translator.trans('wusong8899-tournament-widget.admin.participants.tab_all')} ({this.participants.length})
          </button>
          <button 
            className={this.activeTab === 'pending' ? 'Button Button--primary' : 'Button'}
            onclick={() => this.switchTab('pending')}
          >
            {app.translator.trans('wusong8899-tournament-widget.admin.participants.tab_pending')} ({pendingCount})
          </button>
          <button 
            className={this.activeTab === 'approved' ? 'Button Button--primary' : 'Button'}
            onclick={() => this.switchTab('approved')}
          >
            {app.translator.trans('wusong8899-tournament-widget.admin.participants.tab_approved')} ({this.participants.length - pendingCount})
          </button>
        </div>

        {filteredParticipants.length === 0 ? (
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
                  <th>{app.translator.trans('wusong8899-tournament-widget.admin.participants.status')}</th>
                  <th>{app.translator.trans('wusong8899-tournament-widget.admin.participants.initial_score')}</th>
                  <th>{app.translator.trans('wusong8899-tournament-widget.admin.participants.score')}</th>
                  <th>{app.translator.trans('wusong8899-tournament-widget.admin.participants.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant) => (
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
                      <div className="ParticipantManagement-status">
                        {participant.isApproved ? (
                          <span className="Badge Badge--success">
                            {app.translator.trans('wusong8899-tournament-widget.admin.participants.status_approved')}
                          </span>
                        ) : (
                          <span className="Badge Badge--danger">
                            {app.translator.trans('wusong8899-tournament-widget.admin.participants.status_pending')}
                          </span>
                        )}
                        {participant.approvedAt && participant.approvedBy && (
                          <div className="ParticipantManagement-approvedInfo">
                            <small>
                              {app.translator.trans('wusong8899-tournament-widget.admin.participants.approved_by', {
                                username: participant.approvedBy.displayName || participant.approvedBy.username,
                                date: new Date(participant.approvedAt).toLocaleDateString()
                              })}
                            </small>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div 
                        className="ParticipantManagement-initialScore"
                        data-negative={participant.initialScore < 0 ? "true" : "false"}
                        data-positive={participant.initialScore > 0 ? "true" : "false"}
                      >
                        <strong>{participant.initialScore || 0}</strong>
                      </div>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <input
                          type="number"
                          className="FormControl"
                          style="width: 100px;"
                          value={this.editingScores[participant.id] ?? participant.score}
                          oninput={(e: any) => {
                            const value = e.target.value;
                            // Allow negative numbers and empty input during editing
                            if (value === '' || value === '-') {
                              this.editingScores[participant.id] = value;
                            } else {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue)) {
                                this.editingScores[participant.id] = numValue;
                              }
                            }
                          }}
                        />
                        <Button
                          className="Button Button--primary Button--size-small"
                          loading={this.saving}
                          disabled={this.saving || this.deleting || this.approving}
                          onclick={() => this.updateScore(participant)}
                        >
                          {app.translator.trans('wusong8899-tournament-widget.admin.participants.update')}
                        </Button>
                      </div>
                    </td>
                    <td>
                      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                        {!participant.isApproved && (
                          <>
                            <Button
                              className="Button Button--success Button--size-small"
                              loading={this.approving}
                              disabled={this.saving || this.deleting || this.approving}
                              onclick={() => this.approveParticipant(participant)}
                            >
                              {app.translator.trans('wusong8899-tournament-widget.admin.participants.approve')}
                            </Button>
                            <Button
                              className="Button Button--warning Button--size-small"
                              loading={this.approving}
                              disabled={this.saving || this.deleting || this.approving}
                              onclick={() => this.rejectParticipant(participant)}
                            >
                              {app.translator.trans('wusong8899-tournament-widget.admin.participants.reject')}
                            </Button>
                          </>
                        )}
                        <Button
                          className="Button Button--danger Button--size-small"
                          loading={this.deleting}
                          disabled={this.saving || this.deleting || this.approving}
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
      const response = await app.request<JsonApiResponse>({
        method: 'GET',
        url: `${app.forum.attribute('apiUrl')}/tournament/participants`,
        params: { include: 'user,platform,approvedBy' },
      });

      const findIncluded = (type: string, id: string) =>
        response.included?.find((res) => res.type === type && res.id === id);

      this.participants = (response.data || []).map((res: JsonApiResource): AdminParticipant => {
        const attrs = (res.attributes || {}) as any;
        const rels = (res.relationships || {}) as Record<string, { data?: { id: string; type: string } | null }>;

        const userRef = rels.user?.data as { id: string; type: string } | undefined;
        const platformRef = rels.platform?.data as { id: string; type: string } | undefined;
        const approvedByRef = rels.approvedBy?.data as { id: string; type: string } | undefined;

        const userRes = userRef ? findIncluded('users', userRef.id) : undefined;
        const platformRes = platformRef ? findIncluded('platforms', platformRef.id) : undefined;
        const approvedByRes = approvedByRef ? findIncluded('users', approvedByRef.id) : undefined;

        return {
          id: parseInt(res.id, 10),
          amount: (attrs.score as number) || 0,
          score: (attrs.score as number) || 0,
          initialScore: (attrs.initialScore as number) || 0,
          platformUsername: (attrs.platformUsername as string) || '',
          isApproved: !!attrs.isApproved,
          approvedAt: attrs.approvedAt ? new Date(attrs.approvedAt as string).toISOString() : undefined,
          createdAt: attrs.createdAt ? new Date(attrs.createdAt as string).toISOString() : '',
          user: userRes
            ? {
                id: parseInt(userRes.id, 10),
                username: (userRes.attributes['username'] as string) || 'Unknown',
                displayName:
                  (userRes.attributes['displayName'] as string) ||
                  (userRes.attributes['username'] as string) ||
                  'Unknown',
                avatarUrl: (userRes.attributes['avatarUrl'] as string | undefined) || undefined,
                money: ((userRes.attributes as any)['money'] as number | undefined) ?? 0,
              }
            : {
                id: 0,
                username: 'Deleted User',
                displayName: 'Deleted User',
                money: 0,
              },
          platform: platformRes
            ? {
                id: parseInt(platformRes.id, 10),
                name: (platformRes.attributes['name'] as string) || 'Unknown',
              }
            : undefined,
          approvedBy: approvedByRes
            ? {
                id: parseInt(approvedByRes.id, 10),
                username: (approvedByRes.attributes['username'] as string) || 'Unknown',
                displayName:
                  (approvedByRes.attributes['displayName'] as string) ||
                  (approvedByRes.attributes['username'] as string) ||
                  'Unknown',
              }
            : undefined,
        };
      });
    } catch (error) {
      console.error('Failed to load participants:', error);
      app.alerts.show({ type: 'error' }, app.translator.trans('wusong8899-tournament-widget.admin.participants.load_error'));
    } finally {
      this.loading = false;
      m.redraw();
    }
  }


  private confirmDeleteParticipant(participant: AdminParticipant): void {
    const confirmMessage = extractText(
      app.translator.trans(
        'wusong8899-tournament-widget.admin.participants.confirm_remove',
        { username: participant.user.displayName || participant.user.username }
      )
    );

    if (confirm(confirmMessage)) {
      this.deleteParticipant(participant);
    }
  }

  private async deleteParticipant(participant: AdminParticipant): Promise<void> {
    this.deleting = true;
    m.redraw();

    try {
      const model = app.store.getById('participants', String(participant.id)) as any;
      if (model) {
        await model.delete();
      } else {
        await app.request({
          method: 'DELETE',
          url: `${app.forum.attribute('apiUrl')}/tournament/participants/${participant.id}`
        });
      }

      // Remove participant from local state
      this.participants = this.participants.filter(p => p.id !== participant.id);

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

  private async updateScore(participant: AdminParticipant): Promise<void> {
    const newScore = this.editingScores[participant.id];
    
    // Handle empty or invalid input
    if (newScore === '' || newScore === '-') {
      return;
    }
    
    const scoreValue = typeof newScore === 'number' ? newScore : parseInt(newScore, 10);
    if (isNaN(scoreValue) || scoreValue === participant.score) {
      return; // No change or invalid input
    }

    this.saving = true;
    m.redraw();

    try {
      const model = app.store.getById('participants', String(participant.id)) as any;
      if (model) {
        await model.save({ score: scoreValue });
      } else {
        await app.request({
          method: 'PATCH',
          url: `${app.forum.attribute('apiUrl')}/tournament/participants/${participant.id}`,
          body: {
            data: {
              type: 'participants',
              attributes: {
                score: scoreValue,
              },
            },
          },
        });
      }

      // Update local state
      participant.score = scoreValue;
      participant.amount = scoreValue; // Keep amount in sync
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

  private getFilteredParticipants(): AdminParticipant[] {
    switch (this.activeTab) {
      case 'pending':
        return this.participants.filter(p => !p.isApproved);
      case 'approved':
        return this.participants.filter(p => p.isApproved);
      case 'all':
      default:
        return this.participants;
    }
  }

  private switchTab(tab: string): void {
    this.activeTab = tab;
    m.redraw();
  }

  private async approveParticipant(participant: AdminParticipant): Promise<void> {
    this.approving = true;
    m.redraw();

    try {
      await app.request({
        method: 'PATCH',
        url: `${app.forum.attribute('apiUrl')}/tournament/participants/${participant.id}/approve`,
        body: {
          data: {
            type: 'participants',
            attributes: {
              action: 'approve',
            },
          },
        },
      });

      // Update local state
      participant.isApproved = true;
      participant.approvedAt = new Date().toISOString();
      
      app.alerts.show(
        { type: 'success' }, 
        app.translator.trans('wusong8899-tournament-widget.admin.participants.approve_success')
      );
    } catch (error) {
      console.error('Failed to approve participant:', error);
      app.alerts.show(
        { type: 'error' }, 
        app.translator.trans('wusong8899-tournament-widget.admin.participants.approve_error')
      );
    } finally {
      this.approving = false;
      m.redraw();
    }
  }

  private async rejectParticipant(participant: AdminParticipant): Promise<void> {
    const confirmMessage = extractText(
      app.translator.trans(
        'wusong8899-tournament-widget.admin.participants.confirm_reject',
        { username: participant.user.displayName || participant.user.username }
      )
    );

    if (!confirm(confirmMessage)) {
      return;
    }

    this.approving = true;
    m.redraw();

    try {
      await app.request({
        method: 'PATCH',
        url: `${app.forum.attribute('apiUrl')}/tournament/participants/${participant.id}/approve`,
        body: {
          data: {
            type: 'participants',
            attributes: {
              action: 'reject',
            },
          },
        },
      });

      // Remove participant from local state
      this.participants = this.participants.filter(p => p.id !== participant.id);
      
      app.alerts.show(
        { type: 'success' }, 
        app.translator.trans('wusong8899-tournament-widget.admin.participants.reject_success')
      );
    } catch (error) {
      console.error('Failed to reject participant:', error);
      app.alerts.show(
        { type: 'error' }, 
        app.translator.trans('wusong8899-tournament-widget.admin.participants.reject_error')
      );
    } finally {
      this.approving = false;
      m.redraw();
    }
  }
}
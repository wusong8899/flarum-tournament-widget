import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import type Mithril from 'mithril';

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

interface Participant {
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
  private participants: Participant[] = [];
  private loading = false;
  private saving = false;
  private deleting = false;
  private approving = false;
  private activeTab = 'all'; // 'all', 'pending', 'approved'
  private editingScores: Record<number, number> = {};

  oninit(vnode: Mithril.VnodeDOM) {
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
      const response = await app.request({
        method: 'GET',
        url: `${app.forum.attribute('apiUrl')}/tournament/participants?include=user,platform`,
      });

      // Handle included data properly with proper typing
      const apiResponse = response as JsonApiResponse;
      const included = apiResponse.included || [];
      const users = included.filter((item): item is JsonApiResource => item.type === 'users');
      const platforms = included.filter((item): item is JsonApiResource => item.type === 'platforms');

      this.participants = apiResponse.data.map((item): Participant => {
        // Find related user
        const userId = item.relationships?.user?.data?.id;
        const userResource = users.find((u) => u.id === userId);
        
        // Find related platform
        const platformId = item.relationships?.platform?.data?.id;
        const platformResource = platforms.find((p) => p.id === platformId);

        // Safely extract participant attributes
        const participantAttrs = item.attributes as {
          amount?: number;
          score?: number;
          initialScore?: number;
          platformUsername?: string;
          isApproved?: boolean;
          approvedAt?: string;
          createdAt?: string;
        };

        // Safely extract user attributes
        const userAttrs = userResource?.attributes as {
          username?: string;
          displayName?: string;
          avatarUrl?: string;
        } | undefined;

        // Find related approver
        const approverId = item.relationships?.approvedBy?.data?.id;
        const approverResource = users.find((u) => u.id === approverId);

        // Safely extract platform attributes
        const platformAttrs = platformResource?.attributes as {
          name?: string;
        } | undefined;

        // Safely extract approver attributes
        const approverAttrs = approverResource?.attributes as {
          username?: string;
          displayName?: string;
        } | undefined;

        return {
          id: parseInt(item.id, 10),
          amount: participantAttrs?.amount || 0,
          score: participantAttrs?.score || 0,
          initialScore: participantAttrs?.initialScore || 0,
          platformUsername: participantAttrs?.platformUsername || '',
          isApproved: participantAttrs?.isApproved || false,
          approvedAt: participantAttrs?.approvedAt,
          createdAt: participantAttrs?.createdAt || '',
          user: userResource ? {
            id: parseInt(userResource.id, 10),
            username: userAttrs?.username || 'Unknown',
            displayName: userAttrs?.displayName || 'Unknown',
            avatarUrl: userAttrs?.avatarUrl,
            money: userAttrs?.money || 0,
          } : {
            id: 0,
            username: 'Deleted User',
            displayName: 'Deleted User',
            money: 0,
          },
          platform: platformResource ? {
            id: parseInt(platformResource.id, 10),
            name: platformAttrs?.name || 'Unknown',
          } : undefined,
          approvedBy: approverResource ? {
            id: parseInt(approverResource.id, 10),
            username: approverAttrs?.username || 'Unknown',
            displayName: approverAttrs?.displayName || 'Unknown',
          } : undefined,
        };
      });

      // Participants loaded successfully
    } catch (error) {
      console.error('Failed to load participants:', error);
      app.alerts.show({ type: 'error' }, app.translator.trans('wusong8899-tournament-widget.admin.participants.load_error'));
    } finally {
      this.loading = false;
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
        url: `${app.forum.attribute('apiUrl')}/tournament/participants/${participant.id}`
      });

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

  private async updateScore(participant: Participant): Promise<void> {
    const newScore = this.editingScores[participant.id];
    
    // Handle empty or invalid input
    if (newScore === '' || newScore === '-') {
      return;
    }
    
    const scoreValue = parseInt(newScore);
    if (isNaN(scoreValue) || scoreValue === participant.score) {
      return; // No change or invalid input
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
            attributes: {
              score: scoreValue,
            },
          },
        },
      });

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

  private getFilteredParticipants(): Participant[] {
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

  private async approveParticipant(participant: Participant): Promise<void> {
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

  private async rejectParticipant(participant: Participant): Promise<void> {
    const confirmMessage = app.translator.trans(
      'wusong8899-tournament-widget.admin.participants.confirm_reject',
      { username: participant.user.displayName || participant.user.username }
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
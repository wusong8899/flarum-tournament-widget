import app from 'flarum/admin/app';
import TournamentManagementPage from './components/TournamentManagementPage';

app.initializers.add('wusong8899-tournament-widget', () => {
  app.extensionData
    .for('wusong8899-tournament-widget')
    .registerPage(TournamentManagementPage)
    .registerPermission({
      icon: 'fas fa-trophy',
      label: app.translator.trans('wusong8899-tournament-widget.admin.permissions.participate'),
      permission: 'tournament.participate',
    }, 'start')
    .registerPermission({
      icon: 'fas fa-cog',
      label: app.translator.trans('wusong8899-tournament-widget.admin.permissions.manage_platforms'),
      permission: 'tournament.managePlatforms',
    }, 'moderate');
});
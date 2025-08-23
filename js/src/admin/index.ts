import app from 'flarum/admin/app';

app.initializers.add('wusong8899-tournament-widget-admin', () => {
  app.extensionData
    .for('wusong8899-flarum-tournament-widget')
    .registerSetting({
      setting: 'wusong8899_tournament.title',
      type: 'text',
      label: app.translator.trans('wusong8899-tournament-widget.admin.settings.title_label'),
      help: app.translator.trans('wusong8899-tournament-widget.admin.settings.title_help'),
    })
    .registerSetting({
      setting: 'wusong8899_tournament.prize_pool',
      type: 'text',
      label: app.translator.trans('wusong8899-tournament-widget.admin.settings.prize_pool_label'),
      help: app.translator.trans('wusong8899-tournament-widget.admin.settings.prize_pool_help'),
    })
    .registerSetting({
      setting: 'wusong8899_tournament.start_date',
      type: 'text',
      label: app.translator.trans('wusong8899-tournament-widget.admin.settings.start_date_label'),
      help: app.translator.trans('wusong8899-tournament-widget.admin.settings.start_date_help'),
    })
    .registerSetting({
      setting: 'wusong8899_tournament.details_url',
      type: 'url',
      label: app.translator.trans('wusong8899-tournament-widget.admin.settings.details_url_label'),
      help: app.translator.trans('wusong8899-tournament-widget.admin.settings.details_url_help'),
    })
    .registerSetting({
      setting: 'wusong8899_tournament.background_image',
      type: 'url',
      label: app.translator.trans('wusong8899-tournament-widget.admin.settings.background_image_label'),
      help: app.translator.trans('wusong8899-tournament-widget.admin.settings.background_image_help'),
    })
    .registerSetting({
      setting: 'wusong8899_tournament.initial_score',
      type: 'number',
      label: app.translator.trans('wusong8899-tournament-widget.admin.settings.initial_score_label'),
      help: app.translator.trans('wusong8899-tournament-widget.admin.settings.initial_score_help'),
    })
    .registerPermission({
      icon: 'fas fa-trophy',
      label: app.translator.trans('wusong8899-tournament-widget.admin.permissions.participate'),
      permission: 'tournament.participate',
    }, 'start');
});
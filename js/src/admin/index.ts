import app from 'flarum/admin/app';

app.initializers.add('wusong8899-tournament-widget-admin', () => {
  app.extensionData
    .for('wusong8899-flarum-tournament-widget')
    .registerSetting({
      setting: 'wusong8899_tournament.start_date',
      type: 'text',
      label: '锦标赛开始时间',
      help: '格式: YYYY-MM-DDTHH:MM:SSZ (UTC时间), 例如: 2025-08-23T00:00:00Z',
    })
    .registerSetting({
      setting: 'wusong8899_tournament.details_url',
      type: 'url',
      label: '锦标赛详情页链接',
      help: '用户点击"详情"按钮时跳转的链接',
    })
    .registerSetting({
      setting: 'wusong8899_tournament.background_image',
      type: 'url',
      label: '锦标赛背景图片',
      help: '锦标赛卡片的背景图片URL',
    });
});
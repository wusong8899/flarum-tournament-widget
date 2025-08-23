import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import m from 'mithril';
import TournamentWidget from './components/TournamentWidget';
import TagsPage from 'flarum/tags/forum/components/TagsPage';

app.initializers.add('wusong8899-tournament-widget', () => {

  if (TagsPage) {
    extend(TagsPage.prototype, 'content', function (vnode) {
      const children = vnode.children;
      if (!Array.isArray(children)) return;

      // Always add tournament widget at the end of the content
      children.push(m(TournamentWidget));
    });
  } else {
    console.warn('TagsPage not found - tournament widget will not be injected');
  }
});
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

      // Find the user-submission-widget-dynamic element
      const targetIndex = children.findIndex(
        (child) => child?.attrs?.className?.includes('user-submission-widget-dynamic')
      );

      if (targetIndex > -1) {
        // Insert the tournament widget after the target element
        children.splice(targetIndex + 1, 0, m(TournamentWidget));
      }
    });
  } else {
    console.warn('TagsPage not found - tournament widget will not be injected');
  }
});
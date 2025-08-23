<?php

namespace AntoineFr\Money\Listeners;

use Illuminate\Support\Arr;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Events\Dispatcher;
use Flarum\User\User;
use Flarum\Post\Post;
use Flarum\Post\Event\Posted;
use Flarum\Post\Event\Restored as PostRestored;
use Flarum\Post\Event\Hidden as PostHidden;
use Flarum\Post\Event\Deleted as PostDeleted;
use Flarum\Discussion\Discussion;
use Flarum\Discussion\Event\Started;
use Flarum\Discussion\Event\Restored as DiscussionRestored;
use Flarum\Discussion\Event\Hidden as DiscussionHidden;
use Flarum\Discussion\Event\Deleted as DiscussionDeleted;
use Flarum\User\Event\Saving;
use Flarum\Likes\Event\PostWasLiked;
use Flarum\Likes\Event\PostWasUnliked;
use AntoineFr\Money\Event\MoneyUpdated;
use AntoineFr\Money\AutoRemoveEnum;

class GiveMoney
{
    protected SettingsRepositoryInterface $settings;
    protected Dispatcher $events;
    protected float $moneyforpost;
    protected int $postminimumlength;
    protected float $moneyfordiscussion;
    protected float $moneyforlike;
    protected int $autoremove;
    protected bool $cascaderemove;

    protected bool $ignoreNotifyingUsersSwitch;

    public function __construct(SettingsRepositoryInterface $settings, Dispatcher $events)
    {
        $this->settings = $settings;
        $this->events = $events;

        $this->moneyforpost = (float) $this->settings->get('antoinefr-money.moneyforpost', 0);
        $this->postminimumlength = (int) $this->settings->get('antoinefr-money.postminimumlength', 0);
        $this->moneyfordiscussion = (float) $this->settings->get('antoinefr-money.moneyfordiscussion', 0);
        $this->moneyforlike = (float) $this->settings->get('antoinefr-money.moneyforlike', 0);
        $this->autoremove = (int) $this->settings->get('antoinefr-money.autoremove', 1);
        $this->cascaderemove = (bool) $this->settings->get('antoinefr-money.cascaderemove', false);
        $this->ignoreNotifyingUsersSwitch = (bool) $this->settings->get('antoinefr-money.ignorenotifyingusers', false);
    }

    public function giveMoney(?User $user, float $money): bool
    {
        if (!is_null($user)) {
            $user->money += $money;
            $user->save();

            $this->events->dispatch(new MoneyUpdated($user));

            return true;
        }

        return false;
    }

    public function postGiveMoney(?User $user, float $money, Post $post)
    {
        if (!is_null($user)) {
            $permissions = true;
            if ($post) {
                $discussionTags = $post->discussion->tags;
                foreach ($discussionTags as $tag) {
                    if ($user->hasPermission("tag{$tag->id}.discussion.money.disable_money") && !$user->isAdmin()) {
                        $permissions = false;
                    }
                }
            }

            if ($permissions) {
                $this->giveMoney($user, $money);
            }
        }
    }

    public function ignoreNotifyingUsers(string $content): string
    {
        if (!$this->ignoreNotifyingUsersSwitch) {
            return $content;
        }

        $pattern = '/@.*(#\d+|#p\d+)/';
        return trim(str_replace(["\r", "\n"], '', preg_replace($pattern, '', $content)));
    }

    public function postWasPosted(Posted $event): void
    {
        $content = $this->ignoreNotifyingUsers($event->post->content);
        if (
            $event->post->number > 1 // If it's not the first post of a discussion
            && mb_strlen($content) >= $this->postminimumlength
        ) {
            $this->postGiveMoney($event->actor, $this->moneyforpost, $event->post);
        }
    }

    public function postWasRestored(PostRestored $event): void
    {
        $content = $this->ignoreNotifyingUsers($event->post->content);
        if (
            $this->autoremove == AutoRemoveEnum::HIDDEN
            && $event->post->type == 'comment'
            && mb_strlen($content) >= $this->postminimumlength
        ) {
            $this->postGiveMoney($event->post->user, $this->moneyforpost, $event->post);
        }
    }

    public function postWasHidden(PostHidden $event): void
    {
        $content = $this->ignoreNotifyingUsers($event->post->content);
        if (
            $this->autoremove == AutoRemoveEnum::HIDDEN
            && $event->post->type == 'comment'
            && mb_strlen($content) >= $this->postminimumlength
        ) {
            $this->postGiveMoney($event->post->user, -1 * $this->moneyforpost, $event->post);
        }
    }

    public function postWasDeleted(PostDeleted $event): void
    {
        $content = $this->ignoreNotifyingUsers($event->post->content);
        if (
            $this->autoremove == AutoRemoveEnum::DELETED
            && $event->post->type == 'comment'
            && mb_strlen($content) >= $this->postminimumlength
        ) {
            $this->postGiveMoney($event->post->user, -1 * $this->moneyforpost, $event->post);
        }
    }

    public function discussionWasStarted(Started $event): void
    {
        $this->giveMoney($event->actor, $this->moneyfordiscussion);
    }

    public function discussionWasRestored(DiscussionRestored $event): void
    {
        if ($this->autoremove == AutoRemoveEnum::HIDDEN) {
            $this->giveMoney($event->discussion->user, $this->moneyfordiscussion);

            $this->discussionCascadePosts($event->discussion, 1);
        }
    }

    public function discussionWasHidden(DiscussionHidden $event): void
    {
        if ($this->autoremove == AutoRemoveEnum::HIDDEN) {
            $this->giveMoney($event->discussion->user, -$this->moneyfordiscussion);

            $this->discussionCascadePosts($event->discussion, -1);
        }
    }

    public function discussionWasDeleted(DiscussionDeleted $event): void
    {
        if ($this->autoremove == AutoRemoveEnum::DELETED) {
            $this->giveMoney($event->discussion->user, -$this->moneyfordiscussion);

            $this->discussionCascadePosts($event->discussion, -1);
        }
    }

    protected function discussionCascadePosts(Discussion $discussion, int $multiply): void
    {
        if ($this->cascaderemove) {
            foreach ($discussion->posts as $post) {
                $content = $this->ignoreNotifyingUsers($post->content);
                if (
                    $post->type == 'comment'
                    && mb_strlen($content) >= $this->postminimumlength
                    && $post->number > 1
                    && is_null($post->hidden_at)
                ) {
                    $this->postGiveMoney($post->user, $multiply * $this->moneyforpost, $post);
                }
            }
        }
    }

    public function userWillBeSaved(Saving $event): void
    {
        $attributes = Arr::get($event->data, 'attributes', []);

        if (array_key_exists('money', $attributes)) {
            $user = $event->user;
            $actor = $event->actor;
            $actor->assertCan('edit_money', $user);
            $user->money = (float) $attributes['money'];

            $this->events->dispatch(new MoneyUpdated($user));
        }
    }

    public function postWasLiked(PostWasLiked $event): void
    {
        $this->giveMoney($event->post->user, $this->moneyforlike);
    }

    public function postWasUnliked(PostWasUnliked $event): void
    {
        $this->giveMoney($event->post->user, -1 * $this->moneyforlike);
    }
}

<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Api\Controller\AbstractShowController;
use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\PlatformSerializer;
use wusong8899\TournamentWidget\Model\Platform;

class ListPlatformsController extends AbstractListController
{
    public $serializer = PlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        // For regular users, only show active platforms
        // For admins, show all platforms
        $query = Platform::query()->ordered();
        
        if (!$actor->can('tournament.managePlatforms')) {
            $query->active();
        }

        return $query->get();
    }
}

class CreatePlatformController extends AbstractCreateController
{
    public $serializer = PlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertCan('tournament.managePlatforms');

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        $platform = new Platform();
        $platform->name = Arr::get($attributes, 'name');
        $platform->icon_url = Arr::get($attributes, 'iconUrl');
        $platform->icon_class = Arr::get($attributes, 'iconClass');
        $platform->is_active = Arr::get($attributes, 'isActive', true);
        $platform->display_order = Arr::get($attributes, 'displayOrder', 0);
        
        $platform->save();

        return $platform;
    }
}

class UpdatePlatformController extends AbstractShowController
{
    public $serializer = PlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertCan('tournament.managePlatforms');

        $id = Arr::get($request->getQueryParams(), 'id');
        $platform = Platform::findOrFail($id);

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        if (isset($attributes['name'])) {
            $platform->name = $attributes['name'];
        }
        if (isset($attributes['iconUrl'])) {
            $platform->icon_url = $attributes['iconUrl'];
        }
        if (isset($attributes['iconClass'])) {
            $platform->icon_class = $attributes['iconClass'];
        }
        if (isset($attributes['isActive'])) {
            $platform->is_active = $attributes['isActive'];
        }
        if (isset($attributes['displayOrder'])) {
            $platform->display_order = $attributes['displayOrder'];
        }

        $platform->save();

        return $platform;
    }
}

class DeletePlatformController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request): void
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertCan('tournament.managePlatforms');

        $id = Arr::get($request->getQueryParams(), 'id');
        $platform = Platform::findOrFail($id);

        // Check if platform has participants
        if ($platform->participants()->count() > 0) {
            // Don't delete, just deactivate
            $platform->is_active = false;
            $platform->save();
        } else {
            // Safe to delete
            $platform->delete();
        }
    }
}
<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\PlatformSerializer;
use wusong8899\TournamentWidget\Model\Platform;

class UpdatePlatformController extends AbstractShowController
{
    public $serializer = PlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        
        if (!$actor->isAdmin()) {
            $actor->assertCan('tournament.managePlatforms');
        }

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
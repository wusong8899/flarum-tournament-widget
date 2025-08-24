<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\PlatformSerializer;
use wusong8899\TournamentWidget\Model\Platform;

class CreatePlatformController extends AbstractCreateController
{
    public $serializer = PlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        if (!$actor->isAdmin()) {
            $actor->assertCan('tournament.managePlatforms');
        }

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
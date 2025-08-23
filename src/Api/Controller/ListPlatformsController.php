<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
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
        
        if (!$actor->isAdmin() && !$actor->can('tournament.managePlatforms')) {
            $query->active();
        }

        return $query->get();
    }
}
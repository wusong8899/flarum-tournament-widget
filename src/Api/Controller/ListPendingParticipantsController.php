<?php

declare(strict_types=1);

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\ParticipantSerializer;
use wusong8899\TournamentWidget\Model\Participant;

class ListPendingParticipantsController extends AbstractListController
{
    public $serializer = ParticipantSerializer::class;

    public $include = ['user', 'platform'];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        // Only admins can view pending participants
        $actor->assertAdmin();

        return Participant::with(['user', 'platform'])
            ->where('is_approved', false)
            ->orderBy('created_at', 'desc') // Show newest applications first
            ->get();
    }
}
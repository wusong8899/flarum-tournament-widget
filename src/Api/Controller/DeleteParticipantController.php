<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use wusong8899\TournamentWidget\Model\Participant;

class DeleteParticipantController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request): void
    {
        $actor = RequestUtil::getActor($request);

        // Only admins can delete participants
        $actor->assertAdmin();

        $id = Arr::get($request->getAttributes(), 'id');
        $participant = Participant::findOrFail($id);

        $participant->delete();
    }
}
<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\ParticipantSerializer;
use wusong8899\TournamentWidget\Command\UpdateScore;

class UpdateScoreController extends AbstractShowController
{
    public $serializer = ParticipantSerializer::class;

    public function __construct(
        private Dispatcher $bus
    ) {
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);

        $participantId = (int) Arr::get($request->getQueryParams(), 'id');
        $newScore = (int) Arr::get($attributes, 'score');

        return $this->bus->dispatch(
            new UpdateScore($actor, $participantId, $newScore)
        );
    }
}
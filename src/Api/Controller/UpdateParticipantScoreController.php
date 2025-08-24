<?php

declare(strict_types=1);

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\ParticipantSerializer;
use wusong8899\TournamentWidget\Model\Participant;

class UpdateParticipantScoreController extends AbstractShowController
{
    public $serializer = ParticipantSerializer::class;

    public $include = ['user', 'platform'];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        // Only admins can update scores
        $actor->assertAdmin();

        $id = Arr::get($request->getAttributes(), 'id');
        $participant = Participant::with(['user', 'platform'])->findOrFail($id);

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);
        $score = Arr::get($attributes, 'score');

        if ($score !== null) {
            $participant->score = (int) $score;
            $participant->save();
        }

        return $participant;
    }
}
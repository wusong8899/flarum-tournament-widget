<?php

declare(strict_types=1);

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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

        $id = Arr::get($request->getQueryParams(), 'id');
        
        // Validate ID parameter
        if (empty($id) || !is_numeric($id)) {
            throw new ValidationException([
                'participant' => 'Invalid participant ID provided.'
            ]);
        }
        
        try {
            $participant = Participant::with(['user', 'platform'])->findOrFail((int) $id);
        } catch (ModelNotFoundException $e) {
            throw new ValidationException([
                'participant' => "Participant with ID {$id} not found."
            ]);
        }

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);
        $score = Arr::get($attributes, 'score');

        // Validate score parameter
        if ($score !== null) {
            if (!is_numeric($score)) {
                throw new ValidationException([
                    'score' => 'Score must be a valid number.'
                ]);
            }
            
            $scoreValue = (int) $score;
            
            // Allow negative scores - removed validation restriction
            
            $participant->score = $scoreValue;
            $participant->save();
        }

        return $participant;
    }
}
<?php

declare(strict_types=1);

namespace wusong8899\TournamentWidget\Api\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractShowController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\ParticipantSerializer;
use wusong8899\TournamentWidget\Model\Participant;

class ApproveParticipantController extends AbstractShowController
{
    public $serializer = ParticipantSerializer::class;

    public $include = ['user', 'platform', 'approvedBy'];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $id = Arr::get($request->getQueryParams(), 'id');

        // Only admins can approve participants
        $actor->assertAdmin();

        // Validate ID
        if (empty($id) || !is_numeric($id)) {
            throw new ValidationException(['id' => 'Invalid participant ID provided.']);
        }

        try {
            $participant = Participant::findOrFail((int) $id);
        } catch (ModelNotFoundException $e) {
            throw new ValidationException(['participant' => "Participant with ID {$id} not found."]);
        }

        // Check if already approved
        if ($participant->is_approved) {
            throw new ValidationException(['participant' => 'This participant is already approved.']);
        }

        // Get action from request body
        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);
        $action = Arr::get($attributes, 'action', 'approve');

        if ($action === 'approve') {
            // Approve the participant
            $participant->is_approved = true;
            $participant->approved_at = Carbon::now();
            $participant->approved_by = $actor->id;
            $participant->save();
        } elseif ($action === 'reject') {
            // Delete the participant record (reject the application)
            $participant->delete();
            
            // Return a minimal response for deleted participant
            $deletedParticipant = new \stdClass();
            $deletedParticipant->id = $id;
            $deletedParticipant->deleted = true;
            return $deletedParticipant;
        } else {
            throw new ValidationException(['action' => 'Invalid action. Must be "approve" or "reject".']);
        }

        // Load relationships
        $participant->load(['user', 'platform', 'approvedBy']);

        return $participant;
    }
}
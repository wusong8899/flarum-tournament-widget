<?php

declare(strict_types=1);

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
        
        // Validate ID parameter
        if (empty($id) || !is_numeric($id)) {
            throw new ValidationException([
                'id' => 'Invalid participant ID provided.'
            ]);
        }
        
        try {
            $participant = Participant::findOrFail((int) $id);
        } catch (ModelNotFoundException $e) {
            throw new ValidationException([
                'participant' => "Participant with ID {$id} not found."
            ]);
        }

        $participant->delete();
    }
}
<?php

namespace wusong8899\TournamentWidget\Command;

use Flarum\Foundation\ValidationException;
use wusong8899\TournamentWidget\Model\Participant;

class ParticipateHandler
{
    public function handle(Participate $command): Participant
    {
        $actor = $command->actor;
        
        $actor->assertRegistered();
        
        // Check if user already participated
        $existingParticipation = Participant::where('user_id', $actor->id)->first();
        if ($existingParticipation) {
            throw new ValidationException([
                'message' => 'You have already participated in this tournament.'
            ]);
        }

        // Validate platform account format (basic validation)
        if (strlen($command->platformAccount) < 3) {
            throw new ValidationException([
                'platformAccount' => 'Platform account must be at least 3 characters long.'
            ]);
        }

        $participant = new Participant();
        $participant->user_id = $actor->id;
        $participant->platform_account = $command->platformAccount;
        $participant->score = 0; // Default score
        $participant->save();

        return $participant;
    }
}
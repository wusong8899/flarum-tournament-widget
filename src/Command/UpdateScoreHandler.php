<?php

namespace wusong8899\TournamentWidget\Command;

use Flarum\Foundation\ValidationException;
use wusong8899\TournamentWidget\Model\Participant;

class UpdateScoreHandler
{

    public function handle(UpdateScore $command): Participant
    {
        $actor = $command->actor;
        
        $actor->assertAdmin();
        
        $participant = Participant::findOrFail($command->participantId);
        
        if ($command->newScore < 0) {
            throw new ValidationException([
                'score' => 'Score cannot be negative.'
            ]);
        }
        
        $participant->score = $command->newScore;
        $participant->save();
        
        return $participant;
    }
}
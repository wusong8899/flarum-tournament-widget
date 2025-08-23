<?php

namespace wusong8899\TournamentWidget\Command;

use Flarum\Foundation\ValidationException;
use Illuminate\Cache\CacheManager;
use wusong8899\TournamentWidget\Model\Participant;

class UpdateScoreHandler
{
    public function __construct(
        private CacheManager $cache
    ) {
    }

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
        
        // Clear cache to force refresh
        $this->cache->forget('tournament_data');
        
        return $participant;
    }
}
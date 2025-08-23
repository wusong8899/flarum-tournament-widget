<?php

namespace wusong8899\TournamentWidget\Command;

use Flarum\User\User;

class UpdateScore
{
    public function __construct(
        public User $actor,
        public int $participantId,
        public int $newScore
    ) {
    }
}
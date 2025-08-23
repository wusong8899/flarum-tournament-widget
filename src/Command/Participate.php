<?php

namespace wusong8899\TournamentWidget\Command;

use Flarum\User\User;

class Participate
{
    public function __construct(
        public User $actor,
        public string $platformAccount
    ) {
    }
}
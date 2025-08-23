<?php

namespace wusong8899\TournamentWidget\Model;

use Flarum\Database\AbstractModel;
use Flarum\User\User;

class Participant extends AbstractModel
{
    protected $table = 'ziven_tournament_participants';
    
    protected $fillable = ['user_id', 'platform_account', 'score'];
    
    protected $dates = ['created_at', 'updated_at'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
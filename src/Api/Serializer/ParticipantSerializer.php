<?php

namespace wusong8899\TournamentWidget\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\UserSerializer;
use wusong8899\TournamentWidget\Model\Participant;

class ParticipantSerializer extends AbstractSerializer
{
    protected $type = 'participants';

    protected function getDefaultAttributes($participant)
    {
        if (!($participant instanceof Participant)) {
            throw new \InvalidArgumentException('Expected Participant model');
        }

        return [
            'id' => $participant->id,
            'platformAccount' => $participant->platform_account,
            'score' => $participant->score,
            'createdAt' => $this->formatDate($participant->created_at),
            'updatedAt' => $this->formatDate($participant->updated_at),
        ];
    }

    protected function user(Participant $participant): ?\Tobscure\JsonApi\Relationship
    {
        return $this->hasOne($participant, UserSerializer::class);
    }
}
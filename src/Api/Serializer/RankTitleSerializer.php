<?php

namespace wusong8899\TournamentWidget\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;

class RankTitleSerializer extends AbstractSerializer
{
    protected $type = 'rank-titles';

    protected function getDefaultAttributes($data): array
    {
        return [
            'id' => $data['id'],
            'rankTitles' => $data['rankTitles'] ?? []
        ];
    }
}
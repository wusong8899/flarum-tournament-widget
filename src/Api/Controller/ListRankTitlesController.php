<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\RankTitleSerializer;

class ListRankTitlesController extends AbstractShowController
{
    public $serializer = RankTitleSerializer::class;

    protected SettingsRepositoryInterface $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $rankTitles = json_decode($this->settings->get('wusong8899_tournament.rank_titles', '{}'), true);
        
        // Merge with defaults if empty
        if (empty($rankTitles)) {
            $rankTitles = [
                1 => '冠军',
                2 => '亚军',
                3 => '季军',
                '4-10' => '优秀选手',
                'default' => '参赛选手'
            ];
        }

        return [
            'id' => 'rank-titles',
            'rankTitles' => $rankTitles
        ];
    }
}
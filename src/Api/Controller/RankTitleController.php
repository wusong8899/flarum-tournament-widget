<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Tobscure\JsonApi\Resource;

class ListRankTitlesController extends AbstractShowController
{
    public $serializer = RankTitleSerializer::class;

    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertCan('tournament.managePlatforms');

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

class UpdateRankTitlesController extends AbstractShowController
{
    public $serializer = RankTitleSerializer::class;

    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertCan('tournament.managePlatforms');

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);
        $rankTitles = Arr::get($attributes, 'rankTitles', []);

        // Validate and sanitize rank titles
        $validatedTitles = [];
        foreach ($rankTitles as $rank => $title) {
            if (empty(trim($title))) {
                continue;
            }
            
            // Validate rank format (number, range like "4-10", or "default")
            if (is_numeric($rank) || $rank === 'default' || preg_match('/^\d+-\d+$/', $rank)) {
                $validatedTitles[$rank] = trim($title);
            }
        }

        $this->settings->set('wusong8899_tournament.rank_titles', json_encode($validatedTitles));

        return [
            'id' => 'rank-titles',
            'rankTitles' => $validatedTitles
        ];
    }
}

class RankTitleSerializer
{
    public function serialize($data): Resource
    {
        return new Resource('rank-titles', $data['id'], $data);
    }
}
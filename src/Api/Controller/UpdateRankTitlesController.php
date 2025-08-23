<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\RankTitleSerializer;

class UpdateRankTitlesController extends AbstractShowController
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
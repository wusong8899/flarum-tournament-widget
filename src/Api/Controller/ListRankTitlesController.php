<?php

declare(strict_types=1);

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class ListRankTitlesController implements RequestHandlerInterface
{
    protected SettingsRepositoryInterface $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
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

        return new JsonResponse([
            'data' => [
                'type' => 'rank-titles',
                'id' => 'rank-titles',
                'attributes' => [
                    'rankTitles' => $rankTitles
                ]
            ]
        ]);
    }
}
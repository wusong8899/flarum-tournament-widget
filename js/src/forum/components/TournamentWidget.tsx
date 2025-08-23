import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import m from 'mithril';
import TournamentCard from './TournamentCard';
import Leaderboard from './Leaderboard';
import { Vnode } from 'mithril';

interface IParticipant {
  id: string;
  platformAccount: string;
  money: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
}

interface ITournamentData {
  title: string;
  prizePool: string;
  startDate: string;
  detailsUrl: string;
  backgroundImage: string;
  userParticipated: boolean;
  totalParticipants: number;
  participants: IParticipant[];
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  return {
    days: String(d).padStart(2, '0'),
    hours: String(h % 24).padStart(2, '0'),
    mins: String(m % 60).padStart(2, '0'),
    secs: String(s % 60).padStart(2, '0'),
  };
}

export default class TournamentWidget extends Component {
  loading: boolean = true;
  tournamentData: ITournamentData | null = null;
  timerInterval: number | null = null;
  animationFrame: number | null = null;
  timeElapsed = { days: '00', hours: '00', mins: '00', secs: '00' };
  lastUpdateTime: number = 0;

  oninit(vnode: Vnode) {
    super.oninit(vnode);
    this.loadData();
  }

  oncreate(vnode: Vnode) {
    super.oncreate(vnode);
    this.startTimer();
  }

  onremove(vnode: Vnode) {
    super.onremove(vnode);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  view() {
    if (this.loading) {
      return (
        <div className="TournamentWidget">
          <div className="TournamentWidget-loading">
            <LoadingIndicator />
          </div>
        </div>
      );
    }

    if (!this.tournamentData) {
      return null;
    }

    return (
      <div className="TournamentWidget">
        <div className="TournamentHeader">
          <img 
            className="TournamentHeader-image" 
            src="https://i.mji.rip/2025/08/23/678aa40f68db12909bb4a4871d603876.webp" 
            alt="Tournament"
          />
          <span className="TournamentHeader-title">老哥榜</span>
        </div>
        <TournamentCard
          title={this.tournamentData.title}
          prizePool={this.tournamentData.prizePool}
          detailsUrl={this.tournamentData.detailsUrl}
          backgroundImage={this.tournamentData.backgroundImage}
          timeElapsed={this.timeElapsed}
          userParticipated={this.tournamentData.userParticipated}
          onParticipate={() => this.loadData()}
        />
        <Leaderboard 
          participants={this.tournamentData.participants}
        />
      </div>
    );
  }

  startTimer() {
    if (!this.tournamentData?.startDate) return;
    
    const startDate = new Date(this.tournamentData.startDate);
    this.lastUpdateTime = Date.now();
    
    const updateTimer = () => {
      const now = Date.now();
      // Only update every second, not on every frame
      if (now - this.lastUpdateTime >= 1000) {
        const diff = now - startDate.getTime();
        if (diff > 0) {
          this.timeElapsed = formatDuration(diff);
          this.lastUpdateTime = now;
          m.redraw();
        }
      }
      this.animationFrame = requestAnimationFrame(updateTimer);
    };
    
    this.animationFrame = requestAnimationFrame(updateTimer);
  }

  loadData() {
    this.loading = true;
    
    return app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/tournament',
    }).then((response: any) => {
      this.tournamentData = {
        title: response.data.attributes.title,
        prizePool: response.data.attributes.prizePool,
        startDate: response.data.attributes.startDate,
        detailsUrl: response.data.attributes.detailsUrl,
        backgroundImage: response.data.attributes.backgroundImage,
        userParticipated: response.data.attributes.userParticipated,
        totalParticipants: response.data.attributes.totalParticipants,
        participants: response.data.attributes.participants || []
      };
      this.loading = false;
      
      // Start timer after data is loaded
      if (!this.timerInterval) {
        this.startTimer();
      }
      
      m.redraw();
    }).catch((error: any) => {
      this.loading = false;
      console.error('Failed to load tournament data:', error);
      m.redraw();
    });
  }
}
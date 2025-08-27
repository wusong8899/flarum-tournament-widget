import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import m from 'mithril';
import TournamentCard from './TournamentCard';
import Leaderboard from './Leaderboard';
import { Vnode } from 'mithril';

interface IParticipant {
  id: string;
  rank: number;
  title: string;
  amount: number;
  score: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  platform: {
    id: number | null;
    name: string;
    username: string;
    iconUrl: string | null;
    iconClass: string | null;
    usesUrlIcon: boolean;
    usesCssIcon: boolean;
  };
  platformAccount: string; // Legacy field for backward compatibility
}

interface ITournamentData {
  title: string;
  prizePool: string;
  startDate: string;
  detailsUrl: string;
  backgroundImage: string;
  headerTitle: string;
  headerImage: string;
  userParticipated: boolean;
  userApplicationStatus: {
    isApproved: boolean;
    submittedAt?: string;
    approvedAt?: string;
  } | null;
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
  isRedrawing: boolean = false;

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
    
    // Clear timer and animation frame
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Clear tournament data to prevent timer from continuing
    this.tournamentData = null;
    this.isRedrawing = false;
  }

  view() {
    try {
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
              src={this.tournamentData.headerImage || "https://i.mji.rip/2025/08/23/678aa40f68db12909bb4a4871d603876.webp"}
              alt="Tournament"
            />
            <span className="TournamentHeader-title">{this.tournamentData.headerTitle || "老哥榜"}</span>
          </div>
          <TournamentCard
            title={this.tournamentData.title}
            prizePool={this.tournamentData.prizePool}
            detailsUrl={this.tournamentData.detailsUrl}
            backgroundImage={this.tournamentData.backgroundImage}
            timeElapsed={this.timeElapsed}
            userParticipated={this.tournamentData.userParticipated}
            userApplicationStatus={this.tournamentData.userApplicationStatus}
            onParticipate={() => this.loadData()}
          />
          <Leaderboard 
            participants={this.tournamentData.participants}
          />
        </div>
      );
    } catch (error) {
      console.error('TournamentWidget view error:', error);
      return (
        <div className="TournamentWidget TournamentWidget--error">
          <div className="TournamentWidget-error">
            <p>Tournament widget encountered an error. Please refresh the page.</p>
          </div>
        </div>
      );
    }
  }

  startTimer() {
    if (!this.tournamentData?.startDate) return;
    
    const startDate = new Date(this.tournamentData.startDate);
    this.lastUpdateTime = Date.now();
    
    const updateTimer = () => {
      // Check if component is still valid and not already redrawing
      if (this.isRedrawing || !this.tournamentData) {
        return;
      }
      
      const now = Date.now();
      // Only update every second, not on every frame
      if (now - this.lastUpdateTime >= 1000) {
        const diff = now - startDate.getTime();
        if (diff > 0) {
          this.timeElapsed = formatDuration(diff);
          this.lastUpdateTime = now;
          
          // Prevent recursive redraws
          this.isRedrawing = true;
          try {
            m.redraw();
          } catch (error) {
            console.error('Tournament timer redraw error:', error);
          } finally {
            // Reset flag after a small delay to allow redraw to complete
            setTimeout(() => {
              this.isRedrawing = false;
            }, 10);
          }
        }
      }
      
      // Only continue animation if component is still mounted
      if (this.tournamentData && !this.isRedrawing) {
        this.animationFrame = requestAnimationFrame(updateTimer);
      }
    };
    
    this.animationFrame = requestAnimationFrame(updateTimer);
  }

  loadData() {
    // Prevent multiple simultaneous loads
    if (this.loading) {
      return Promise.resolve();
    }
    
    this.loading = true;
    
    return app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/tournament',
    }).then((response: any) => {
      // Validate response structure
      if (!response || !response.data || !response.data.attributes) {
        throw new Error('Invalid tournament data response');
      }
      
      this.tournamentData = {
        title: response.data.attributes.title || 'Tournament',
        prizePool: response.data.attributes.prizePool || '0',
        startDate: response.data.attributes.startDate || new Date().toISOString(),
        detailsUrl: response.data.attributes.detailsUrl || '',
        backgroundImage: response.data.attributes.backgroundImage || '',
        headerTitle: response.data.attributes.headerTitle || '',
        headerImage: response.data.attributes.headerImage || '',
        userParticipated: response.data.attributes.userParticipated || false,
        userApplicationStatus: response.data.attributes.userApplicationStatus || null,
        totalParticipants: response.data.attributes.totalParticipants || 0,
        participants: response.data.attributes.participants || []
      };
      this.loading = false;
      
      // Start timer after data is loaded
      if (!this.timerInterval && this.tournamentData.startDate) {
        this.startTimer();
      }
      
      try {
        m.redraw();
      } catch (redrawError) {
        console.error('Failed to redraw after loading data:', redrawError);
      }
    }).catch((error: any) => {
      this.loading = false;
      console.error('Failed to load tournament data:', error);
      
      // Set fallback tournament data to prevent complete failure
      this.tournamentData = {
        title: 'Tournament',
        prizePool: '0',
        startDate: new Date().toISOString(),
        detailsUrl: '',
        backgroundImage: '',
        headerTitle: 'Tournament',
        headerImage: '',
        userParticipated: false,
        userApplicationStatus: null,
        totalParticipants: 0,
        participants: []
      };
      
      try {
        m.redraw();
      } catch (redrawError) {
        console.error('Failed to redraw after error:', redrawError);
      }
    });
  }
}
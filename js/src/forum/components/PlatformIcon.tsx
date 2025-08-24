import icon from 'flarum/common/helpers/icon';
import type { TournamentPlatform } from '../types';

interface PlatformIconProps {
  platform: TournamentPlatform | null;
  size?: 'small' | 'medium' | 'large';
}

export default class PlatformIcon {
  view({ attrs }: { attrs: PlatformIconProps }) {
    const { platform, size = 'medium' } = attrs;
    
    if (!platform) {
      return icon('fas fa-gamepad', { className: `PlatformIcon PlatformIcon--${size}` });
    }

    const className = `PlatformIcon PlatformIcon--${size}`;

    // Use image URL if available
    if (platform.iconUrl) {
      return (
        <img 
          src={platform.iconUrl}
          alt={platform.name}
          className={className}
        />
      );
    }

    // Use FontAwesome class if available
    if (platform.iconClass) {
      return icon(platform.iconClass, { className });
    }

    // Fallback to generic gamepad icon
    return icon('fas fa-gamepad', { className });
  }
}
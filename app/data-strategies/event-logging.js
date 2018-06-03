import { EventLoggingStrategy, LogLevel } from '@orbit/coordinator';
import config from 'kitsu/config/environment';

export default {
  create() {
    return new EventLoggingStrategy({
      logLevel: config.environment === 'development' ? LogLevel.None : LogLevel.None
    });
  }
}

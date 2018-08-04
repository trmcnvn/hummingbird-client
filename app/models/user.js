import Model from 'kitsu/mixins/models/base';
import { attr, hasOne, hasMany } from 'kitsu/decorators/orbit';
import { computed } from '@ember-decorators/object';
import { or } from '@ember-decorators/object/computed';

export default class User extends Model {
  @attr('string') about;
  @attr('string') aoPro;
  @attr('object') avatar;
  @attr('date') birthday;
  @attr('number') commentsCount;
  @attr('boolean') confirmed;
  @attr('object') coverImage;
  @attr('string') country;
  @attr('string') email;
  @attr('string') facebookId;
  @attr('number') favoritesCount;
  @attr('boolean') feedCompleted;
  @attr('number') followersCount;
  @attr('number') followingCount;
  @attr('string') gender;
  @attr('boolean') hasPassword;
  @attr('string') language;
  @attr('number') likesGivenCount;
  @attr('string') location;
  @attr('number') mediaReactionsCount;
  @attr('string') name;
  @attr('string') password;
  @attr('array') pastNames;
  @attr('number') postsCount;
  @attr('date') proExpiresAt;
  @attr('boolean') profileCompleted;
  @attr('number') ratingsCount;
  @attr('string') ratingSystem;
  @attr('number') reviewsCount;
  @attr('array') roles;
  @attr('boolean') sfwFilter;
  @attr('string') slug;
  @attr('boolean') shareToGlobal;
  @attr('string') status;
  @attr('boolean') subscribedToNewsletter;
  @attr('string') timeZone;
  @attr('string') title;
  @attr('string') titleLanguagePreference;
  @attr('string') theme;
  @attr('string') waifuOrHusbando;

  @hasOne('post', { inverse: null }) pinnedPost;

  @hasMany('block', { inverse: 'user' }) blocks;
  @hasMany('categoryFavorite', { inverse: 'user' }) categoryFavorites;
  @hasMany('libraryEntry', { inverse: 'user' }) libraryEntries;
  @hasMany('upload', { inverse: 'user' }) uploads;

  @or('slug', 'remoteId') linkableId;

  @computed('title')
  get isStaff() {
    const title = this.title && this.title.toLowerCase();
    return title === 'staff' || title === 'mod';
  }

  @computed('aoPro', 'proExpiresAt')
  get isPro() {
    const isKitsuPro = (() => {
      if (!this.proExpiresAt) { return false; }
      return new Date() < this.proExpiresAt;
    })();
    const isAozoraPro = this.aoPro !== null;
    return isKitsuPro || isAozoraPro;
  }
}

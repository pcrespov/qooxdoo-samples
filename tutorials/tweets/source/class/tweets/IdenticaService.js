/**
 * Fetches tweets and binds to property tweets
 */
qx.Class.define('tweets.IdenticaService', {
  extend: qx.core.Object,

  properties: {
      tweets: {nullable: true, event: 'changeTweets'}
    },

  members: {
    fetchTweets: function() {
      if (this.__store == null) {
        // BUG: version for 5.0.2 does not exists
        var url =
            'http://demo.qooxdoo.org/5.0.1/tweets_step4.5/resource/tweets/service.js';
        this.__store = new qx.data.store.Jsonp();
        this.__store.setCallbackName('callback');
        this.__store.setUrl(url);
        // more to do
      } else {
        this.__store.reload();
      }

      // single value binding: model with this.tweets property
      this.__store.bind('model', this, 'tweets');
    },
  }
});
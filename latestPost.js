//setup markdown-it
var md = window.markdownit();

var query = {
  limit: 10,
  tag: 'ajayyy',
  category: 'utopian-io'
}

//list of posts to remove from view
var blacklist = ['exclude-self-votes-from-human-input-for-bot', 'youtube-watch-history-statistics-viewer-logo', '3d-models-for-voster-coaster-food-stalls', 'adding-commands-to-a-discord-bot'];

steem.api.getDiscussionsByBlog(query, function(err, result) {
  if(!err){

    //this will be set by the for loop
    var post = null;

    //find the post with the specified tags
    for(var i = 0; i < result.length; i++) {
      if(result[i].category === 'utopian-io' && JSON.parse(result[i].json_metadata).tags.indexOf('development')  > -1 && blacklist.indexOf(result[i].permlink) < 0 && result[i].author === "ajayyy"){
        post = result[i];
        break;
      }
    }

    if(post === null) {
      document.getElementById('recentPostTitle').innerHTML = "Error Fetching Post";
    } else {
      document.getElementById('recentPostTitle').innerHTML = post.title;
      //convert the markdown to HTML
      document.getElementById('recentPostBody').innerHTML = md.render(post.body);
      //Highlight code
      hljs.initHighlighting();
    }
  }
});

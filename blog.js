
//is this page currently on the home page
var home = false;

//list of posts to remove from view
var blacklist = ['exclude-self-votes-from-human-input-for-bot', 'youtube-watch-history-statistics-viewer-logo', '3d-models-for-voster-coaster-food-stalls', 'adding-commands-to-a-discord-bot'];

function loadData(hash) {
  //setup markdown-it
  var md = window.markdownit();

  var username = 'ajayyy';

  if(hash !== "" && hash !== "/home") {
    //get the post based on the hash provided
    steem.api.getContent(username, hash, function(err, result) {
      if(!err) {
        document.getElementById('recentPostTitle').innerHTML = result.title;

        //convert the markdown to HTML
        var body = md.render(result.body);
        //delete the "posted on utopian.io" footer
        body = body.split('<p>&lt;br /&gt;&lt;hr/&gt;&lt;em&gt;')[0];

        document.getElementById('recentPostBody').innerHTML = body;

        //highlight code blocks
        var blocks = document.querySelectorAll('pre code:not(.hljs)');
        Array.prototype.forEach.call(blocks, hljs.highlightBlock);

        //set that the page is not on the home page
        home = false;
      }
    })
  } else {
    //check if the home button has been hit while already on the home page
    if (hash === "/home" && home){
      window.location.href = "./index.html";
    } else if (hash === "/home") {
      window.location.href = "#";
    }

    if (document.getElementById('recentPostTitle') !== null){
      document.getElementById('recentPostTitle').innerHTML = "";
      document.getElementById('recentPostBody').innerHTML = "<center> <p> Loading... </p> </center>";
    }
    var query = {
      limit: 40,
      tag: username,
      category: 'utopian-io'
    }
    steem.api.getDiscussionsByBlog(query, function(err, result) {
      if(!err) {
        for(var i = 0; i < result.length; i++) {
          if(result[i].category === 'utopian-io' && result[i].author === "ajayyy"){
            //if it does not exist in the blacklist
            if (blacklist.indexOf(result[i].permlink) < 0) {
              document.getElementById('recentPostTitle').innerHTML += "<a href='#" + result[i].permlink + "'> " + result[i].title + "</a><br/><br/>";
            }
          }
        }

        //clear body of "Loading..."
        document.getElementById('recentPostBody').innerHTML = "";

        //set that the page is on the home page
        home = true;
      }
    });
  }
}

loadData(window.location.hash.substr(1));

//respond to back button
window.addEventListener("hashchange", function(e) {
  loadData(window.location.hash.substr(1));
})

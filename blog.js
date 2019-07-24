
//is this page currently on the home page
var home = false;

//is the home loading
var loadingHome = false;

//list of posts to remove from view
var blacklist = ['exclude-self-votes-from-human-input-for-bot', 'youtube-watch-history-statistics-viewer-logo', '3d-models-for-voster-coaster-food-stalls', 'adding-commands-to-a-discord-bot', 'sync-your-utopian-posts-on-to-your-website', '3d-model-task-request-for-voster-coaster-or-roller-coaster-cart-1535478624679', 'task-request-logo-for-youtube-sponsorblocker'];

function loadData(hash) {
  //setup markdown-it
  var md = window.markdownit({
	  linkify: true,
	  breaks: false
  });
  
  var username = 'ajayyy';

  if(hash !== "" && hash !== "/home" && !hash.startsWith("/tag")) {
    //get the post based on the hash provided
    steem.api.getContent(username, hash, function(err, result) {
      if(!err) {
        document.getElementById('recentPostTitle').innerHTML = result.title;
		document.getElementById('recentPostDate').innerHTML = "Posted " + result.created.split("T")[0];
		
		//scroll to top
		window.scrollTo(0, 0);

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
    //check if home is loading
    if (loadingHome) {
      return;
    }
	  
    //set that home is loading
    loadingHome = true;
	  
    //check if the home button has been hit while already on the home page
    if (hash === "/home" && home){
      window.location.href = "./index.html";
    } else if (hash === "/home") {
      window.location.href = "#";
    }
	
    let tag = null;
    if (hash.startsWith("/tag")) {
	tag = hash.split("=")[1]
    }

    if (document.getElementById('recentPostTitle') !== null) {
      document.getElementById('recentPostTitle').innerHTML = "";
      document.getElementById('recentPostBody').innerHTML = "<center> <p> Loading... </p> </center>";
      document.getElementById('recentPostDate').innerHTML = "";
    }
    var query = {
      limit: 100,
      tag: username
    }
    steem.api.getDiscussionsByBlog(query, function(err, result) {
      if(!err) {
        for(var i = 0; i < result.length; i++) {
	  let containsCorrectTag = true;
	  if (tag != null) {
	      containsCorrectTag = JSON.parse(result[i].json_metadata).tags.includes(tag);
	  }
		
          if(result[i].category === 'utopian-io' && result[i].author === "ajayyy" && containsCorrectTag){
            //if it does not exist in the blacklist
            if (blacklist.indexOf(result[i].permlink) < 0) {
              document.getElementById('recentPostTitle').innerHTML += "<a href='#" + result[i].permlink + "'> " + result[i].title + "</a><br/>";
              document.getElementById('recentPostTitle').innerHTML += "<div id='recentPostDate'>Posted " + result[i].created.split("T")[0] + "</siv>";  
              
	      if (JSON.parse(result[i].json_metadata).image != undefined && JSON.parse(result[i].json_metadata).image.length > 0) {
                document.getElementById('recentPostTitle').innerHTML += "<img class='previewImage' src='" + JSON.parse(result[i].json_metadata).image[0] + "'/><br/><br/>";
              }
		    
            }
          }
        }

        //clear body of "Loading..."
        document.getElementById('recentPostBody').innerHTML = "";

        //set that the page is on the home page
	//only on the home page if the tag is null, otherwise it's a filtered page
        home = tag == null;
	//not loading home anymore
	loadingHome = false;
      }
    });
  }
}

loadData(window.location.hash.substr(1));

//respond to back button
window.addEventListener("hashchange", function(e) {
  loadData(window.location.hash.substr(1));
})

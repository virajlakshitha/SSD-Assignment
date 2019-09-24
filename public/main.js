/* * * * *     Headers for cross origin issues   * * * * */
let headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
};

function insertPost(){
    let data = {
        msg: document.getElementById("post").value

    }

    // var req = https.request({
    //     host: 'graph.facebook.com',
    //     path: '/me/feed',
    //     method: 'POST'
    //   }, function(res) {
    //     res.setEncoding('utf8');
    //     res.on('data', function(chunk) {
    //       console.log('got chunk '+chunk);
    //     });
    //     res.on('end', function() {
    //       console.log('response end with status '+res.status);
    //     });
    //   });
    //   req.end('message='+encodeURIComponent("hello")
    //     +'&access_token='+encodeURIComponent("EAAD4jwrjRp8BAGjbIApMwEZBrwaIcOEs0ss4v9y3f5vmMoxMHOshXSagpp37tAm0CfWIQqCZB6SQZAiCSWRc33uJf3kaCi6zCvcXtniEAxFUyigBsTLcKVvjr6bmkiqZAxA9Witt5HJX1Nw6XcNPmUUFZAviXuZA1YRZBmDlHNBdQZDZD"));
    //   console.log('sent');
    FB.api('/me/feed', 'post', {mesaage: 'testing 1'}, function(response) {
      alert("success");
    })

}
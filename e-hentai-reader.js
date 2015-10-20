if (Meteor.isClient) {
    // counter starts at 0
}

if (Meteor.isServer) {
    Stories = new Meteor.Collection('stories');
    Chapters = new Meteor.Collection('chapters');
    Meteor.startup(function () {
        // code to run on server at startup
    });

    Meteor.methods({
        getStory : function(storyId){
            var story = Stories.findOne({storyId : storyId});
            var storyDetail = Chapters.findOne({storyId : storyId});
            if(story && storyDetail){
                var images = _.map(storyDetail.chapters,function(c){ return c.img});
                var rs = Async.runSync(function(done){
                    async.concat(images, function(image, cbData){
                        var data = imageToBase64(image);
                        cbData(null,{
                            id : image,
                            data : data
                        })
                    },function(err, result){
                        if(err){
                            done(err, null);
                        }
                        if(result){
                            done(null, result);
                        }
                    })
                });

                if(rs.error){
                    console.log(rs.error);
                }

                if(rs.result){
                    return {
                        id : story.storyId,
                        title : story.title,
                        chapters : rs.result
                    }
                }
            }
            return 'FAILED';
        }
    })

    function imageToBase64(imageUrl){
        var result = request.getSync(imageUrl, {encoding: null});
        return 'data:image/png;base64,' + new Buffer(result.body).toString('base64');
    }
}

function formatDate(date) {
    var formattedDate = new Date(date);
    var [month, day, year] = [
        formattedDate.getMonth() + 1,
        formattedDate.getDate(),
        formattedDate.getFullYear()
    ]
    if(month < 10){month = "0" + month;}
    if(day < 10){day = "0" + day;}
    var formattedDate = `${month}-${day}-${year}`;
    return formattedDate;
}

function formatPosts(posts) {
    const formattedPosts = posts.map((post) => {
        const postObj = post.toObject();
        postObj.postDate = utils.formatDate(postObj.postDate.toString());
        return postObj
    });
    return formattedPosts;
}

export const utils = {
    formatDate,
    formatPosts,
}
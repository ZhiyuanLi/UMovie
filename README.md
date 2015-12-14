# [UMovie - A TMDB-based project](http://ec2-52-90-205-71.compute-1.amazonaws.com:3000/)
> [Final Project in CIS550]

> Framework: NodeJS

**Introduction** 
> UMovie provides comprehensive information about the movie including movie poster, abstraction, crew information and studio. The “homepage” presents the latest 12 up-to-date movies. Users can also explore our highest rated movies at the “TopRanked” page which loads the 12 films. Moreover, movies are categorized by their genre on “MovieTags” page. With user preference of movie genre, UMovie also provides the list of movies with corresponding selected tag. The search bar allows for movie search on the site based on our film database, meanwhile Bing search is implemented to give more search options for web visitors. This is part of the project constructs the basic structure of the website relying on movie information which we imported to our database.

> In order to provide social network of user, UMovie offers the opportunity for web visitors to share their opinion on movies by leaving a comment and like the movie on the movie page. They are also welcome to interact with other users who leave a comment at a movie page by rating their review or add them as friend (through “Connect” and “Delete Friend” button). To be more user friendly, “unfriend” option is also provided. Each individual user is encouraged to register an account to be a legit user to leave reviews and like a movie. Logging in locally with an authentic email address and logging in with a Facebook account makes the signup process more user convenient. By logging in, a profile page is automatically created for the user which contains account information, movies user liked, disliked, commented on, and friend relations. Visiting other user profile pages are also supported by UMovie and private account information is neglected on visitor’s profile page. UMovie also offers recommendation of movies based on user’s previous interaction with the website (movie genre they liked), and 9 suggestion movies are automatically prompted on their profile once they login.


**Building Instructions**
- [x] unzip UMovie.zip
- [x] cd UMovie
- [x] npm install → install required modules
- [x] npm start → launch the app listening on port 3000
- [x] Modules:
  - Controller: /routes
  - Model: RDS MySQL database & Mongolab database
  - View: /views (embedded javascript and css)

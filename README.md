# angular-directory
Christophe Coenraets's https://github.com/ccoenraets/angular-directory port to AngularJS v1 and Firebase v3

This is meant as an exercise towards better understanding of the awesome Google/Firebase ecosystem.
Although work in progress, an [online demo](https://ccoenraets-angular-directory.firebaseapp.com/) already simulates the original behaviour.

## Installation

### Firebase

1. First thing first is getting a free account to [Firebase](https://firebase.google.com/),
2. ... and create a new application! At this stage, the relevant [documentation](https://firebase.google.com/docs/) is **For Web**.
3. Install [Firebase tools](https://firebase.google.com/docs/cli/),
4. ... and execute `firebase login`.

### Deployment

Assume the local repo is `angular-directory` and the firebase project is named ` ccoenraets-angular-directory`.
This demo assumes the database will be located within `/factory`.
This is hardecoded as well in [`firebase-directory.js`](blob/master/client/js/firebase-directory.js) and [`database-rules.json`](blob/master/database-rules.json).

1. Copy or clone this repository
2. Change to this new directory and execute `firebase init` (**warning**: take care of not overwriting `client/index.html`). 
3. In file [`index.html`](blob/master/client/index.html), replace (for web) snippet by yours.
4. In file [`.firebaserc`](blob/master/.firebaserc), replace the name of the project by yours.
5. Deploy with `firebase deploy`,
6. ... and initialize the database with the command `firebase database:set /factory ccoenraets-angular-directory.json`.

At this stage, the application should be online and running at the URL provided as `authDomain` within the injected snippet (at step 3). Enjoy!

### Development

To ease understanding of the code, this version does not respect *good practices* as far as AngularJS development would suggest.
Anyway, for a beginner, it is much easier to have everything within a single file.

# RunBPM Modeler


RunBPM Modeler is a node-style web application that builds a user interface around the BPMN 2.0 modeler with RunBPM extension.

![demo application screenshot](https://github.com/liguo-zhang/runbpm-modeler/blob/master/docs/screenshot.png)



## Building 

You need a [NodeJS](http://nodejs.org) development stack with [npm](https://npmjs.org) and [grunt](http://gruntjs.com) installed to build the project.

To install all project dependencies execute

```
npm install
```

Build the example using [browserify](http://browserify.org) via

```
grunt
```

You may also spawn a development setup by executing

```
grunt auto-build
```

Both tasks generate the distribution ready client-side modeler application into the `dist` folder.

Serve the application locally or via a web server (nginx, apache, embedded).

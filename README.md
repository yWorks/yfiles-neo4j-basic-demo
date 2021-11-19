# yfiles-neo4j-basic-demo
Shows how to use yFiles for HTML and Neo4j in a web based single page app to visualize database contents.

This repository serves as a reference for a demo that can be used as a guideline for creating single page web application that render a visualization of [Neo4j](https://www.neo4j.com) database contents using the [yFiles for HTML JavaScript graph drawing library](https://www.yworks.com/yfileshtml). __You cannot run or test the demo without a yFiles for HTML library or without a Neo4j database just by cloning this repository. This repository was originally meant as a reference for the sources in [this outdated posting](https://medium.com/neo4j/neo4j-graph-visualization-like-a-pro-18651963ebd4) and [the corresponding (also slightly outdated) YouTube screencast](https://youtu.be/ABixtyDjcKc), only.__ If you are evaluating yFiles for HTML today, be sure to stick to the sources in this repository which uses the now (at the time of writing) current version of yFiles, which is 2.4.

For a much easier way to get started with yFiles for HTML and Neo4j, be sure to check out the [App-Generator](https://www.yworks.com/products/app-generator) which has several Neo4j related examples that you can adjust to your needs with low-code techniques. It also allows you to scaffold yFiles/Neo4j powered applications with your choice of UI framework and programming language, supporting VueJS, Angular, React, Plain Old HTML, with both JavaScript and TypeScript and a set of additional options like tooltips, search fields, overview, image and PDF export, etc.

The current demo was scaffolded using the [yeoman generator for yFiles apps](https://www.npmjs.com/package/generator-yfiles-app) for yFiles for HTML 2.3 using the following settings: 

```
? Which framework do you want to use? No framework
? Application name Yfiles_neo4j_basic_demo_2
? Path of yFiles for HTML package C:\Path\to\your\yFilesForHTMLPackage
? Path of license file (e.g. 'path/to/license.json') C:\Path\to\your\yFilesForHTMLPackage\lib\license.json
? Which kind of yFiles modules do you want to use? Local NPM dependency (recommended)
? Which language variant do you want to use? ES6
? What else do you want? Use development library
? Which package manager would you like to use? npm
```
See [this updated YouTube screencast](https://youtu.be/fgY4ezIfVjI) on how to get started with yFiles and scaffold a yFiles for HTML powered application with yeoman.

In order to run this demo, you should first obtain a current version of yFiles for HTML from [here](https://www.yworks.com/products/yfiles-for-html/evaluate). 
Then run the yeoman generator and replace the contents of the scaffolded `app.js` file with the ones from this repository and install neo4j using npm. 
For a *generic* introduction to yFiles for HTML see [this YouTube screencast](https://youtu.be/QITNGXNGM3w)

If you are new to yFiles for HTML, you might also consider the approach shown in [this webinar recording](https://youtu.be/_Gz773u-TBQ) to get your first app up and running, quickly.

import 'yfiles/yfiles.css'

import {
  License,
  GraphComponent,
  Class,
  LayoutExecutor,
  GraphViewerInputMode,
  RadialLayout,
  RadialLayoutData,
  Size,
  Rect,
  GraphBuilder,
  ShapeNodeStyle,
  EdgePathLabelModel,
  PolylineEdgeStyle,
  INode,
  DefaultLabelStyle,
  GraphItemTypes,
  Reachability,
  IEnumerable,
} from 'yfiles'

// Tell the library about the license contents
License.value = {
  /* put the license contents here - the yeoman generator does this automatically for you */
}

import neo4j, { Node as NeoNode } from 'neo4j-driver'

// setup the driver
const neo4jDriver = neo4j.driver(
    'bolt://1.2.3.4/',
    neo4j.auth.basic('username', 'TheS3cr3t')
)

// We need to load the yfiles/view-layout-bridge module explicitly to prevent the webpack
// tree shaker from removing this dependency which is needed for 'morphLayout' in this demo.
Class.ensure(LayoutExecutor)

// hook up the graph control to the div in the page
const graphComponent = new GraphComponent('#graphComponent')

// make it interactive - we don't allow editing (creating new elements)
// but are generally interested in viewing, only
const inputMode = new GraphViewerInputMode()
graphComponent.inputMode = inputMode

// display a tooltip when the mouse hovers over an item
inputMode.addQueryItemToolTipListener((sender, args) => {
  // the neo4j data is stored in the "tag" property of the item
  // if it contains "properties" - show them in a simple HTML list
  if (args.item?.tag?.properties) {
    // we can use a string, or set an HTML Element (e.g. when we do cannot trust the data)
    args.toolTip = `<ul>
        ${Object.entries(args.item.tag.properties)
          .map(e => '<li>' + e[0] + ' : ' + e[1] + '</li>')
          .join('')}
       </ul>`
  }
})

// when the user double-clicks on a node, we want to focus that node in the layout
inputMode.addItemDoubleClickedListener(async (sender, args) => {
  // clicks could also be on a label, edge, port, etc.
  if (args.item instanceof INode) {
    // tell the engine that we don't want the default action for double-clicks to happen
    args.handled = true
    // we configure the layout data and tell it to put the item into the center
    const layoutData = new RadialLayoutData({ centerNodes: [args.item] })
    // we build the layout algorithm
    const layout = new RadialLayout({
      centerNodesPolicy: 'custom',
    })
    // now we calculate the layout and morph the results
    await graphComponent.morphLayout({
      layout,
      layoutData,
      easedAnimation: true,
      morphDuration: '1s',
    })
  }
})

// when the user hovers over a node, we want to highlight all nodes that are reachable from this node
inputMode.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
  // first we remove the old highlight
  graphComponent.highlightIndicatorManager.clearHighlights()
  if (args.item) {
    // and if we are hovering over a node
    // configure an instance of a new reachability algorithm
    new Reachability({ directed: true, startNodes: [args.item] })
      // run the algorithm on the graph in the view
      .run(graphComponent.graph)
      // and use the results to iterate over all reachable nodes
      .reachableNodes.forEach(node =>
        // and highlight them in the view
        graphComponent.highlightIndicatorManager.addHighlight(node)
      )
  }
})

// tell it that we are only interested in hovered-over nodes
inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
// and other elements should not discard the hover
inputMode.itemHoverInputMode.discardInvalidItems = false
// by default the mode is disabled, so enable the functionality, here
inputMode.itemHoverInputMode.enabled = true

// this function will be executed at startup - it performs the main setup
async function loadGraph() {
  // first we query a limited number of arbitrary nodeData
  // modify the query to suit your requirement!
  const nodeResult = await runCypherQuery('MATCH (node) RETURN node LIMIT 25')
  // we put the resulting records in a separate array
  /** @type {NeoNode[]} */
  const nodeData = nodeResult.records.map(record => record.get('node'))

  // and we store all node identities in a separate array
  const nodeIds = nodeData.map(node => node.identity)

  // with the node ids we can query the edges between the nodeData
  const edgeResult = await runCypherQuery(
    `MATCH (n)-[edge]-(m) 
              WHERE id(n) IN $nodeIds 
              AND id(m) IN $nodeIds
              RETURN DISTINCT edge LIMIT 100`,
    { nodeIds }
  )
  // and store the edges in an array
  const edgeData = edgeResult.records.map(record => record.get('edge'))

  // now we create the helper class that will help us build the graph from the data in a declarative way
  const graphBuilder = new GraphBuilder(graphComponent.graph)

  // we set the default style to use on the graph
  graphBuilder.graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: 'lightblue',
  })
  // and the default size
  graphBuilder.graph.nodeDefaults.size = new Size(120, 40)
  // and we also configure the labels to be truncated if they exceed a certain size
  graphBuilder.graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    maximumSize: [116, 36],
    wrapping: 'word-ellipsis',
  })
  // add semi-transparent background for the edge labels
  graphBuilder.graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    backgroundFill: 'rgba(255,255,255,0.83)',
  })
  // last not least we specify the default placements for the labels.
  graphBuilder.graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 3,
    autoRotation: true,
    sideOfEdge: 'above-edge',
  }).createDefaultParameter()

  const isMovie = dataItem => dataItem.labels && dataItem.labels.includes('Movie')

  // we split the data in movie nodes and non-movie nodes.
  const movieData = nodeData.filter(dataItem => isMovie(dataItem))
  const otherData = nodeData.filter(dataItem => !isMovie(dataItem))

  // now we configure the movie nodes
  const movieNodesSource = graphBuilder.createNodesSource(movieData, node => node.identity.toString(10))

  // we specify a distinct node style to use for the movie nodes
  movieNodesSource.nodeCreator.defaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: 'yellow',
  })
  // and a different default size, too
  movieNodesSource.nodeCreator.defaults.size = new Size(120, 50)

  // as well as what text to use as the first label for the movie nodes
  const simpleLabelBinding = movieNodesSource.nodeCreator.createLabelBinding(
    node => node.properties?.['title'] ?? node.properties?.['name']
  )

  // then we add a second source for all the non-movie nodes, too
  graphBuilder
    .createNodesSource(otherData, dataItem => dataItem.identity.toString(10))
    .nodeCreator.createLabelBinding(simpleLabelBinding.textProvider)

  // and we also specify the source for the edges, along with how
  // the source and target nodes get identified
  const edgesSource = graphBuilder.createEdgesSource(
    edgeData,
    dataItem => dataItem.start.toString(10),
    dataItem => dataItem.end.toString(10)
  )
  // and we display the label, too, using the type of the relationship
  edgesSource.edgeCreator.createLabelBinding(dataItem => dataItem.type)

  // similar to the above code, we also change the appearance of the "ACTED_IN" relationship
  // to a customized visualization
  const actedInEdgeStyle = new PolylineEdgeStyle({
    stroke: 'medium blue',
    smoothingLength: 30,
    targetArrow: 'blue default',
  })

  // instead of providing two edge sources, we can also use one source
  // and conditionally change the style based on its type
  edgesSource.edgeCreator.styleProvider = dataItem => {
    // .. of type "ACTED_IN"
    return dataItem.type === 'ACTED_IN' ? actedInEdgeStyle : null
  }

  // all is configured; now trigger the initial construction of the graph
  graphBuilder.buildGraph()

  // the graph does not have a layout at this point, so we run a simple radial layout
  await graphComponent.morphLayout(new RadialLayout())
}

/**
 * Asynchronous helper function that executes a query with parameters
 * *and* closes the session again.
 * @param {String} query The cypher query
 * @param {any} parameters The parameters to use for the query
 * @return {Promise<QueryResult>}
 */
async function runCypherQuery(query, parameters = {}) {
  const session = neo4jDriver.session({ defaultAccessMode: 'READ' })
  try {
    return await session.run(query, parameters)
  } finally {
    await session.close()
  }
}

// trigger the loading - show exceptions in an alert
loadGraph().catch(reason => alert(reason))

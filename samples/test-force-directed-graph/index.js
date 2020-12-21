/**
 *
 * @param {string} dataPath
 */
async function getData(dataPath = "./seed/miserables.json") {
  const responseData = fetch(dataPath).then((response) => response.json());
  const jsonData = responseData;

  return jsonData;
}

/* eslint no-undef: ["error"] */

/**
 *
 * @param {d3.Simulation<d3.SimulationNodeDatum>} simulation
 */
function drag(simulation) {
  function dragStarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragEnded(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag()
    .on("start", dragStarted)
    .on("drag", dragged)
    .on("end", dragEnded);
}

const height = window.innerHeight;
const width = window.innerWidth;
/**
 * Scales the data node .group value into arbitrary hexadecimal strings (for colour values)
 * e.g 1 = #00000 2 = #1f1f1f 10 = #ffffff
 */
function color() {
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return (d) => scale(d.group);
}


function zoomed(g, { transform }) {
  g.attr("transform", transform);
}

function chart(data) {
  const links = data.links.map((d) => Object.create(d));
  const nodes = data.nodes.map((d) => Object.create(d));

  // Mutato potato
  // Any number here as it is unused, overridden by the node-radius function
  const collisionation = d3.forceCollide(0);
  const raddddd = collisionation.radius(({ id }) => id.length * 5)

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(1)

    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collisionForce", raddddd);

  /*
    Remember to append the generated svg onto a page element
    (Observable HQ notebook depends cells and other auto-handling for visualisation)
  */
  const svg = d3
    .select("body")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

  const g = svg.append("g");

  const link = g
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => Math.sqrt(d.value));

  const node = g
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("id", (d) => d.id)
    .attr("r", (d) => d.id.length * 4)
    .attr("fill", color())
    .call(drag(simulation))
    .on("click", clicked);

  const label = g
    .append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .text((d) => d.id)
    .attr("fill", "black")
    .attr("dy", "0em")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .call(drag(simulation));

  node.append("title").text((d) => d.id);

  const zoomie = (elementToTransform) => zoomed(g, elementToTransform)

  const zoom = d3.zoom()
    .extent([[0, 0], [width, height]])
    .scaleExtent([0.1, 8])
    .on("zoom", zoomie);

  // allow free zooming/panning
  svg.call(zoom);

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    label.attr("x", (d) => d.x).attr("y", (d) => d.y);
  });

  function clicked(event, d) {
    console.log(`clicked: ${d3.select(`#${d.id}`).attr("id")}`); // TODO: broken if id contains a dot
    const translate = [width / 2, height / 2];

    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity.translate(translate[0] - d3.select(`#${d.id}`).attr("cx"), translate[1] - d3.select(`#${d.id}`).attr("cy"))); // updated for d3 v4
  }

  return svg.node();
}

getData()
  .then(chart)
  .catch((reason) => console.error(`Something went horribly wrong`, reason));

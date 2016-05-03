
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {

  var width = 600;
  var height = 520;
  var margin = {top:0, left:20, bottom:40, right:10};

  var data = [
    {word: "security", year: 1990, count: 4, type: "bill"},
    {word: "security", year: 1990, count: 8, type: "article"},
    {word: "foreign", year: 1991, count: 25, type: "bill"},
    {word: "security", year: 1991, count: 22, type: "article"},
    {word: "U.S.A", year: 1992, count: 20, type: "bill"},
    {word: "security", year: 1995, count: 12, type: "article"},
    {word: "education", year: 1992, count: 2, type: "bill"},
    {word: "education", year: 1994, count: 18, type: "article"},
    {word: "education", year: 1994, count: 8, type: "bill"},
    {word: "legislation", year: 1990, count: 4, type: "bill"},
    {word: "legislation", year: 1990, count: 8, type: "article"},
    {word: "russia", year: 1991, count: 25, type: "bill"},
    {word: "mexico", year: 1991, count: 22, type: "article"},
    {word: "border", year: 1992, count: 20, type: "bill"},
    {word: "legislation", year: 1995, count: 12, type: "article"},
    {word: "target", year: 1992, count: 2, type: "bill"},
    {word: "target", year: 1994, count: 18, type: "article"},
    {word: "target", year: 1994, count: 8, type: "bill"}
  ];

  data.sort(function(a, b){
  return b.count - a.count;
  });

  var words = new Set(),
      years = new Set(),
      max = data[0].count,
      buff = 5;

  for (var i=0; i < data.length; i++) {
    words.add(data[i].word);
    years.add(data[i].year);
  }

  words = Array.from(words);
  years = Array.from(years);

  years.sort(function(a,b){
    return a - b;
  })

  var radScale = d3.scale.linear()
    .domain([0, max])
    .range([0, (d3.min([height/words.length, width/years.length]) - buff)/2]);

  var sep = radScale(max) + buff;

  var x_nur = d3.scale.ordinal()
    .domain(years)
    .rangePoints([0 + sep, width-sep]);

  var y_nur = d3.scale.ordinal()
    .domain(words)
    .rangePoints([height - sep, 0 + sep])

  var xAxis = d3.svg.axis()
    .scale(x_nur)
    .orient("bottom");

  var yAxis = d3.svg.axis()
  .scale(y_nur)
  .orient("left");

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    // .html(function(d) {return "<strong>Mentions:</strong> <span style='color:#813386'>" + d.count + "</span>";});
    .html(function(d) {return "<span style='color:#813386'>" + d.count + "</span>   <strong>Mentions</strong>";});

  // constants to define the size
  // and margins of the vis area.


  var x = d3.scale.ordinal()
    .rangeRoundBands([width*0.1, width*0.95], 0.1);

  var y = d3.scale.linear()
    .rangeRound([height, height*0.05]);

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  var squareSize = 6;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // We will set the domain when the
  // data is processed.
  var xBarScale = d3.scale.linear()
    .range([0, width]);

  // The bar chart display is horizontal
  // so we can use an ordinal scale
  // to get width and y locations.
  var yBarScale = d3.scale.ordinal()
    .domain([0,1,2,3,4])
    .rangeBands([0, height - 10], 0.1, 0.1);

  // Color is determined just by the index of the bars
  var barColors = {0: "#C25B56", 1: "#BEB9B5", 2: "#96C0CE", 3: "#74828F", 4: "#525564"};

  // The histogram display shows the
  // top 10 countries so the range goes from 0 to 10
  var xHistScale = d3.scale.linear()
    .domain([0, 10])
    .range([0, width - 20]);

  var yHistScale = d3.scale.linear()
    .domain([0, 525])
    .range([height, height*0.05]);

  // The scatterplot goes from 0 to 1.0 on the xaxis
  var xCathScale = d3.scale.linear()
    .range([width*0.07, width*0.95]);

  var yCathScale = d3.scale.linear()
    .range([height, height*0.05]);

  yearsList = []
  counter = 1820
  for (var i=0; i<=10; i++){
    yearsList.push(counter);
    counter+=20;
  }
  console.log(yearsList)
  // Sets up the scale for the line graph
  var xLineScale = d3.scale.ordinal()
  	.domain(yearsList)
    .range([width*0.07, width*0.95]);

  var yLineScale = d3.scale.linear()
    .rangeRound([height, height*0.05]);

  // Sets up the x and y axes
  var xAxisBar = d3.svg.axis()
    .scale(xBarScale)
    .orient("bottom");

  var xAxisHist = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(function(d) { return d; });

  var yAxisHist = d3.svg.axis()
    .scale(yHistScale)
    .orient("left");

  // setup variables for scatterplot
  var xCathValue = function(d) { return d["Percent_Catholic"]; };
  var xCathMap = function(d) { return xCathScale(xCathValue(d)); }; // data -> display

  var yCathValue = function(d) { return d["NormalizedCount"] * 1e6; }; // data -> value
  var yCathMap = function(d) { return yCathScale(yCathValue(d));}; // data -> display

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  var color = d3.scale.ordinal()
    .range(["#ff8c00", "#a05d56", "#98abc5"]);

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll("svg").data([priestData]);
      svg.enter().append("svg").append("g");

      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);


      // this group element will be used to contain all
      // other elements.
      g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // perform some preprocessing on raw data
      var priestData = getPriests(rawData);
      // filter to just include incriminated
      var incriminated = getIncriminated(priestData);

      // get the proportion of incriminated people for each subcategory
      var incriminatedCounts = groupByType(incriminated);
      var totalCounts = groupByType(rawData).slice(0, 5);

      // divides each count by the total
      for (var idx = 0; idx < incriminatedCounts.length; idx++) {
        incriminatedCounts[idx].values = incriminatedCounts[idx].values / totalCounts[idx].values;
      }

      incriminatedCounts.sort(function(a, b) { return b.values - a.values })


      // set the bar scale's domain
      var countMax = 0.8;

      xBarScale.domain([0,countMax]);

      setupVis(priestData, incriminatedCounts);

      setupSections();

    });
  };

  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param priestData - data object for each word.
   * @param incriminatedCounts - nested data that includes
   *  element for each filler word type.
   */
  setupVis = function(priestData, percentages) {
    // axis
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisBar);
    g.select(".x.axis").style("opacity", 0);

    g.append("foreignObject")
      .attr("class", "sub-title openvis-title")
      .attr("x", 115)
      .attr("y", 125)
      .attr("width", 400)
      .attr("height", 310)
      .append("xhtml:body")
      .html('<iframe src="https://www.youtube.com/embed/Ixi9_cciy8w?autoplay=1&controls=0&showinfo=0&modestbranding=1" allowfullscreen="" frameborder="0" height="315" width="420"></iframe>');

    g.selectAll(".openvis-title")
      .attr("opacity", 0);

    // square grid
    var squares = g.selectAll(".square").data(priestData);
    squares.enter()
      .append("rect")
      .attr("width", squareSize)
      .attr("height", squareSize)
      .attr("fill", "#fff")
      .classed("square", true)
      .classed("fill-square", function(d) { return d.incriminated; })
      .attr("x", function(d) { return d.x;})
      .attr("y", function(d) { return d.y;})
      .attr("opacity", 0);

    // barchart
    var bars = g.selectAll(".bar").data(percentages);
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", function(d,i) { return yBarScale(i);})
      .attr("fill", function(d,i) { return barColors[i]; })
      .attr("width", 0)
      .attr("height", yBarScale.rangeBand());

    var barText = g.selectAll(".bar-text").data(percentages);
    barText.enter()
      .append("text")
      .attr("class", "bar-text")
      .text(function(d) {
        switch (d.key) {
          case "N":
            var retVal = "nun ";
            break;
          case "S":
            var retVal = "seminarian ";
            break;
          case "B":
            var retVal = "bishop ";
            break;
          case "P":
            var retVal = "priest ";
            break;
          case "D":
            var retVal = "deacon ";
        }
       return retVal + d.values.toFixed(2); })
      .attr("x", 0)
      .attr("dx", 15)
      .attr("y", function(d,i) { return yBarScale(i);})
      .attr("dy", yBarScale.rangeBand() / 1.2)
      .style("font-size", "60px")
      .style("text-shadow", "2px 2px 2px")
      .attr("fill", "white")
      .attr("opacity", 0);

    // histogram
    var svg_hist = g.append("svg")
   	  .attr("class", "hist");

      // draw legend
      var legend = svg.selectAll(".legend")
          .data(color.domain())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      // draw legend colored rectangles
      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      // draw legend text
      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})

    // DOTS ON YEARS

    var svg_dots = g.append("svg")
      .attr("class", "dots")

    svg.call(tip);

    svg_dots.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg_dots.append("g")
      .attr("class", "axis")
      .call(yAxis);

    svg_dots.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("cx", function(d) {return x_nur(d.year);})
      .attr("cy", height/2)
      .attr("r", function(d) {return radScale(d.count);})
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      .attr("class", function(d) {
        var returnClass;
        if (d.type==="bill") {returnClass="b circle";}
        else if (d.type==="article") {returnClass="a circle";}
        return returnClass;
      })
      .transition()
      .delay(250)
      .duration(2000)
      .attr("cy", function(d) {return y_nur(d.word);});

      // creates circles to show growth
      g.append("circle")
        .attr("class", "growth")
        .attr("cx", width/4)
        .attr("cy", height/2)
        .attr("r", Math.sqrt(6427))
        .attr("fill", "#B6212D");

      // g.append("circle")
      //   .attr("class", "growth")
      //   .attr("cx", width/4)
      //   .attr("cy", height/2)
      //   .attr("r", Math.sqrt(4392))
      //   .attr("fill", "#DF9496");

      g.append("text")
        .attr("class", "growth")
        .attr("x", width/4)
        .attr("y", height*0.7)
        .attr("fill", "#fff")
        .text("114 Bills on Immigration");

      g.append("circle")
        .attr("class", "growth")
        .attr("cx", 3*width/4)
        .attr("cy", height/2)
        .attr("r", Math.sqrt(17259))
        .attr("fill", "#6D929B");

      g.append("circle")
        .attr("class", "growth")
        .attr("cx", 3*width/4)
        .attr("cy", height/2)
        .attr("r", Math.sqrt(12259))
        .attr("fill", "#C1DAD6");

      g.append("text")
        .attr("class", "growth")
        .attr("x", 3*width/4)
        .attr("y", height*0.8)
        .attr("fill", "#fff")
        .text("71% of Bills Passed");

    // visualizes the number of survivors per year
    var svg_line = g.append("svg")
      .attr("class", "line")

    // Get the data
    d3.csv("data/lprClean.csv", function(error, data) {
      // Scale the range of the data
      var x = d3.scale.linear().range([width*0.10, width*0.82]);
      var y = d3.scale.linear().range([height, height*0.45]);
      var yTicks = d3.scale.linear().range([height, height*0.08]);
      yTicks.domain([0,1000])
      x.domain([1820, 2013]);
      y.domain([0, 1100000]);

      var xLineAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom").ticks(11).tickFormat(d3.format("g"));

      var yLineAxis = d3.svg.axis()
        .scale(yTicks)
        .orient("left")
        .ticks(10);

      // Helper function for the line graph
      var valueline = d3.svg.line()
        .x(function(d) { return x(d["Year"]); })
        .y(function(d) { return y(d["Number"]); });

      // Add the valueline path.
      svg_line.append("path")
          .attr("class", "line")
          .attr("d", valueline(data));

      // Add the scatterplot
      svg_line.selectAll("dot")
          .data(data)
        .enter().append("circle")
          .attr("fill", "#a1a1a1")
          .attr("r", 3.5)
          .attr("cx", function(d) { return x(d["Year"]); })
          .attr("cy", function(d) { return y(d["Number"]); });

      // Add the X Axis
      svg_line.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(10," + height + ")")
          .call(xLineAxis)
          .style("fill", "#D9D9D9")
        .append("text")
          .attr("transform", "translate(" + width/2 + ",35)")
          .attr("text-anchor", "middle")
          .text("Year");

      // Add the Y Axis
      svg_line.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(50, 0)")
          .call(yLineAxis)
          .style("fill", "#D9D9D9")
          .style("opacity", 1)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -180)
          .attr("y", -50)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Number Immigrants (in thousands)");

      svg_line.append("text")
        .attr("x", width/2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .style("fill", "#D9D9D9")
        .text("Immigrants Per Year Since 1820");
    });

    g.selectAll(".growth")
      .style("opacity", 0);

    g.selectAll(".hist")
      .style("opacity", 0);

    g.selectAll(".dots")
      .style("opacity", 0);

    g.selectAll(".line")
      .style("opacity", 0);
  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  setupSections = function() {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showGrid;
    activateFunctions[2] = highlightGrid;
    activateFunctions[3] = showBar;
    activateFunctions[4] = showHist;
    activateFunctions[5] = showScatter;
    activateFunctions[6] = showGrowth;
    activateFunctions[7] = callToAction;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 9; i++) {
      updateFunctions[i] = function() {};
    }
    // updateFunctions[7] = callToAction;
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showTitle() {
    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".openvis-title")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }

  /**
   * showGrid - square grid
   *
   * hides: filler count title
   * hides: filler highlight in grid
   * shows: square grid
   *
   */
  function showGrid() {
    g.selectAll(".growth")
      .transition()
      .duration(200)
      .style("opacity", 0);


  //   g.selectAll(".sub-title")
  //     .transition()
  //     .duration(0)
  //     .attr("opacity", 0);

    g.selectAll(".square")
      .transition()
      .duration(600)
      .delay(function(d,i) {
        return 5 * d.row;
      })
      .attr("opacity", 1.0)
      .attr("fill", "#ddd");
  }

  /**
   * highlightGrid - show fillers in grid
   *
   * hides: barchart, text and axis
   * shows: square grid and highlighted
   *  incriminated. also ensures squares
   *  are moved back to their place in the grid
   */
  function highlightGrid() {
    hideAxis();

    g.selectAll(".bar")
      .transition()
      .duration(600)
      .attr("width", 0);

    g.selectAll(".bar-text")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".square")
      .transition()
      .duration(600)
      .delay(function(d,i) {
        return 5 * d.row;
      })
      .attr("opacity", 1.0)
      .attr("fill", "#ddd");

    // use named transition to ensure
    // move happens even if other
    // transitions are interrupted.
    g.selectAll(".fill-square")
      .transition("move-fills")
      .duration(800)
      .attr("x", function(d,i) {
        return d.x;
      })
      .attr("y", function(d,i) {
        return d.y;
      });

    g.selectAll(".fill-square")
      .transition()
      .duration(800)
      .attr("opacity", 1.0)
      .attr("fill", function(d) { return d.incriminated ? '#D14E47' : '#ddd'; });
  }

  /**
   * showBar - barchart
   *
   * hides: square grid
   * hides: histogram
   * shows: barchart
   *
   */
  function showBar() {
    // ensure bar axis is set
    showAxis(xAxisBar);

    g.selectAll(".square")
      .transition()
      .duration(800)
      .attr("opacity", 0);

    g.selectAll(".fill-square")
      .transition()
      .duration(800)
      .attr("x", 0)
      .attr("y", function(d,i) {
        return yBarScale(i % 5) + yBarScale.rangeBand() / 4;
      })
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".hist")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".bar-text")
      .transition()
      .duration(600)
      .delay(1600)
      .attr("opacity", 1.0);

    g.selectAll(".bar")
      .transition()
      .delay(function(d,i) { return 300 * (i + 1);})
      .duration(600)
      .attr("width", function(d) { return xBarScale(d.values); });


  }

  /**
   * showHist - shows the first part
   *  of the histogram of incriminated
   *
   * hides: barchart
   * hides: last half of histogram
   * shows: first half of histogram
   *
   */
  function showHist() {
    // switch the axis to histogram one
    hideAxis();

    g.selectAll(".bar-text")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".bar")
      .transition()
      .duration(600)
      .attr("width", 0);


    g.selectAll(".dots")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".hist")
      .transition()
      .duration(600)
      .style("opacity", 1);

    // g.selectAll(".hist")
    //   .transition()
    //   .delay(function(d,i) { return 300 * (i + 1);})
    //   .duration(600)
    //   .attr("width", function(d) { return xAxis(d.values); });
  }

  /**
   * showScatter - show all histogram
   *
   * hides: cough title and color
   * (previous step is also part of the
   *  histogram, so we don't have to hide
   *  that)
   * shows: all histogram bars
   *
   */
  function showScatter() {
    // ensure the axis to histogram one
    hideAxis();

    // named transition to ensure
    // color change is not clobbered
    g.selectAll(".hist")
      .transition()
      .duration(500)
      .style("opacity", 0);

    g.selectAll(".growth")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".dots")
      .transition()
      .duration(600)
      .style("opacity", 1);

  }

  /**
   * showGrowth
   *
   * hides: nothing
   * (previous and next sections are histograms
   *  so we don't have to hide much here)
   * shows: histogram
   *
   */
  function showGrowth() {
    // ensure the axis to histogram one
    hideAxis();

    g.selectAll(".growth")
      .transition()
      .duration(600)
      .style("opacity", 1.0);

    g.selectAll(".line")
      .transition()
      .duration(600)
      .style("opacity", 0);


    g.selectAll(".dots")
      .transition()
      .duration(600)
      .style("opacity", 0);
  }

  /**
   * callToAction - increase/decrease
   * cough text and color
   *
   * @param progress - 0.0 - 1.0 -
   *  how far user has scrolled in section
   */
  function callToAction(progress) {
    // g.selectAll(".growth")
    //   .transition()
    //   .duration(200)
    //   .style("opacity", 0);

    g.selectAll(".sub-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".line")
      .transition()
      .duration(200)
      .style("opacity", 1);

  }

  /**
   * showAxis - helper function to
   * display particular xAxis
   *
   * @param axis - the axis to show
   *  (xAxisHist or xAxisBar)
   */
  function showAxis(axis) {
    g.select(".x.axis")
      .call(axis)
      .transition().duration(500)
      .style("opacity", 1)
      .style("fill", "#D9D9D9")
      .style("font-size", 16);
  }

  /**
   * hideAxis - helper function
   * to hide the axis
   *
   */
  function hideAxis() {
    g.select(".x.axis")
      .transition().duration(500)
      .style("opacity",0);
  }

  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

  /**
   * getPriests - maps raw data to
   * array of data objects. There is
   * one data object for each word in the speach
   * data.
   *
   * This function converts some attributes into
   * numbers and adds attributes used in the visualization
   *
   * @param rawData - data read in from file
   */
  function getPriests(rawData) {
    return rawData.map(function(d,i) {
      // is this word a filler word?
      d.incriminated = (d.Status === "incriminated") ? true : false;
      // time in seconds word was spoken
      d.time = +d.time;
      // time in minutes word was spoken
      d.min = Math.floor(d.time / 60);

      // positioning for square visual
      // stored here to make it easier
      // to keep track of.
      d.col = i % numPerRow;
      d.x = d.col * (squareSize + squarePad);
      d.row = Math.floor(i / numPerRow);
      d.y = d.row * (squareSize + squarePad);
      return d;
    });
  }

  /**
   * getIncriminated - returns array of
   * only incriminated
   *
   * @param data - word data from getPriests
   */
  function getIncriminated(data) {
    return data.filter(function(d) { return d.incriminated; });
  }

  /**
   * getHistogram - use d3's histogram layout
   * to generate histogram bins for our word data
   *
   * @param data - word data. we use incriminated
   *  from getIncriminated
   */
  function getHistogram(data) {
    // only get words from the first 30 minutes
    var thirtyMins = data.filter(function(d) { return d.min < 30; });
    // bin data into 2 minutes chuncks
    // from 0 - 31 minutes
    return d3.layout.histogram()
      .value(function(d) { return d.min; })
      .bins(d3.range(0,31,2))
      (thirtyMins);
  }

  /**
   * groupByType - group words together
   * using nest. Used to get counts for
   * barcharts.
   *
   * @param words
   */
  function groupByType(words) {
    return d3.nest()
      .key(function(d) { return d.T; })
      .rollup(function(v) { return v.length; })
      .entries(words)
      .sort(function(a,b) {return b.values - a.values;});
  }

  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function(i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select("#vis")
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function(index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function(index, progress){
    plot.update(index, progress);
  });
}

// load data and display
d3.csv("data/cleanedData.csv", display);
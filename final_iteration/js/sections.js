
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

    /**
     * VIZ 1 - video
     * class: home_media
     */
    var home_media = g.append("svg")
      .attr("class", "home_media")

    home_media.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisBar);


    loadVid = function() {
      home_media.append("foreignObject")
        .attr("class", "home_media")
        .attr("x", 115)
        .attr("y", 125)
        .attr("width", 400)
        .attr("height", 310)
        .append("xhtml:body")
        .html('<iframe width="420" height="315" src="https://www.youtube.com/embed/Ixi9_cciy8w?rel=0&amp;controls=0&amp;showinfo=0&amp;autoplay=1" frameborder="0" allowfullscreen></iframe>');
      };

    home_media.select(".x.axis").style("opacity", 0);
    home_media.selectAll(".home_media")
      .attr("opacity", 0);

      /**
       * VIZ 2 - time graph
       * class: general_1
       */
      var general_1 = g.append("svg")
        .attr("class", "general_1")

      // Collapsed laoding data DONE
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
        general_1.append("path")
            .attr("class", "general_1")
            .attr("stroke", "steelblue")
            .attr("fill", "none")
            .attr("d", valueline(data));

        // Add the scatterplot
        general_1.selectAll("dot")
            .data(data)
          .enter().append("circle")
            .attr("fill", "#a1a1a1")
            .attr("r", 3.5)
            .attr("cx", function(d) { return x(d["Year"]); })
            .attr("cy", function(d) { return y(d["Number"]); });

        // Add the X Axis
        general_1.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(10," + height + ")")
            .call(xLineAxis)
            .style("fill", "#D9D9D9")
          .append("text")
            .attr("transform", "translate(" + width/2 + ",35)")
            .attr("text-anchor", "middle")
            .text("Year");

        // Add the Y Axis
        general_1.append("g")
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

        general_1.append("text")
          .attr("x", width/2)
          .attr("y", 15)
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .style("fill", "#D9D9D9")
          .text("Immigrants Per Year Since 1820");
      });

      /**
       * VIZ 3 - general frequency
       * class: general_2
       * CSV Keys: Year, Number_Bills, Number_Articles, Number_DHS
       */
      var general_2 = g.append("svg")
        .attr("class", "general_2")

      d3.csv("data/overall_distribution.csv", function(error, data_dhs) {
        // Scale the range of the data
        var years = new Set(),
            article_counts = new Set(),
            bill_counts = new Set(),
            dhs_counts = new Set();

        for (var i=0; i < data_dhs.length; i++) {
          years.add(data_dhs[i]["Year"]);
          dhs_counts.add(data_dhs[i]["Number_DHS"]);
          article_counts.add(data_dhs[i]["Number_Articles"]);
          bill_counts.add(data_dhs[i]["Number_Bills"]);
        }

          years = Array.from(years);
          article_counts = Array.from(article_counts);
          bill_counts = Array.from(bill_counts);
          dhs_counts = Array.from(dhs_counts);

          bill_counts_int = [];
          article_counts_int = [];
          dhs_counts_int = [];

          bill_counts.forEach(function(value){bill_counts_int.push(parseInt(value))})
          dhs_counts.forEach(function(value){dhs_counts_int.push(parseInt(value))})
          article_counts.forEach(function(value){article_counts_int.push(parseInt(value))})

          var min_year = d3.min(years),
              max_year = d3.max(years),
              bill_min = d3.min(bill_counts_int),
              bill_max = d3.max(bill_counts_int),
              dhs_min = d3.min(dhs_counts_int),
              dhs_max = d3.max(dhs_counts_int),
              article_min = d3.min(article_counts_int),
              article_max = d3.max(article_counts_int);

          var x = d3.scale.linear()
              .domain([min_year, max_year])
              .range([margin.left*4, width - 4*margin.right]);

          var bill_y = d3.scale.linear()
              .domain([bill_min, bill_max])
              .range([height - margin.bottom, margin.top]);

          var dhs_y = d3.scale.linear()
              .domain([dhs_min, dhs_max])
              .range([height - margin.bottom, margin.top]);

          var article_y = d3.scale.linear()
              .domain([article_min, article_max])
              .range([height - margin.bottom, margin.top]);

          var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .tickFormat(d3.format("g"));

          var bill_yAxis = d3.svg.axis()
              .scale(bill_y)
              .orient("left");

          var dhs_yAxis = d3.svg.axis()
              .scale(dhs_y)
              .orient("right");

          var article_yAxis = d3.svg.axis()
              .scale(article_y)
              .orient("right");

          general_2.append("g")
             .attr("class", "axis")
             .attr("transform", "translate(0," + height + ")")
             .call(xAxis)
             .append("text")
               .attr("transform", "translate(" + width/2 + ",38)")
               .attr("text-anchor", "middle")
               .text("Year");

          general_2.append("g")
             .attr("class", "axis")
             .attr("transform", "translate(" + width + ",0)")
             .call(bill_yAxis)
             .attr("stroke", "green");

          general_2.append("g")
             .attr("class", "axis")
             .attr("transform", "translate(" + margin.left + ",0)")
             .call(dhs_yAxis)
             .attr("stroke", "steelblue");

          general_2.append("g")
             .attr("class", "axis")
             .attr("transform", "translate(" + margin.left*3 + ",0)")
             .call(article_yAxis)
             .attr("stroke", "#ff6666");


          var bill_line_gen = d3.svg.line()
              .x(function(d) { return x(d["Year"]); })
              .y(function(d) { return bill_y(d["Number_Bills"]);})
              .interpolate("linear");

          var dhs_line_gen = d3.svg.line()
              .x(function(d) { return x(d["Year"]); })
              .y(function(d) { return dhs_y(d["Number_DHS"]); })
              .interpolate("linear");

          var articles_line_gen = d3.svg.line()
              .x(function(d) { return x(d["Year"]); })
              .y(function(d) { return article_y(d["Number_Articles"]); })
              .interpolate("linear");

          general_2.append("path")
              .style("opacity", 0)
              .attr('d', bill_line_gen(data_dhs))
              .attr('stroke', '#4ca54c')
              .attr('stroke-width', 2)
              .attr('fill', 'none')
              .attr('style', "color:green")
              .transition().delay(0).duration(2000)
              .style("opacity", 1);

          general_2.append("path")
              .style("opacity", 0)
              .attr('d', dhs_line_gen(data_dhs))
              .attr('stroke', 'steelblue')
              .attr('stroke-width', 2)
              .attr('fill', 'none')
              .transition().delay(500).duration(2000)
              .style("opacity", 1);

          general_2.append("path")
              .style("opacity", 0)
              .attr('d', articles_line_gen(data_dhs))
              .attr('stroke', '#ff6666')
              .attr('stroke-width', 2)
              .attr('fill', 'none')
              .transition().delay(1000).duration(2000)
              .style("opacity", 1);

          var mark = {'width': 20, 'height': 40};

          var marker_bill = general_2.append('g')
              .attr("class", "marker")
              .attr("transform", "translate(" + (x(1997) - mark.width/2) + "," + mark.height + ")");

          var marker_dhs = general_2.append('g')
              .attr("class", "marker")
              .attr("transform", "translate(" + (x(1996) - mark.width/2) + "," + mark.height + ")");

          var marker_article = general_2.append('g')
              .attr("class", "marker")
              .attr("transform", "translate(" + (x(1999) - mark.width/2) + "," + mark.height + ")");

          marker_bill.append('rect')
              .attr('width', mark.width)
              .attr('height', mark.height)
              .attr('fill', 'grey')
              .style('opacity', 0)
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);

          marker_dhs.append('rect')
              .attr('width', mark.width)
              .attr('height', mark.height)
              .attr('fill', 'grey')
              .style('opacity', 0)
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);

          marker_article.append('rect')
              .attr('width', mark.width)
              .attr('height', mark.height)
              .attr('fill', 'grey')
              .style('opacity', 0)
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);


          marker_bill.append("text")
              .attr("x", mark.width/2)
              .attr("y", mark.height/2)
              .text("1997")
              .attr("transform", "rotate(-90, " + mark.width/2 + "," + mark.height/2 + ")")
              .attr("dy", mark.width/4)
              .style('opacity', 0)
              .style("text-anchor", "middle")
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);

          marker_dhs.append("text")
              .attr("x", mark.width/2)
              .attr("y", mark.height/2)
              .text("1996")
              .attr("transform", "rotate(-90, " + mark.width/2 + "," + mark.height/2 + ")")
              .attr("dy", mark.width/4)
              .style('opacity', 0)
              .style("text-anchor", "middle")
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);

          marker_article.append("text")
              .attr("x", mark.width/2)
              .attr("y", mark.height/2)
              .text("1999")
              .attr("transform", "rotate(-90, " + mark.width/2 + "," + mark.height/2 + ")")
              .attr("dy", mark.width/4)
              .style('opacity', 0)
              .style("text-anchor", "middle")
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);

          marker_bill.append("polygon")
              .attr("points", "" + 0 + "," + mark.height + " " + mark.width + "," + mark.height + " " + mark.width/2 + "," + (mark.width + mark.height) + "")
              .attr("fill", "gray")
              .style('opacity', 0)
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);

          marker_dhs.append("polygon")
              .attr("points", "" + 0 + "," + mark.height + " " + mark.width + "," + mark.height + " " + mark.width/2 + "," + (mark.width + mark.height) + "")
              .attr("fill", "gray")
              .style('opacity', 0)
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);

          marker_article.append("polygon")
              .attr("points", "" + 0 + "," + mark.height + " " + mark.width + "," + mark.height + " " + mark.width/2 + "," + (mark.width + mark.height) + "")
              .attr("fill", "gray")
              .style('opacity', 0)
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);

          marker_bill.append("line")
              .attr("x1", mark.width/2)
              .attr("x2", mark.width/2)
              .attr("y1", mark.height + mark.width)
              .attr("y2", height - mark.height)
              .style("stroke", "grey")
              .style('opacity', 0)
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);

          marker_dhs.append("line")
              .attr("x1", mark.width/2)
              .attr("x2", mark.width/2)
              .attr("y1", mark.height + mark.width)
              .attr("y2", height - mark.height)
              .style("stroke", "grey")
              .style('opacity', 0)
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);

          marker_article.append("line")
              .attr("x1", mark.width/2)
              .attr("x2", mark.width/2)
              .attr("y1", mark.height + mark.width)
              .attr("y2", height - mark.height)
              .style("stroke", "grey")
              .style('opacity', 0)
              .transition().delay(1500).duration(1000)
              .style('opacity', 1);

      });

      /**
       * VIZ 4 - time graph zoomed
       * class: general_1_zoomed
       */

       var general_1_zoomed = g.append("svg")
         .attr("class", "general_1_zoomed")

       d3.csv("data/lprClean_zoom.csv", function(error, data) {
         // Scale the range of the data
         var x = d3.scale.linear().range([width*0.10, width*0.82]);
         var y = d3.scale.linear().range([height, height*0.45]);
         var yTicks = d3.scale.linear().range([height, height*0.08]);
         yTicks.domain([0,1000])
         x.domain([1990, 2014]);
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
         general_1_zoomed.append("path")
             .attr("class", "general_1_zoomed")
             .attr("stroke", "steelblue")
             .attr("fill", "none")
             .attr("d", valueline(data));

         // Add the scatterplot
         general_1_zoomed.selectAll("dot")
             .data(data)
           .enter().append("circle")
             .attr("fill", "#a1a1a1")
             .attr("r", 3.5)
             .attr("cx", function(d) { return x(d["Year"]); })
             .attr("cy", function(d) { return y(d["Number"]); });

         // Add the X Axis
         general_1_zoomed.append("g")
             .attr("class", "x axis")
             .attr("transform", "translate(10," + height + ")")
             .call(xLineAxis)
             .style("fill", "#3b3b3b")
           .append("text")
             .attr("transform", "translate(" + width/2 + ",35)")
             .attr("text-anchor", "middle")
             .text("Year");

         // Add the Y Axis
         general_1_zoomed.append("g")
             .attr("class", "y axis")
             .attr("transform", "translate(50, 0)")
             .call(yLineAxis)
             .style("fill", "#3b3b3b")
             .style("opacity", 1)
           .append("text")
             .attr("transform", "rotate(-90)")
             .attr("x", -180)
             .attr("y", -50)
             .attr("dy", ".71em")
             .style("text-anchor", "end")
             .text("Number Immigrants (in thousands)");

         general_1_zoomed.append("text")
           .attr("x", width/2)
           .attr("y", 15)
           .attr("text-anchor", "middle")
           .attr("font-size", "16px")
           .style("fill", "#3b3b3b")
           .text("Immigrants Per Year Since 1820");
       });

      /**
       * VIZ 5 - bills bubble graph
       * class: bills_bubbles
       */

      var bills_bubbles = g.append("svg")
        .attr("class", "bills_bubbles")

       bills_bubbles.append("text")
         .attr("class", "bills_bubbles")
         .attr("x", width/2.6)
         .attr("y", height*0.8)
         .attr("fill", "#0000000")
         .text("114 Bills on Immigration");

       bills_bubbles.append("circle")
         .attr("class", "bills_bubbles")
         .attr("cx", width/2)
         .attr("cy", height/2)
         .attr("r", Math.sqrt(17259))
         .attr("fill", "#6D929B");

       bills_bubbles.append("circle")
         .attr("class", "bills_bubbles")
         .attr("cx", width/2)
         .attr("cy", height/2)
         .attr("r", Math.sqrt(12259))
         .attr("fill", "#C1DAD6");

       bills_bubbles.append("text")
         .attr("class", "bills_bubbles")
         .attr("x", width/2.49)
         .attr("y", height*0.85)
         .attr("fill", "#0000000")
         .text("71% of Bills Passed");

        /**
         * VIZ 6 - top subjects graph
         * class: top_subjects
         */

        var top_subjects = g.append("svg")
          .attr("class", "top_subjects")

        d3.csv("data/subject_bill_distribution.csv", function(error, data) {
           // Scale the range of the data
           var x = d3.scale.ordinal()
               .rangeRoundBands([0, width], .1);

           var y = d3.scale.linear()
               .range([height, 0]);

           var xAxis = d3.svg.axis()
               .scale(x)
               .orient("bottom");

           var yAxis = d3.svg.axis()
               .scale(y)
               .orient("left")
               .ticks(18, "%");

           x.domain(data.map(function(d) { return d["Top-Subject"]; }));
           y.domain([0, d3.max(data, function(d) {return parseInt(d["Number"]); })]);

           top_subjects.append("g")
               .attr("class", "x axis")
               .attr("transform", "translate(0," + height/1.15 + ")")
               .call(xAxis)
               .selectAll("text")
                   .style("text-anchor", "end")
                   .attr("dx", "-.8em")
                   .attr("dy", ".15em")
                   .attr("transform", function(d) {
                       return "rotate(-65)"
                   });

           top_subjects.append("g")
               .attr("class", "y axis")
               .call(yAxis)
             .append("text")
               .attr("transform", "rotate(-90)")
               .attr("y", 6)
               .attr("dy", ".71em")
               .style("text-anchor", "end")

           top_subjects.selectAll(".bar")
             .data(data)
             .enter().append("rect")
             .attr("class", "bar")
             .attr("x", function(d) { return x(d["Top-Subject"]); })
             .attr("width", x.rangeBand())
             .attr("y", function(d) { return y(d["Number"])-70; })
             .attr("height", function(d) { return height - y(d["Number"]); });
         });

        /**
         * VIZ 7 - voting graph
         * class: voting
         */

        var voting = g.append("svg")
          .attr("class", "voting")

        d3.csv("data/vote_econ_topic_distribution.csv", function(error, data) {
          // Scale the range of the data
          var x = d3.scale.ordinal()
              .rangeRoundBands([0, width], .1);

          var y = d3.scale.linear()
              .range([height, 0]);

          var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom");

          var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(18, "%");

          x.domain(data.map(function(d) { return d["bills"]; }));
          y.domain([0, d3.max(data, function(d) {return parseFloat(d["yes_dem"]); })]);

          voting.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height/1.15 + ")")
              .call(xAxis)
              .selectAll("text")
                  .style("text-anchor", "end")
                  .attr("dx", "-.8em")
                  .attr("dy", ".15em")
                  .attr("transform", function(d) {
                      return "rotate(-65)"
                  });

          voting.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")

          voting.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d["bills"]); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d["yes_dem"])-70; })
            .attr("height", function(d) { return height - y(d["yes_dem"]); });
        });

        /**
         * VIZ 8 - final bill graph
         * class: final_bill
         */

         var final_bill = g.append("svg")
           .attr("class", "final_bill")

         d3.csv("data/overall_distribution.csv", function(error, data_dhs) {
           // Scale the range of the data
           var years = new Set(),
               article_counts = new Set(),
               bill_counts = new Set(),
               dhs_counts = new Set();

           for (var i=0; i < data_dhs.length; i++) {
             years.add(data_dhs[i]["Year"]);
             dhs_counts.add(data_dhs[i]["Number_DHS"]);
             article_counts.add(data_dhs[i]["Number_Articles"]);
             bill_counts.add(data_dhs[i]["Number_Bills"]);
           }

             years = Array.from(years);
             article_counts = Array.from(article_counts);
             bill_counts = Array.from(bill_counts);
             dhs_counts = Array.from(dhs_counts);

             bill_counts_int = [];
             article_counts_int = [];
             dhs_counts_int = [];

             bill_counts.forEach(function(value){bill_counts_int.push(parseInt(value))})
             dhs_counts.forEach(function(value){dhs_counts_int.push(parseInt(value))})
             article_counts.forEach(function(value){article_counts_int.push(parseInt(value))})

             var min_year = d3.min(years),
                 max_year = d3.max(years),
                 bill_min = d3.min(bill_counts_int),
                 bill_max = d3.max(bill_counts_int),
                 dhs_min = d3.min(dhs_counts_int),
                 dhs_max = d3.max(dhs_counts_int),
                 article_min = d3.min(article_counts_int),
                 article_max = d3.max(article_counts_int);

             var x = d3.scale.linear()
                 .domain([min_year, max_year])
                 .range([margin.left*4, width - 4*margin.right]);

             var bill_y = d3.scale.linear()
                 .domain([bill_min, bill_max])
                 .range([height - margin.bottom, margin.top]);

             var dhs_y = d3.scale.linear()
                 .domain([dhs_min, dhs_max])
                 .range([height - margin.bottom, margin.top]);

             var article_y = d3.scale.linear()
                 .domain([article_min, article_max])
                 .range([height - margin.bottom, margin.top]);

             var xAxis = d3.svg.axis()
                 .scale(x)
                 .orient("bottom")
                 .tickFormat(d3.format("g"));

             var bill_yAxis = d3.svg.axis()
                 .scale(bill_y)
                 .orient("left");

             var dhs_yAxis = d3.svg.axis()
                 .scale(dhs_y)
                 .orient("right");

             var article_yAxis = d3.svg.axis()
                 .scale(article_y)
                 .orient("right");

             final_bill.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                  .attr("transform", "translate(" + width/2 + ",38)")
                  .attr("text-anchor", "middle")
                  .text("Year");

             final_bill.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + width + ",0)")
                .call(bill_yAxis)
                .attr("stroke", "green");

             final_bill.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(dhs_yAxis)
                .attr("stroke", "steelblue");

             final_bill.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + margin.left*3 + ",0)")
                .call(article_yAxis)
                .attr("stroke", "#ff6666");


             var bill_line_gen = d3.svg.line()
                 .x(function(d) { return x(d["Year"]); })
                 .y(function(d) { return bill_y(d["Number_Bills"]);})
                 .interpolate("linear");

             var dhs_line_gen = d3.svg.line()
                 .x(function(d) { return x(d["Year"]); })
                 .y(function(d) { return dhs_y(d["Number_DHS"]); })
                 .interpolate("linear");

             var articles_line_gen = d3.svg.line()
                 .x(function(d) { return x(d["Year"]); })
                 .y(function(d) { return article_y(d["Number_Articles"]); })
                 .interpolate("linear");

             final_bill.append("path")
                 .style("opacity", 0)
                 .attr('d', bill_line_gen(data_dhs))
                 .attr('stroke', '#4ca54c')
                 .attr('stroke-width', 2)
                 .attr('fill', 'none')
                 .attr('style', "color:green")
                 .transition().delay(0).duration(2000)
                 .style("opacity", 1);

             final_bill.append("path")
                 .style("opacity", 0)
                 .attr('d', dhs_line_gen(data_dhs))
                 .attr('stroke', 'steelblue')
                 .attr('stroke-width', 2)
                 .attr('fill', 'none')
                 .transition().delay(500).duration(2000)
                 .style("opacity", 1);

             final_bill.append("path")
                 .style("opacity", 0)
                 .attr('d', articles_line_gen(data_dhs))
                 .attr('stroke', '#ff6666')
                 .attr('stroke-width', 2)
                 .attr('fill', 'none')
                 .transition().delay(1000).duration(2000)
                 .style("opacity", 1);

             var mark = {'width': 20, 'height': 40};

             var marker_bill = final_bill.append('g')
                 .attr("class", "marker")
                 .attr("transform", "translate(" + (x(1997) - mark.width/2) + "," + mark.height + ")");

             marker_bill.append('rect')
                 .attr('width', mark.width)
                 .attr('height', mark.height)
                 .attr('fill', 'grey')
                 .style('opacity', 0)
                 .transition().delay(1500).duration(1000)
                 .style('opacity', 1);


             marker_bill.append("text")
                 .attr("x", mark.width/2)
                 .attr("y", mark.height/2)
                 .text("1997")
                 .attr("transform", "rotate(-90, " + mark.width/2 + "," + mark.height/2 + ")")
                 .attr("dy", mark.width/4)
                 .style('opacity', 0)
                 .style("text-anchor", "middle")
                 .transition().delay(1500).duration(1000)
                 .style('opacity', 1);

             marker_bill.append("polygon")
                 .attr("points", "" + 0 + "," + mark.height + " " + mark.width + "," + mark.height + " " + mark.width/2 + "," + (mark.width + mark.height) + "")
                 .attr("fill", "gray")
                 .style('opacity', 0)
                 .transition().delay(1500).duration(1000)
                 .style('opacity', 1);

             marker_bill.append("line")
                 .attr("x1", mark.width/2)
                 .attr("x2", mark.width/2)
                 .attr("y1", mark.height + mark.width)
                 .attr("y2", height - mark.height)
                 .style("stroke", "grey")
                 .style('opacity', 0)
                 .transition().delay(1500).duration(1000)
                 .style('opacity', 1);

         });


/** ------- DONE WITH BILLS ------- **/
        /**
         * VIZ 9 - cluster_bubbles
         * class: cluster_bubbles
         */
        var cluster_bubbles_articles = g.append("svg")
          .attr("class", "cluster_bubbles_articles")

        cluster_bubbles_articles.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxisBar);
        cluster_bubbles_articles.select(".x.axis").style("opacity", 0);

        cluster_bubbles_articles.append("svg:image")
          .attr("class", "cluster_bubbles_articles")
          .attr("xlink:href", "img/articles_1_bubbles.png")
          .attr("x", 0)
          .attr("y", -height*0.001)
          .attr("height", height)
          .attr("width", width)

        cluster_bubbles_articles.append("svg:image")
          .attr("class", "cluster_bubbles_articles")
          .attr("xlink:href", "img/articles_2_bubbles.png")
          .attr("x", 0)
          .attr("y", -height*0.43)
          .attr("height", height)
          .attr("width", width)

        cluster_bubbles_articles.selectAll(".cluster_bubbles_articles")
          .attr("opacity", 0);


          /**
          VIZ 10 - multi graph articles
          class: multi_grap_articles
          */

          var multi_grap_articles = g.append("svg")
            .attr("class", "multi_grap_articles")

          d3.csv("data/multi_graph.csv", function(error, data) {
            var x0 = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);
            var x1 = d3.scale.ordinal();
            var y = d3.scale.linear()
                .range([height, 0]);
            var color = d3.scale.category10();

            if (error) throw error;
            var ageNames = d3.keys(data[0]).filter(function(key) { return key !== "State"; });
            data.forEach(function(d) {
              d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
            });
            x0.domain(data.map(function(d) { return d.State; }));
            x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
            y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

            multi_grap_articles.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
            multi_grap_articles.append("g")
                .attr("class", "y axis")
                .call(yAxis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Number of Articles");
            var state = multi_grap_articles.selectAll(".state")
                .data(data)
              .enter().append("g")
                .attr("class", "state")
                .attr("transform", function(d) { return "translate(" + x0(d.State) + ",0)"; });
            state.selectAll("rect")
                .data(function(d) { return d.ages; })
              .enter().append("rect")
                .attr("width", x1.rangeBand())
                .attr("x", function(d) { return x1(d.name); })
                .attr("y", function(d) { return y(d.value); })
                .attr("height", function(d) { return height - y(d.value); })
                .style("fill", function(d) { return color(d.name); });

            var legend = multi_grap_articles.selectAll(".legend")
                .data(ageNames.slice().reverse())
              .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
            legend.append("rect")
                .attr("x", width)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);
            legend.append("text")
                .attr("x", width - 1)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .style("font-size","15px")
                .text(function(d) { return d; });
          });

          /** VIZ 11 - bar graph articles
          class: bar_articles_graph
          bar_articles_importance.jpg
          */

          var bar_articles_graph = g.append("svg")
            .attr("class", "bar_articles_graph")

          bar_articles_graph.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxisBar);
          bar_articles_graph.select(".x.axis").style("opacity", 0);

          bar_articles_graph.append("svg:image")
            .attr("class", "bar_articles_graph")
            .attr("xlink:href", "img/bar_articles_importance.jpg")
            .attr("x", 0)
            .attr("y", -height*0.1)
            .attr("height", height)
            .attr("width", width)

          bar_articles_graph.selectAll(".bar_articles_graph")
            .attr("opacity", 0);

          /** VIZ 13 - line graph articles
          class: line_graph_articles
          */

          var line_graph_articles = g.append("svg")
            .attr("class", "line_graph_articles")

          line_graph_articles.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxisBar);
          line_graph_articles.select(".x.axis").style("opacity", 0);

          line_graph_articles.append("svg:image")
            .attr("class", "line_graph_articles")
            .attr("xlink:href", "img/kosovo.png")
            .attr("x", 0)
            .attr("y", -height*0.1)
            .attr("height", height)
            .attr("width", width)

          line_graph_articles.selectAll(".line_graph_articles")
            .attr("opacity", 0);


            /** VIZ 14 - Kosovo Word Cloud
            class: word_cloud_cluster
            */

            var word_cloud_cluster = g.append("svg")
              .attr("class", "word_cloud_cluster")

            word_cloud_cluster.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxisBar);
            word_cloud_cluster.select(".x.axis").style("opacity", 0);

            word_cloud_cluster.append("svg:image")
              .attr("class", "word_cloud_cluster")
              .attr("xlink:href", "img/kosovo_word_cluster.png")
              .attr("x", 0)
              .attr("y", -height*0.1)
              .attr("height", height)
              .attr("width", width)

            word_cloud_cluster.selectAll(".word_cloud_cluster")
              .attr("opacity", 0);

              /**
               * VIZ 15 - naturalization statistics graph
               * class: nat_stats
               */

               var nat_stats = g.append("svg")
                .attr("class", "nat_stats")

              d3.csv("data/nat_data.csv", function(error, data) {

                console.log(data);
                // Scale the range of the data
                var years = new Set(),
                    counts = new Set();

                for (var i=0; i < data.length; i++) {
                  years.add(data[i]["Year"]);
                  counts.add(data[i]["Petitions filed"]);
                  counts.add(data[i]["Total naturalized"]);
                  counts.add(data[i]["Petitions denied"]);
                };

                years = Array.from(years);
                counts = Array.from(counts);

                // years_int = [];
                counts_int = [];

                counts.forEach(function(value){counts_int.push(parseInt(value))})
                // years.forEach(function(value){years_int.push(parseInt(value))})

                var min_year = d3.min(years),
                   max_year = d3.max(years),
                   min_count = d3.min(counts_int),
                   max_count = d3.max(counts_int);

                var x = d3.scale.linear()
                  .domain([min_year, max_year])
                  .range([margin.left, width]);

                var y = d3.scale.linear()
                  .domain([min_count, max_count])
                  .range([height - margin.bottom, margin.top]);

                var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .tickFormat(d3.format("g"));

                var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient("left");

                var petitionLine = d3.svg.line()
                  .x(function(d) { return x(d["Year"]); })
                  .y(function(d) { return y(d["Petitions filed"]); });

                var natLine = d3.svg.line()
                  .x(function(d) { return x(d["Year"]); })
                  .y(function(d) { return y(d["Total naturalized"]); });

                var deniedLine = d3.svg.line()
                  .x(function(d) { return x(d["Year"]); })
                  .y(function(d) { return y(d["Petitions denied"]); });

              // Add the valueline path.
              nat_stats.append("path")
                  .attr("class", "nat_stats")
                  .attr("stroke", "#f39d41")
                  .attr("fill", "none")
                  .attr("d", petitionLine(data));

              nat_stats.append("path")
                  .attr("class", "nat_stats")
                  .attr("stroke", "steelblue")
                  .attr("fill", "none")
                  .attr("d", natLine(data));

              nat_stats.append("path")
                  .attr("class", "nat_stats")
                  .attr("stroke", "#e04836")
                  .attr("fill", "none")
                  .attr("d", deniedLine(data));

              // // Add the scatterplot
              // general_1.selectAll("dot")
              //     .data(data)
              //   .enter().append("circle")
              //     .attr("fill", "#a1a1a1")
              //     .attr("r", 3.5)
              //     .attr("cx", function(d) { return x(d["Year"]); })
              //     .attr("cy", function(d) { return y(d["Number"]); });

              // Add the X Axis
              nat_stats.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(10," + height + ")")
                  .call(xAxis)
                  .style("fill", "#D9D9D9")
                .append("text")
                  .attr("transform", "translate(" + width/2 + ",35)")
                  .attr("text-anchor", "middle")
                  .text("Year");

              // Add the Y Axis
              nat_stats.append("g")
                  .attr("class", "y axis")
                  .attr("transform", "translate(50, 0)")
                  .call(yAxis)
                  .style("fill", "#D9D9D9")
                  .style("opacity", 1)
                .append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("x", -180)
                  .attr("y", -50)
                  .attr("dy", ".71em")
                  .style("text-anchor", "end")
                  .text("Number Immigrants (in thousands)");

              nat_stats.append("text")
                .attr("x", width/2)
                .attr("y", 15)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .style("fill", "#D9D9D9")
                .text("Immigrants Per Year Since 1820");


              word_cloud_cluster.selectAll(".nat_stats")
                .attr("opacity", 0);

              }
            );

              /**
               * VIZ 18 - final article graph
               * class: final_article
               */

               var final_article = g.append("svg")
                 .attr("class", "final_article")


               d3.csv("data/overall_distribution.csv", function(error, data_dhs) {
                 // Scale the range of the data
                 var years = new Set(),
                     article_counts = new Set(),
                     bill_counts = new Set(),
                     dhs_counts = new Set();

                 for (var i=0; i < data_dhs.length; i++) {
                   years.add(data_dhs[i]["Year"]);
                   dhs_counts.add(data_dhs[i]["Number_DHS"]);
                   article_counts.add(data_dhs[i]["Number_Articles"]);
                   bill_counts.add(data_dhs[i]["Number_Bills"]);
                 }

                   years = Array.from(years);
                   article_counts = Array.from(article_counts);
                   bill_counts = Array.from(bill_counts);
                   dhs_counts = Array.from(dhs_counts);

                   bill_counts_int = [];
                   article_counts_int = [];
                   dhs_counts_int = [];

                   bill_counts.forEach(function(value){bill_counts_int.push(parseInt(value))})
                   dhs_counts.forEach(function(value){dhs_counts_int.push(parseInt(value))})
                   article_counts.forEach(function(value){article_counts_int.push(parseInt(value))})

                   var min_year = d3.min(years),
                       max_year = d3.max(years),
                       bill_min = d3.min(bill_counts_int),
                       bill_max = d3.max(bill_counts_int),
                       dhs_min = d3.min(dhs_counts_int),
                       dhs_max = d3.max(dhs_counts_int),
                       article_min = d3.min(article_counts_int),
                       article_max = d3.max(article_counts_int);

                   var x = d3.scale.linear()
                       .domain([min_year, max_year])
                       .range([margin.left*4, width - 4*margin.right]);

                   var bill_y = d3.scale.linear()
                       .domain([bill_min, bill_max])
                       .range([height - margin.bottom, margin.top]);

                   var dhs_y = d3.scale.linear()
                       .domain([dhs_min, dhs_max])
                       .range([height - margin.bottom, margin.top]);

                   var article_y = d3.scale.linear()
                       .domain([article_min, article_max])
                       .range([height - margin.bottom, margin.top]);

                   var xAxis = d3.svg.axis()
                       .scale(x)
                       .orient("bottom")
                       .tickFormat(d3.format("g"));

                   var bill_yAxis = d3.svg.axis()
                       .scale(bill_y)
                       .orient("left");

                   var dhs_yAxis = d3.svg.axis()
                       .scale(dhs_y)
                       .orient("right");

                   var article_yAxis = d3.svg.axis()
                       .scale(article_y)
                       .orient("right");

                   final_article.append("g")
                      .attr("class", "axis")
                      .attr("transform", "translate(0," + height + ")")
                      .call(xAxis)
                      .append("text")
                        .attr("transform", "translate(" + width/2 + ",38)")
                        .attr("text-anchor", "middle")
                        .text("Year");

                   final_article.append("g")
                      .attr("class", "axis")
                      .attr("transform", "translate(" + width + ",0)")
                      .call(bill_yAxis)
                      .attr("stroke", "green");

                   final_article.append("g")
                      .attr("class", "axis")
                      .attr("transform", "translate(" + margin.left + ",0)")
                      .call(dhs_yAxis)
                      .attr("stroke", "steelblue");

                   final_article.append("g")
                      .attr("class", "axis")
                      .attr("transform", "translate(" + margin.left*3 + ",0)")
                      .call(article_yAxis)
                      .attr("stroke", "#ff6666");


                   var bill_line_gen = d3.svg.line()
                       .x(function(d) { return x(d["Year"]); })
                       .y(function(d) { return bill_y(d["Number_Bills"]);})
                       .interpolate("linear");

                   var dhs_line_gen = d3.svg.line()
                       .x(function(d) { return x(d["Year"]); })
                       .y(function(d) { return dhs_y(d["Number_DHS"]); })
                       .interpolate("linear");

                   var articles_line_gen = d3.svg.line()
                       .x(function(d) { return x(d["Year"]); })
                       .y(function(d) { return article_y(d["Number_Articles"]); })
                       .interpolate("linear");

                   final_article.append("path")
                       .style("opacity", 0)
                       .attr('d', bill_line_gen(data_dhs))
                       .attr('stroke', '#4ca54c')
                       .attr('stroke-width', 2)
                       .attr('fill', 'none')
                       .attr('style', "color:green")
                       .transition().delay(0).duration(2000)
                       .style("opacity", 1);

                   final_article.append("path")
                       .style("opacity", 0)
                       .attr('d', dhs_line_gen(data_dhs))
                       .attr('stroke', 'steelblue')
                       .attr('stroke-width', 2)
                       .attr('fill', 'none')
                       .transition().delay(500).duration(2000)
                       .style("opacity", 1);

                   final_article.append("path")
                       .style("opacity", 0)
                       .attr('d', articles_line_gen(data_dhs))
                       .attr('stroke', '#ff6666')
                       .attr('stroke-width', 2)
                       .attr('fill', 'none')
                       .transition().delay(1000).duration(2000)
                       .style("opacity", 1);

                   var mark = {'width': 20, 'height': 40};

                   var marker_bill = final_article.append('g')
                       .attr("class", "marker")
                       .attr("transform", "translate(" + (x(1997) - mark.width/2) + "," + mark.height + ")");

                    var marker_article = final_article.append('g')
                        .attr("class", "marker")
                        .attr("transform", "translate(" + (x(1999) - mark.width/2) + "," + mark.height + ")");

                   marker_bill.append('rect')
                       .attr('width', mark.width)
                       .attr('height', mark.height)
                       .attr('fill', 'grey')
                       .style('opacity', 0)
                       .transition().delay(1500).duration(1000)
                       .style('opacity', 1);

                   marker_article.append('rect')
                       .attr('width', mark.width)
                       .attr('height', mark.height)
                       .attr('fill', 'grey')
                       .style('opacity', 0)
                       .transition().delay(1500).duration(1000)
                       .style('opacity', 1);

                   marker_bill.append("text")
                       .attr("x", mark.width/2)
                       .attr("y", mark.height/2)
                       .text("1997")
                       .attr("transform", "rotate(-90, " + mark.width/2 + "," + mark.height/2 + ")")
                       .attr("dy", mark.width/4)
                       .style('opacity', 0)
                       .style("text-anchor", "middle")
                       .transition().delay(1500).duration(1000)
                       .style('opacity', 1);

                   marker_article.append("text")
                       .attr("x", mark.width/2)
                       .attr("y", mark.height/2)
                       .text("1997")
                       .attr("transform", "rotate(-90, " + mark.width/2 + "," + mark.height/2 + ")")
                       .attr("dy", mark.width/4)
                       .style('opacity', 0)
                       .style("text-anchor", "middle")
                       .transition().delay(1500).duration(1000)
                       .style('opacity', 1);

                   marker_bill.append("polygon")
                       .attr("points", "" + 0 + "," + mark.height + " " + mark.width + "," + mark.height + " " + mark.width/2 + "," + (mark.width + mark.height) + "")
                       .attr("fill", "gray")
                       .style('opacity', 0)
                       .transition().delay(1500).duration(1000)
                       .style('opacity', 1);

                    marker_article.append("polygon")
                         .attr("points", "" + 0 + "," + mark.height + " " + mark.width + "," + mark.height + " " + mark.width/2 + "," + (mark.width + mark.height) + "")
                         .attr("fill", "gray")
                         .style('opacity', 0)
                         .transition().delay(1500).duration(1000)
                         .style('opacity', 1);

                   marker_bill.append("line")
                       .attr("x1", mark.width/2)
                       .attr("x2", mark.width/2)
                       .attr("y1", mark.height + mark.width)
                       .attr("y2", height - mark.height)
                       .style("stroke", "grey")
                       .style('opacity', 0)
                       .transition().delay(1500).duration(1000)
                       .style('opacity', 1);


                   marker_article.append("line")
                       .attr("x1", mark.width/2)
                       .attr("x2", mark.width/2)
                       .attr("y1", mark.height + mark.width)
                       .attr("y2", height - mark.height)
                       .style("stroke", "grey")
                       .style('opacity', 0)
                       .transition().delay(1500).duration(1000)
                       .style('opacity', 1);

                final_article.style("opacity", 0);
               });
    // DOTS ON YEARS
    // var svg_dots = g.append("svg")
    //   .attr("class", "dots")

    // svg.call(tip);

    // svg_dots.append("g")
    //   .attr("class", "axis")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(xAxis);

    // svg_dots.append("g")
    //   .attr("class", "axis")
    //   .call(yAxis);

    // svg_dots.selectAll("circle")
    //   .data(data)
    //   .enter().append("circle")
    //   .attr("cx", function(d) {return x_nur(d.year);})
    //   .attr("cy", height/2)
    //   .attr("r", function(d) {return radScale(d.count);})
    //   .on("mouseover", tip.show)
    //   .on("mouseout", tip.hide)
    //   .attr("class", function(d) {
    //     var returnClass;
    //     if (d.type==="bill") {returnClass="b circle";}
    //     else if (d.type==="article") {returnClass="a circle";}
    //     return returnClass;
    //   })
    //   .transition()
    //   .delay(250)
    //   .duration(2000)
    //   .attr("cy", function(d) {return y_nur(d.word);});




    g.selectAll(".bills_bubbles")
      .style("opacity", 0);

    g.selectAll(".hist")
      .style("opacity", 0);

    g.selectAll(".dots")
      .style("opacity", 0);

    g.selectAll(".general_1")
      .style("opacity", 0);

    g.selectAll(".voting")
      .style("opacity", 0);

    g.selectAll(".cluster_bubbles_articles")
      .style("opacity", 0);

    g.selectAll(".multi_grap_articles")
      .style("opacity", 0);

    g.selectAll(".bar_articles_graph")
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
    activateFunctions[0] = showMain;
    activateFunctions[1] = showGeneral;
    activateFunctions[2] = showGeneral_2;
    activateFunctions[3] = startBills;
    activateFunctions[4] = generalBills;
    activateFunctions[5] = showTopSubjects;
    activateFunctions[6] = showVoting;
    activateFunctions[7] = finalVoting;
    activateFunctions[8] = articlesCluster;
    activateFunctions[9] = articlesClusterBar;
    // activateFunctions[10] = articlesPieChart;
    activateFunctions[10] = articlesBArChart;
    activateFunctions[11] = articlesKosovoLineChart;
    activateFunctions[12] = articlesKosovoWordCloud;
    activateFunctions[13] = dhsNaturalization;
    // activateFunctions[14] = dhsSummary;
    // activateFunctions[15] = dhsApprehended;
    // activateFunctions[16] = historyLesson;
    activateFunctions[14] = finalArticle;

    for(var i = 0; i < 15; i++) {
      updateFunctions[i] = function() {};
    }
  };

  function showMain() {
    g.selectAll(".general_1")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".general_2")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".general_1_zoomed")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".home_media")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);

    loadVid()

    g.selectAll(".bills_bubbles")
      .transition()
      .duration(600)
      .attr("opacity", 0.0);

    g.selectAll(".top_subjects")
      .transition()
      .duration(600)
      .attr("opacity", 0.0);

    g.selectAll(".final_bill")
      .transition()
      .duration(600)
      .attr("opacity", 0.0);

    g.selectAll(".nat_stats")
      .transition()
      .duration(600)
      .attr("opacity", 0.0);

    g.selectAll(".final_article")
      .transition()
      .duration(600)
      .attr("opacity", 0.0);
  }


  /**
   * showGeneral - square grid
   *
   * hides: filler count title
   * hides: filler highlight in grid
   * shows: square grid
   *
   */
  function showGeneral() {
    g.selectAll(".home_media")
      .transition()
      .duration(600)
      .attr("opacity", 0.0);

    g.selectAll("foreignObject").remove()

    g.selectAll(".general_1")
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.selectAll(".general_2")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".bills_bubbles")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".final_bill")
      .transition()
      .duration(600)
      .style("opacity", 0);
  }

  /**
   * showGeneral_2 - show fillers in grid
   *
   * hides: barchart, text and axis
   * shows: square grid and highlighted
   *  incriminated. also ensures squares
   *  are moved back to their place in the grid
   */
  function showGeneral_2() {
    hideAxis();

    g.selectAll(".general_1")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".general_2")
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.selectAll(".general_1_zoomed")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".final_bill")
      .transition()
      .duration(600)
      .style("opacity", 0);
  }

  /**
   * startBills - zoomed in time series
   *
   * hides: square grid
   * hides: histogram
   * shows: zoomed in time series
   *
   */
  function startBills() {
    g.selectAll(".general_1_zoomed")
      .transition()
      .duration(0)
      .style("opacity", 1);

    g.selectAll(".general_2")
      .transition()
      .duration(0)
      .style("opacity", 0);

    g.selectAll(".bills_bubbles")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".final_bill")
      .transition()
      .duration(600)
      .style("opacity", 0);
  }

  /**
   * generalBills - shows the first part
   *  of the histogram of incriminated
   *
   * hides: barchart
   * hides: last half of histogram
   * shows: first half of histogram
   *
   */
  function generalBills() {
    hideAxis();

    g.selectAll(".general_1_zoomed")
      .transition()
      .duration(0)
      .style("opacity", 0);

    g.selectAll(".bills_bubbles")
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.selectAll(".top_subjects")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".final_bill")
      .transition()
      .duration(600)
      .style("opacity", 0);
  }

  /**
   * showTopSubjects - show top subjects histogram
   *
   * hides: cough title and color
   * (previous step is also part of the
   *  histogram, so we don't have to hide
   *  that)
   * shows: all histogram bars
   *
   */
  function showTopSubjects() {
    // ensure the axis to histogram one
    hideAxis();

    g.selectAll(".bills_bubbles")
      .transition()
      .duration(600)
      .style("opacity", 0);


    g.selectAll(".top_subjects")
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.selectAll(".voting")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".final_bill")
      .transition()
      .duration(600)
      .style("opacity", 0);

  }

  /**
   * showVoting
   *
   * hides: nothing
   * (previous and next sections are histograms
   *  so we don't have to hide much here)
   * shows: histogram
   *
   */
  function showVoting() {
    // ensure the axis to histogram one
    hideAxis();

    g.selectAll(".top_subjects")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".general_1")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".voting")
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.selectAll(".final_bill")
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
  function finalVoting(progress) {
    g.selectAll(".general_1")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".voting")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".final_bill")
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.selectAll(".cluster_bubbles_articles")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".multi_grap_articles")
      .transition()
      .duration(600)
      .style("opacity", 0);
  }

  function articlesCluster(progress){
    g.selectAll(".final_bill")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".cluster_bubbles_articles")
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.selectAll(".multi_grap_articles")
      .transition()
      .duration(600)
      .style("opacity", 0);
  }

  function articlesClusterBar(progress){
    g.selectAll(".final_bill")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".cluster_bubbles_articles")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".bar_articles_graph")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".multi_grap_articles")
      .transition()
      .duration(600)
      .style("opacity", 1);
  }




  function articlesBArChart(progress){
    g.selectAll(".bar_articles_graph")
      .transition()
      .duration(600)
      .style("opacity", 1);
    g.selectAll(".line_graph_articles")
      .transition()
      .duration(600)
      .style("opacity", 0);
    g.selectAll(".multi_grap_articles")
      .transition()
      .duration(600)
      .style("opacity", 0);

  }

  function articlesKosovoLineChart(progress){
    g.selectAll(".bar_articles_graph")
      .transition()
      .duration(600)
      .style("opacity", 0);


    g.selectAll(".line_graph_articles")
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.selectAll(".word_cloud_cluster")
      .transition()
      .duration(600)
      .style("opacity", 0);
  }


  function articlesKosovoWordCloud(progress){
    g.selectAll(".line_graph_articles")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".word_cloud_cluster")
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.selectAll(".nat_stats")
      .transition()
      .duration(600)
      .style("opacity", 0);
  }

  function dhsNaturalization(progress) {
    g.selectAll(".word_cloud_cluster")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".nat_stats")
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.selectAll(".final_article")
      .transition()
      .duration(600)
      .style("opacity", 0);
  }

  function dhsSummary(progress) {


  }

  function dhsApprehended(progress) {

  }

  function historyLesson(progress) {
    g.selectAll(".final_article")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".history")
      .transition()
      .duration(600)
      .style("opacity", 0);


  }




  function finalArticle(progress){


    g.selectAll(".history")
      .transition()
      .duration(600)
      .style("opacity", 0);

    g.selectAll(".final_article")
      .transition()
      .duration(600)
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
d3.csv("data/unique_immigration_104_107.csv", display);
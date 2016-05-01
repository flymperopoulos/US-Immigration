var margin = {top: 20, right: 20, bottom: 30, left: 80},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

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

var x = d3.scale.ordinal()
  .domain(years)
  .rangePoints([0 + sep, width-sep]);

var y = d3.scale.ordinal()
  .domain(words)
  .rangePoints([height - sep, 0 + sep])

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
.scale(y)
.orient("left");

// var tip = d3.tip()
//   .attr('class', 'd3-tip')
//   .offset([-10, 0])
//   // .html(function(d) {return "<strong>Mentions:</strong> <span style='color:#813386'>" + d.count + "</span>";});
//   .html(function(d) {return "<span style='color:#813386'>" + d.count + "</span>   <strong>Mentions</strong>";});

var svg = d3.select("div#viz").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// svg.call(tip);

svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "axis")
  .call(yAxis);

svg.selectAll("circle")
  .data(data)
  .enter().append("circle")
  .attr("cx", function(d) {return x(d.year);})
  .attr("cy", height/2)
  .attr("r", function(d) {return radScale(d.count);})
  // .on("mouseover", tip.show)
  // .on("mouseout", tip.hide)
  .attr("class", function(d) {
    var returnClass;
    if (d.type==="bill") {returnClass="b circle";}
    else if (d.type==="article") {returnClass="a circle";}
    return returnClass;
  })
  .transition()
  .delay(250)
  .duration(2000)
  .attr("cy", function(d) {return y(d.word);});
'use strict';

angular.module('myApp')

.directive('barChart', ['$window', '$state', 'DateService', function ($window, $state, DateService) {
  return {
    restrict: 'E',
    templateUrl: 'directives/barChart/barChart.html',
    link: function(scope) {
      var d3 = $window.d3;

      function colourLuminance(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
          hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
          c = parseInt(hex.substr(i*2,2), 16);
          c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
          rgb += ("00"+c).substr(c.length);
        }

        return rgb;
      }

      var categories = ['Overdue', '6 months', '12 months', '18 months', '24 months'];

      var max = Math.max(...scope.assets);
      max = Math.ceil(max / 10) * 10;

      var rect = angular.element(document.getElementById('eol-dashboard'))[0].getBoundingClientRect();
      var canvasWidth = rect.right - rect.left - 50;
      var canvasHeight = rect.bottom - rect.top;
      canvasHeight = (canvasHeight > 550) ? 550 : canvasHeight;

      var canvas = d3.select('#eol-graph')
          .append('svg')
          .attr({'width': canvasWidth,'height': canvasHeight});

      var margin = {top: 20, right: 20, bottom: 70, left: 100};
      var width = canvasWidth - margin.left - margin.right;
      var height = canvasHeight - margin.top - margin.bottom;

      var colors = ['#dc3912','#ff9900','#fdae6b','#ebcd30','#98df8a'];

      var xscale = d3.scale.linear()
          .domain([0, max])
          .range([0, width]);

      var yscale = d3.scale.linear()
          .domain([0, categories.length])
          .range([0, height]);

      var colorScale = d3.scale.quantize()
          .domain([0, categories.length])
          .range(colors);

      var xAxis = d3.svg.axis()
          .orient('bottom')
          .tickValues([])
          .scale(xscale);

      var yAxis = d3.svg.axis()
          .orient('left')
          .scale(yscale)
          .tickValues(d3.range(categories.length))
          .tickFormat(function(d, i) {
            return categories[i];
          });

      canvas.append('g')
          .attr("transform", "translate(" + margin.left + ", " + (height + margin.top) + ")")
          .attr('id', 'xaxis')
          .call(xAxis);

      canvas.append('g')
          .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
          .attr('id', 'yaxis')
          .call(yAxis)
        .selectAll(".tick text")
          .attr("y", 45);

      canvas.append('g')
          .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
          .attr('id','bars')
          .selectAll('rect')
          .data(scope.assets)
        .enter().append('rect')
          .attr('height', 70)
          .attr({
            'x': 0,
            'y': function(d, i) { return yscale(i) + 10; }
          })
          .style('fill', function(d, i) { return colorScale(i); })
          .attr('width', function() { return 0; })
          .on("click", function(d, i) {
            if (i === 0) {
              DateService.setEndDate(Date.now());
            } else {
              DateService.setStartDate(Date.now());
              if (i === 1) {
                DateService.setEndDate(scope.sixMonths);
              } else if (i === 2) {
                DateService.setEndDate(scope.twelveMonths);
              } else if (i === 3) {
                DateService.setEndDate(scope.eighteenMonths);
              } else if (i === 4) {
                DateService.setEndDate(scope.twentyfourMonths);
              }
            }
            $state.go('home.table');
          })
          .on('mouseover', function(d, i) {
            d3.select(this).style("fill", colourLuminance(colorScale(i), 0.2));
          })
          .on('mouseout', function(d, i) {
            d3.select(this).style("fill", colorScale(i));
          });

      d3.select("svg").selectAll("rect")
          .data(scope.assets)
          .transition()
          .duration(1000)
          .attr("width", function(d) {
            return xscale(d);
          });
    }
  };
}]);

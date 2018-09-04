const express = require('express');
const path = require('path');
const UglifyJS = require('uglify-js');
const SourceMap = require('source-map');
const morgan = require('morgan');

const { PORT = 3000 } = process.env;
const app = express();

app.use(morgan('common'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/encode', (req, res) => {
  const result = UglifyJS.minify({
    "source.js": req.body.source
  }, {
    sourceMap: {
      filename: "source.js",
      url: "out.js.map"
    }
  });

  res.json({
    code: result.code,
    map: JSON.stringify(JSON.parse(result.map), null, 2)
  });
});

app.post('/cursor', (req, res) => {
  const result = UglifyJS.minify({
    "source.js": req.body.source
  }, {
    sourceMap: {
      filename: "source.js",
      url: "out.js.map"
    }
  });

  SourceMap.SourceMapConsumer.with(result.map, null, consumer => {
    const result = [];
    req.body.ranges.forEach(range => {
      result.push(consumer.originalPositionFor({
        line: range.anchor.line + 1,
        column: range.anchor.ch
      }))
      result.push(consumer.originalPositionFor({
        line: range.head.line + 1,
        column: range.head.ch
      }))
    });

    res.json(result);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`listening on ${PORT}`);
});
const express = require('express');
const path = require('path');
const UglifyJS = require('uglify-js');
const SourceMap = require('source-map');
const morgan = require('morgan');
const session = require('express-session');

const { PORT = 3000 } = process.env;
const app = express();

app.set('view engine', 'ejs');
app.use(morgan('common'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(session({
  secret: 'source map demo app',
  resave: true,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/encode', (req, res) => {
  const result = UglifyJS.minify({
    "source.js": req.body.source
  }, {
    output: {
      beautify: false
    },
    sourceMap: {
      filename: "output.min.js",
      url: "output.min.js.map"
    }
  });

  req.session.code = result.code;
  req.session.source = req.body.source;
  req.session.map = result.map;

  res.json({
    code: result.code,
    map: JSON.stringify(JSON.parse(result.map), null, 2)
  });
});

app.get('/output.html', (req, res) => {
  res.render('output', {
    code: req.session.code
  })
});

app.get('/output.js', (req, res) => {
  res.end(req.session.sou);
});

app.get('/source.js', (req, res) => {
  res.end(req.session.source);
});

app.get('/output.min.js', (req, res) => {
  res.header('content-type', 'application/javascript');
  res.end(req.session.code);
});

app.get('/output.min.js.map', (req, res) => {
  res.end(req.session.map);
});

app.post('/cursor', (req, res) => {
  const source = req.body.source;

  // 压缩代码并生成 sourcemap 文件
  const result = UglifyJS.minify({
    "output.js": source
  }, {
    sourceMap: {
      filename: "output.min.js",
      url: "output.min.js.map"
    }
  });

  // 从 sourcemap 里解析出对应的行、列、names
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
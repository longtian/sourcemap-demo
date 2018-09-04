# Source Map Demo

- 在 Source 里编辑源代码
- Source 里的代码会被压缩到 Output 里
- 压缩过程中的 SourceMap 会被生成到 SourceMap 里
- 在 Output 中可以选中对应的代码

## 后端代码

```js
  const source = req.body.source;

  // 压缩代码并生成 sourcemap 文件
  const result = UglifyJS.minify({
    "source.js": source
  }, {
    sourceMap: {
      filename: "source.js",
      url: "out.js.map"
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
```

## 前端代码

```js
$.ajax({
  url: './cursor',
  contentType: 'application/json',
  dataType: 'JSON',
  method: 'POST',
  data: JSON.stringify({
    source: sourceEditor.getValue(),
    ranges: changes.ranges
  }),
  success: function (res) {

    if (res[0].line === res[1].line && res[0].ch === res[1].ch) {
      sourceEditor.setSelection({
        line: res[0].line - 1,
        ch: res[0].column
      }, {
        line: res[0].line - 1,
        ch: res[0].column + res[0].name.length
      })
    } else {

      sourceEditor.setSelection({
        line: res[0].line - 1,
        ch: res[0].column
      }, {
        line: res[1].line - 1,
        ch: res[1].column
      })
    }

  }
})
```
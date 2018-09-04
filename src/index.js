var SourceMap = require('source-map/dist/source-map');


  var sourceEditor = window.s = CodeMirror.fromTextArea($('#in').get(0), {
    lineNumbers: true
  });
  var mapEditor = CodeMirror.fromTextArea($('#map').get(0), {
    lineNumbers: true
  });
  var outEditor = CodeMirror.fromTextArea($('#out').get(0), {
    lineNumbers: true
  });

  // outEditor.on('cursorActivity', function (e) {
  //   var cursor = outEditor.getCursor();
  //   $.ajax({
  //     url: './cursor',
  //     contentType: 'application/json',
  //     dataType: 'JSON',
  //     method: 'POST',
  //     data: JSON.stringify({
  //       source: sourceEditor.getValue(),
  //       ranges: [{
  //         line: cursor.line + 1,
  //         column: cursor.ch
  //       }]
  //     }),
  //     success: function (res) {
  //       sourceEditor.setSelection({
  //         line: res.line - 1,
  //         ch: res.column
  //       }, {
  //         line: res.line - 1,
  //         ch: res.column + 1
  //       })
  //     }
  //   })
  // });

  outEditor.on('beforeSelectionChange', function (c, changes) {

    if (!changes.origin) {
      return
    }

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

        console.log(res);

        sourceEditor.setSelection({
          line: res[0].line - 1,
          ch: res[0].column
        }, {
          line: res[1].line - 1,
          ch: res[1].column
        })
      }
    })
  })

  function parse () {
    $.ajax({
      url: './encode',
      contentType: 'application/json',
      dataType: 'JSON',
      method: 'POST',
      data: JSON.stringify({
        source: sourceEditor.getValue()
      }),
      success: function (res) {
        mapEditor.setValue(res.map);
        outEditor.setValue(res.code);
      }
    })
  }

  sourceEditor.on('change', parse);
  parse();

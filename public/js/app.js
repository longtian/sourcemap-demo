$(function () {
  var sourceEditor = window.s = CodeMirror.fromTextArea($('#in').get(0), {
    lineNumbers: true
  });
  var mapEditor = CodeMirror.fromTextArea($('#map').get(0), {
    lineNumbers: true
  });
  var outEditor = CodeMirror.fromTextArea($('#out').get(0), {
    lineNumbers: true,
    lineWrapping: true
  });

  outEditor.setSize('auto', '100px');

  outEditor.on('beforeSelectionChange', function (c, changes) {
    if (!changes.origin) {
      return
    }

    $("#cursor").text(JSON.stringify(changes.ranges));

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
  });

  function parse () {
    // $("#errorDetail").empty();
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
        $("#iframe").attr('src', './output.html?_=' + Date.now())
      }
    })
  }

  sourceEditor.on('change', parse);

  $("#demo").change(function () {
    $.ajax({
      url: $(this).val(),
      dataType: 'text',
      success: function (res) {
        console.info(res);
        sourceEditor.setValue(res);
        parse();
      }
    })
  }).trigger('change');

  window.addEventListener('message', function (msg) {
    if (msg.data && msg.data.type === 'errorCaughtInIframe') {
      $("#errorDetail").text(JSON.stringify(msg.data.payload, null, 2))
    }
  })
});
$(function () {

  var sourceEditor = window.s = CodeMirror.fromTextArea(document.getElementById('in'), {
    lineNumbers: true
  });

  var mapEditor = CodeMirror.fromTextArea(document.getElementById('map'), {
    lineNumbers: true,
    readOnly: true
  });

  var outEditor = CodeMirror.fromTextArea(document.getElementById('out'), {
    lineNumbers: true,
    lineWrapping: true,
    readOnly: true
  });

  outEditor.setSize('auto', '100px');

  outEditor.on('blur', function () {
    $("#cursor").empty();
  });

  outEditor.on('beforeSelectionChange', function (c, changes) {
    if (!changes.origin) {
      return
    }
    var anchor = changes.ranges[0].anchor;
    $("#cursor").text((anchor.line + 1) + ':' + anchor.ch);

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
            ch: res[0].column + (res[0].name && res[0].name.length || 1)
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
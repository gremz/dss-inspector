(function dssInspector() {
  // Check document is ready
  if (!document.body || !document.head) {
    setTimeout( function() {
      dssInspector();
    }, 200);
    return;
  }

  // set styles
  var $ = window.jQuery,
      $body = $('body'),
      inspectorCss =  '.alert {' +
                        'margin-bottom: 5px; ' +
                        'padding: 8px 35px 8px 14px;' +
                        'text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);' +
                        'border: 1px solid #fbeed5;' +
                        'border-radius: 4px;' +
                      '}' +
                      '.error {' +
                        'background-color: #f2dede;' +
                        'border-color: #eed3d7;' +
                        'color: #b94a48;' +
                      '}' +
                      '.success {' +
                        'background-color: #dff0d8;' +
                        'border-color: #d6e9c6;' +
                        'color: #468847;' +
                      '}' +
                      '.status {' +
                        'white-space: pre-wrap;' +
                      '}' +
                      '.dss_url_pattern_container.hidden .dss_inspector_url_pattern {' +
                        'display: none;' +
                      '}' +
                      '.dss_url_pattern_container.hidden .dss_url_pattern_visibility:after {' +
                        'content: "[Show]";' +
                      '}' +
                      '.dss_url_pattern_container .dss_url_pattern_visibility {' +
                        'color: #3a87ad;' +
                      '}' +
                      '.dss_url_pattern_container .dss_url_pattern_visibility:after {' +
                        'content: "[Hide]";' +
                      '}' +
                      '.dss_inspector_title {' +
                        'color: #468847;' +
                      '}';

  $('head').append('<style>' + inspectorCss + '</style>');
  $body.append('<pre class="status"></pre>');

  function checkMetering() {  
    // check for metering service
    var ms = window && window.opener && window.opener.trb && window.opener.trb.meteringService;
    if (!ms) {
      // showAlert('Oh snap! Metering does not live on this page', 'error'); //alpha
      setTimeout( function() {
        checkMetering();
      }, 2000);
      return;
    }

    // remove errors
    // $('.error').remove(); //alpha

    ms.getStatus( function(data) {
      // showAlert('Metering status returned successfully!', 'success'); //alpha
      var formattedData = JSON.stringify(data, null, '\t');
      formattedData = formattedData.replace(/urlPattern\"\:(\s\".+\")/gi, 'urlPattern": <span class="dss_url_pattern_container hidden"><span class="dss_url_pattern_visibility"></span><span class="dss_inspector_url_pattern" >$1</span></span>');// match pattern
      formattedData = formattedData.replace(/\"(.+\"\:)/gi, '<span class="dss_inspector_title">$1').replace(/\"(\:)/gi, ':</span>'); // match titles
      updateStatus('<h3>Metering Status</h3>' + formattedData  );

      $('.dss_url_pattern_visibility').click( function(e) {
        $(this).parent().toggleClass('hidden');
      });
    });
    setTimeout( function() {
      checkMetering();
    }, 4000);
  };
  checkMetering();

  function showAlert(msg, type) {
    $body.append('<div class="alert ' + (type ? type : '') + '">' + msg + '</div>');
  }
  function updateStatus(msg) {
    $('.status').html(msg);
  }
}());